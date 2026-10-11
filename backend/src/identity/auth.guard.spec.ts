import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminGuard, AuthGuard, CsrfGuard } from './auth.guard.js';
import type { AuthenticatedRequest } from './identity.types.js';

const account = { id: 'u1', mobile: '+989123456789', displayName: 'Test', email: null, companyName: null, role: 'CUSTOMER' as const, status: 'ACTIVE' as const, createdAt: new Date(), lastLoginAt: null };
const context = (request: AuthenticatedRequest) => ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

describe('authorization guards', () => {
  it('delegates authentication to the identity boundary', async () => {
    const identity = { authenticate: vi.fn().mockResolvedValue({ account, sessionId: 's1', csrfDigest: 'c1' }) };
    await expect(new AuthGuard(identity as never).canActivate(context({} as AuthenticatedRequest))).resolves.toBe(true);
    expect(identity.authenticate).toHaveBeenCalledOnce();
  });

  it('forbids a customer from admin operations', async () => {
    const request = { auth: { account, sessionId: 's1', csrfDigest: 'c1' } } as AuthenticatedRequest;
    await expect(new AdminGuard({} as never).canActivate(context(request))).rejects.toMatchObject({ status: 403 });
  });

  it('accepts an authenticated administrator', async () => {
    const request = { auth: { account: { ...account, role: 'ADMIN' }, sessionId: 's1', csrfDigest: 'c1' } } as AuthenticatedRequest;
    await expect(new AdminGuard({} as never).canActivate(context(request))).resolves.toBe(true);
  });

  it('delegates CSRF proof to the identity boundary and passes through on success', () => {
    const identity = { assertCsrf: vi.fn() };
    const request = {} as AuthenticatedRequest;
    expect(new CsrfGuard(identity as never).canActivate(context(request))).toBe(true);
    expect(identity.assertCsrf).toHaveBeenCalledWith(request);
  });

  it('propagates a failed CSRF check instead of allowing the request', () => {
    const identity = { assertCsrf: vi.fn(() => { throw new Error('invalid csrf'); }) };
    expect(() => new CsrfGuard(identity as never).canActivate(context({} as AuthenticatedRequest))).toThrow('invalid csrf');
  });
});
