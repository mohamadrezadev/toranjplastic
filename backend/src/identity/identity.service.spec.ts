import { describe, expect, it, vi } from 'vitest';
import { hashPassword } from './identity.security.js';
import { IdentityService } from './identity.service.js';
import type { AuthenticatedRequest } from './identity.types.js';

const user = { id: 'u1', mobile: '+989123456789', displayName: 'Test', email: null, companyName: null, role: 'CUSTOMER' as const, status: 'ACTIVE' as const, lastLoginAt: null, createdAt: new Date(), updatedAt: new Date() };

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
  it('registers only database-default customer fields and omits password from the DTO', async () => {
    const prisma = prismaMock();
    prisma.user.create.mockResolvedValue(user);
    const result = await new IdentityService(prisma as never).register({ mobile: '09123456789', displayName: ' Test ', password: 'strong-password' }, '127.0.0.1');
    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data).not.toHaveProperty('role');
    expect(data.password.create.passwordHash).toMatch(/^\$argon2id\$/);
    expect(result).not.toHaveProperty('password');
  });

  it('uses one generic unauthorized result for an unknown login', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(new IdentityService(prisma as never).login({ mobile: '09123456789', password: 'incorrect-password' }, '127.0.0.1', undefined, { cookie: vi.fn() } as never)).rejects.toMatchObject({ status: 401 });
    expect(prisma.authSession.create).not.toHaveBeenCalled();
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

  it('rejects missing CSRF proof without revoking the session', async () => {
    const prisma = prismaMock();
    const request = { headers: {}, auth: { account: user, sessionId: 's1', csrfDigest: 'digest' } } as unknown as AuthenticatedRequest;
    await expect(new IdentityService(prisma as never).logout(request, { clearCookie: vi.fn() } as never)).rejects.toMatchObject({ status: 401 });
    expect(prisma.authSession.update).not.toHaveBeenCalled();
  });

  it('fails closed when an administrator already exists', async () => {
    const prisma = prismaMock();
    prisma.user.count.mockResolvedValue(1);
    await expect(new IdentityService(prisma as never).bootstrapAdmin('09123456789', 'Admin', 'strong-password')).rejects.toThrow('ADMIN_ALREADY_EXISTS');
    expect(prisma.securityAuditEvent.create).not.toHaveBeenCalled();
  });
});
