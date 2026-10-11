import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { loadEnvironment } from '../config/environment.js';
import type { User } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { digestToken, hashPassword, normalizeIranianMobile, randomToken, readCookie, verifyPassword } from './identity.security.js';
import type { AuthenticatedRequest, PublicAccount } from './identity.types.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { PasswordLoginDto } from './dto/login.dto.js';

const SESSION_COOKIE = 'toranj_session';
const CSRF_COOKIE = 'toranj_csrf';
@Injectable()
export class IdentityService {
  private readonly environment = loadEnvironment(process.env);
  private readonly attempts = new Map<string, { count: number; resetAt: number }>();
  private readonly dummyHash = hashPassword('constant-invalid-password');
  constructor(private readonly prisma: PrismaService) {}

  toPublic(user: User): PublicAccount {
    return { id: user.id, mobile: user.mobile, displayName: user.displayName, email: user.email, companyName: user.companyName, role: user.role, status: user.status, createdAt: user.createdAt, lastLoginAt: user.lastLoginAt };
  }

  assertOrigin(origin: string | undefined): void {
    if (origin !== this.environment.frontendOrigin) throw new UnauthorizedException('درخواست از مبدأ مجاز ارسال نشده است.');
  }

  private rateLimit(route: string, ip: string, mobile: string): void {
    const key = `${route}:${ip}:${digestToken(mobile)}`;
    const now = Date.now();
    const current = this.attempts.get(key);
    if (!current || current.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + this.environment.auth.loginWindowSeconds * 1000 });
      return;
    }
    if (current.count >= this.environment.auth.loginLimit) throw new HttpException('تعداد تلاش‌ها بیش از حد مجاز است.', HttpStatus.TOO_MANY_REQUESTS);
    current.count += 1;
  }

  async register(input: RegisterDto, ip: string): Promise<PublicAccount> {
    const mobile = normalizeIranianMobile(input.mobile);
    this.rateLimit('register', ip, mobile);
    const passwordHash = await hashPassword(input.password);
    try {
      const user = await this.prisma.user.create({ data: { mobile, displayName: input.displayName.trim(), email: input.email?.trim() || null, companyName: input.companyName?.trim() || null, password: { create: { passwordHash } } } });
      return this.toPublic(user);
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') throw new ConflictException('امکان ایجاد حساب با اطلاعات واردشده وجود ندارد.');
      throw error;
    }
  }

  async login(input: PasswordLoginDto, ip: string, cookieHeader: string | undefined, response: Response): Promise<PublicAccount> {
    let mobile: string;
    try { mobile = normalizeIranianMobile(input.mobile); } catch { mobile = '+989000000000'; }
    this.rateLimit('login', ip, mobile);
    const found = await this.prisma.user.findUnique({ where: { mobile }, include: { password: true } });
    const valid = await verifyPassword(found?.password?.passwordHash ?? await this.dummyHash, input.password).catch(() => false);
    if (!found || !valid || found.status !== 'ACTIVE') throw new UnauthorizedException('شماره موبایل یا رمز عبور صحیح نیست.');
    const sessionToken = randomToken();
    const csrfToken = randomToken();
    const expiresAt = new Date(Date.now() + this.environment.auth.sessionDays * 86_400_000);
    const oldToken = readCookie(cookieHeader, SESSION_COOKIE);
    await this.prisma.$transaction([
      ...(oldToken ? [this.prisma.authSession.updateMany({ where: { tokenDigest: digestToken(oldToken), revokedAt: null }, data: { revokedAt: new Date() } })] : []),
      this.prisma.authSession.create({ data: { userId: found.id, tokenDigest: digestToken(sessionToken), csrfDigest: digestToken(csrfToken), expiresAt } }),
      this.prisma.user.update({ where: { id: found.id }, data: { lastLoginAt: new Date() } }),
    ]);
    this.setCookies(response, sessionToken, csrfToken, expiresAt);
    return this.toPublic({ ...found, lastLoginAt: new Date() });
  }

  private setCookies(response: Response, session: string, csrf: string, expires: Date) {
    const common = { secure: this.environment.auth.cookieSecure, sameSite: 'lax' as const, path: '/', expires };
    response.cookie(SESSION_COOKIE, session, { ...common, httpOnly: true });
    response.cookie(CSRF_COOKIE, csrf, { ...common, httpOnly: false });
  }

  issueCsrf(response: Response) {
    const token = randomToken();
    response.cookie(CSRF_COOKIE, token, { httpOnly: false, secure: this.environment.auth.cookieSecure, sameSite: 'lax', path: '/', maxAge: 900_000 });
    return { csrfToken: token };
  }

  async authenticate(request: AuthenticatedRequest) {
    const raw = readCookie(request.headers.cookie, SESSION_COOKIE);
    if (!raw) throw new UnauthorizedException('نشست معتبر نیست.');
    const session = await this.prisma.authSession.findUnique({ where: { tokenDigest: digestToken(raw) }, include: { user: true } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.status !== 'ACTIVE') throw new UnauthorizedException('نشست معتبر نیست.');
    request.auth = { account: this.toPublic(session.user), sessionId: session.id, csrfDigest: session.csrfDigest };
    return request.auth;
  }

  assertCsrf(request: AuthenticatedRequest): void {
    const cookie = readCookie(request.headers.cookie, CSRF_COOKIE);
    const header = request.headers['x-csrf-token'];
    if (!cookie || typeof header !== 'string' || cookie !== header || digestToken(cookie) !== request.auth?.csrfDigest) throw new UnauthorizedException('اعتبار درخواست امنیتی تأیید نشد.');
  }

  async logout(request: AuthenticatedRequest, response: Response) {
    this.assertCsrf(request);
    await this.prisma.authSession.update({ where: { id: request.auth!.sessionId }, data: { revokedAt: new Date() } });
    response.clearCookie(SESSION_COOKIE, { path: '/' });
    response.clearCookie(CSRF_COOKIE, { path: '/' });
  }

  async bootstrapAdmin(mobileInput: string, displayName: string, password: string) {
    const mobile = normalizeIranianMobile(mobileInput);
    const passwordHash = await hashPassword(password);
    return this.prisma.$transaction(async (transaction) => {
      if (await transaction.user.count({ where: { role: 'ADMIN' } })) throw new Error('ADMIN_ALREADY_EXISTS');
      const existing = await transaction.user.findUnique({ where: { mobile } });
      const user = existing
        ? await transaction.user.update({ where: { id: existing.id }, data: { role: 'ADMIN', status: 'ACTIVE', displayName: displayName.trim(), password: { upsert: { create: { passwordHash }, update: { passwordHash } } } } })
        : await transaction.user.create({ data: { mobile, displayName: displayName.trim(), role: 'ADMIN', password: { create: { passwordHash } } } });
      await transaction.securityAuditEvent.create({ data: { action: 'INITIAL_ADMIN_BOOTSTRAPPED', userId: user.id, metadata: { source: 'operator-command' } } });
      return { id: user.id };
    });
  }
}
