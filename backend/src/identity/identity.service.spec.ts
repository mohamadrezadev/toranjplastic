import { describe, expect, it, vi } from 'vitest';
import { hashPassword } from './identity.security.js';
import { IdentityService } from './identity.service.js';
import type { AuthenticatedRequest } from './identity.types.js';

const user = { id: 'u1', mobile: '+989123456789', displayName: 'Test', email: null, companyName: null, role: 'CUSTOMER' as const, status: 'ACTIVE' as const, version: 0, lastLoginAt: null, createdAt: new Date(), updatedAt: new Date() };

function prismaMock() {
  const mock = {
    user: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
    authSession: { create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
    securityAuditEvent: { create: vi.fn() },
    $transaction: vi.fn(),
  };
  mock.$transaction.mockImplementation(async (work: unknown) => typeof work === 'function' ? (work as (value: typeof mock) => unknown)(mock) : Promise.all(work as Promise<unknown>[]));
  return mock;
}

describe('IdentityService', () => {
  it('maps role capabilities and enforces the configured origin', () => {
    const service = new IdentityService(prismaMock() as never);
    expect(service.toPublic({ ...user, role: 'SALES' })).toMatchObject({
      role: 'SALES',
      capabilities: ['MANAGEMENT_ACCESS', 'INQUIRY_OPERATIONS', 'QUOTATION_MANAGEMENT'],
    });
    expect(() => service.assertOrigin('http://localhost:3000')).not.toThrow();
    expect(() => service.assertOrigin('https://attacker.example')).toThrow();
  });

  it('registers only database-default customer fields and omits password from the DTO', async () => {
    const prisma = prismaMock();
    prisma.user.create.mockResolvedValue(user);
    const result = await new IdentityService(prisma as never).register({ mobile: '09123456789', displayName: ' Test ', password: 'strong-password' }, '127.0.0.1');
    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data).not.toHaveProperty('role');
    expect(data.password.create.passwordHash).toMatch(/^\$argon2id\$/);
    expect(result).not.toHaveProperty('password');
  });

  it('normalizes optional registration fields and returns a generic duplicate conflict', async () => {
    const prisma = prismaMock();
    prisma.user.create.mockResolvedValueOnce(user).mockRejectedValueOnce({ code: 'P2002' });
    const service = new IdentityService(prisma as never);
    await service.register(
      {
        mobile: '09123456789',
        displayName: ' Test ',
        password: 'strong-password',
        email: ' test@example.com ',
        companyName: ' شرکت ',
      },
      '127.0.0.1',
    );
    expect(prisma.user.create.mock.calls[0][0].data).toMatchObject({
      email: 'test@example.com',
      companyName: 'شرکت',
    });
    await expect(
      service.register(
        { mobile: '09123456789', displayName: 'Test', password: 'strong-password' },
        '127.0.0.2',
      ),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('rethrows unexpected registration persistence errors', async () => {
    const prisma = prismaMock();
    const failure = new Error('database unavailable');
    prisma.user.create.mockRejectedValue(failure);
    await expect(
      new IdentityService(prisma as never).register(
        { mobile: '09123456789', displayName: 'Test', password: 'strong-password' },
        '127.0.0.1',
      ),
    ).rejects.toBe(failure);
  });

  it('uses one generic unauthorized result for an unknown login', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(new IdentityService(prisma as never).login({ mobile: '09123456789', password: 'incorrect-password' }, '127.0.0.1', undefined, { cookie: vi.fn() } as never)).rejects.toMatchObject({ status: 401 });
    expect(prisma.authSession.create).not.toHaveBeenCalled();
  });

  it('increments and then enforces the bounded login rate limit', async () => {
    vi.stubEnv('AUTH_LOGIN_LIMIT', '2');
    try {
      const prisma = prismaMock();
      prisma.user.findUnique.mockResolvedValue(null);
      const service = new IdentityService(prisma as never);
      const input = { mobile: '09123456789', password: 'incorrect-password' };
      const response = { cookie: vi.fn() } as never;
      await expect(service.login(input, '127.0.0.1', undefined, response)).rejects.toMatchObject({ status: 401 });
      await expect(service.login(input, '127.0.0.1', undefined, response)).rejects.toMatchObject({ status: 401 });
      await expect(service.login(input, '127.0.0.1', undefined, response)).rejects.toMatchObject({ status: 429 });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('creates opaque cookies and returns no credential after valid login', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue({ ...user, password: { passwordHash: await hashPassword('strong-password') } });
    prisma.user.update.mockResolvedValue(user);
    prisma.authSession.create.mockResolvedValue({});
    const response = { cookie: vi.fn() };
    const result = await new IdentityService(prisma as never).login({ mobile: '09123456789', password: 'strong-password' }, '127.0.0.1', undefined, response as never);
    expect(response.cookie).toHaveBeenCalledTimes(2);
    expect(prisma.authSession.create.mock.calls[0][0].data.tokenDigest).toHaveLength(64);
    expect(result).not.toHaveProperty('password');
  });

  it('revokes an existing session token during login and rejects inactive accounts', async () => {
    const prisma = prismaMock();
    const passwordHash = await hashPassword('strong-password');
    prisma.user.findUnique
      .mockResolvedValueOnce({ ...user, password: { passwordHash } })
      .mockResolvedValueOnce({ ...user, status: 'DISABLED', password: { passwordHash } });
    prisma.user.update.mockResolvedValue(user);
    prisma.authSession.updateMany.mockResolvedValue({ count: 1 });
    prisma.authSession.create.mockResolvedValue({});
    const service = new IdentityService(prisma as never);
    await service.login(
      { mobile: '09123456789', password: 'strong-password' },
      '127.0.0.1',
      'toranj_session=old-session',
      { cookie: vi.fn() } as never,
    );
    expect(prisma.authSession.updateMany).toHaveBeenCalledOnce();
    await expect(
      service.login(
        { mobile: 'invalid', password: 'strong-password' },
        '127.0.0.2',
        undefined,
        { cookie: vi.fn() } as never,
      ),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('issues CSRF cookies and authenticates only active non-expired sessions', async () => {
    const prisma = prismaMock();
    const response = { cookie: vi.fn() };
    const service = new IdentityService(prisma as never);
    expect(service.issueCsrf(response as never).csrfToken).toBeTypeOf('string');
    expect(response.cookie).toHaveBeenCalledOnce();

    await expect(
      service.authenticate({ headers: {} } as AuthenticatedRequest),
    ).rejects.toMatchObject({ status: 401 });
    prisma.authSession.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.authenticate({ headers: { cookie: 'toranj_session=x' } } as AuthenticatedRequest),
    ).rejects.toMatchObject({ status: 401 });
    prisma.authSession.findUnique.mockResolvedValueOnce({
      id: 's1', revokedAt: null, expiresAt: new Date(Date.now() + 60_000),
      csrfDigest: 'csrf', user,
    });
    const request = {
      headers: { cookie: 'toranj_session=x' },
    } as AuthenticatedRequest;
    await expect(service.authenticate(request)).resolves.toMatchObject({
      sessionId: 's1',
      account: { id: 'u1' },
    });
    expect(request.auth).toBeDefined();
  });

  it('rejects revoked, expired, and inactive sessions', async () => {
    const prisma = prismaMock();
    const service = new IdentityService(prisma as never);
    const base = {
      id: 's1', revokedAt: null, expiresAt: new Date(Date.now() + 60_000),
      csrfDigest: 'csrf', user,
    };
    for (const session of [
      { ...base, revokedAt: new Date() },
      { ...base, expiresAt: new Date(0) },
      { ...base, user: { ...user, status: 'DISABLED' } },
    ]) {
      prisma.authSession.findUnique.mockResolvedValueOnce(session);
      await expect(
        service.authenticate({ headers: { cookie: 'toranj_session=x' } } as AuthenticatedRequest),
      ).rejects.toMatchObject({ status: 401 });
    }
  });

  it('rejects missing CSRF proof without revoking the session', async () => {
    const prisma = prismaMock();
    const request = { headers: {}, auth: { account: user, sessionId: 's1', csrfDigest: 'digest' } } as unknown as AuthenticatedRequest;
    await expect(new IdentityService(prisma as never).logout(request, { clearCookie: vi.fn() } as never)).rejects.toMatchObject({ status: 401 });
    expect(prisma.authSession.update).not.toHaveBeenCalled();
  });

  it('accepts matching CSRF proof, logs out, and clears both cookies', async () => {
    const prisma = prismaMock();
    prisma.authSession.update.mockResolvedValue({});
    const token = 'csrf-token';
    const request = {
      headers: {
        cookie: `toranj_session=session; toranj_csrf=${token}`,
        'x-csrf-token': token,
      },
      auth: { account: user, sessionId: 's1', csrfDigest: (await import('./identity.security.js')).digestToken(token) },
    } as unknown as AuthenticatedRequest;
    const response = { clearCookie: vi.fn() };
    await new IdentityService(prisma as never).logout(request, response as never);
    expect(prisma.authSession.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 's1' } }),
    );
    expect(response.clearCookie).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed CSRF header variants', () => {
    const service = new IdentityService(prismaMock() as never);
    const base = { account: user, sessionId: 's1', csrfDigest: 'wrong' };
    for (const headers of [
      { cookie: 'toranj_csrf=csrf', 'x-csrf-token': ['csrf'] },
      { cookie: 'toranj_csrf=csrf', 'x-csrf-token': 'other' },
      { cookie: 'toranj_csrf=csrf', 'x-csrf-token': 'csrf' },
    ]) {
      expect(() => service.assertCsrf({ headers, auth: base } as unknown as AuthenticatedRequest)).toThrow();
    }
  });

  it('fails closed when an administrator already exists', async () => {
    const prisma = prismaMock();
    prisma.user.count.mockResolvedValue(1);
    await expect(new IdentityService(prisma as never).bootstrapAdmin('09123456789', 'Admin', 'strong-password')).rejects.toThrow('ADMIN_ALREADY_EXISTS');
    expect(prisma.securityAuditEvent.create).not.toHaveBeenCalled();
  });

  it('bootstraps by promoting an existing user or creating a new administrator', async () => {
    const existingPrisma = prismaMock();
    existingPrisma.user.count.mockResolvedValue(0);
    existingPrisma.user.findUnique.mockResolvedValue(user);
    existingPrisma.user.update.mockResolvedValue({ ...user, role: 'ADMIN' });
    existingPrisma.securityAuditEvent.create.mockResolvedValue({});
    await expect(
      new IdentityService(existingPrisma as never).bootstrapAdmin(
        '09123456789', ' Admin ', 'strong-password',
      ),
    ).resolves.toEqual({ id: 'u1' });
    expect(existingPrisma.user.update).toHaveBeenCalledOnce();

    const newPrisma = prismaMock();
    newPrisma.user.count.mockResolvedValue(0);
    newPrisma.user.findUnique.mockResolvedValue(null);
    newPrisma.user.create.mockResolvedValue({ ...user, id: 'admin-2', role: 'ADMIN' });
    newPrisma.securityAuditEvent.create.mockResolvedValue({});
    await expect(
      new IdentityService(newPrisma as never).bootstrapAdmin(
        '09123456789', 'Admin', 'strong-password',
      ),
    ).resolves.toEqual({ id: 'admin-2' });
    expect(newPrisma.user.create).toHaveBeenCalledOnce();
  });
});
