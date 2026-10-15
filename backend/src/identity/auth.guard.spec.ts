import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminGuard, AuthGuard, CapabilityGuard, CsrfGuard } from './auth.guard.js';
import { CAPABILITIES } from './capabilities.js';
import type { AuthenticatedRequest } from './identity.types.js';

const account = { id: 'u1', mobile: '+989123456789', displayName: 'Test', email: null, companyName: null, role: 'CUSTOMER' as const, status: 'ACTIVE' as const, createdAt: new Date(), lastLoginAt: null };
const context = (request: AuthenticatedRequest) => ({ switchToHttp: () => ({ getRequest: () => request }), getHandler: () => vi.fn(), getClass: () => class TestController {} }) as unknown as ExecutionContext;

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

  it.each([
    ['ADMIN', CAPABILITIES.STAFF_MANAGEMENT, true],
    ['ADMIN', CAPABILITIES.INQUIRY_OPERATIONS, true],
    ['SALES', CAPABILITIES.INQUIRY_OPERATIONS, true],
    ['SALES', CAPABILITIES.CONTENT_MANAGEMENT, false],
    ['OPERATOR', CAPABILITIES.CONTENT_MANAGEMENT, true],
    ['OPERATOR', CAPABILITIES.INQUIRY_OPERATIONS, false],
    ['CUSTOMER', CAPABILITIES.MANAGEMENT_ACCESS, false],
  ] as const)('enforces %s capability %s', async (role, capability, allowed) => {
    const request = { auth: { account: { ...account, role }, sessionId: 's1', csrfDigest: 'c1' } } as AuthenticatedRequest;
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(capability) };
    const result = new CapabilityGuard({} as never, reflector as never).canActivate(context(request));
    if (allowed) await expect(result).resolves.toBe(true); else await expect(result).rejects.toMatchObject({ status: 403 });
  });
});
