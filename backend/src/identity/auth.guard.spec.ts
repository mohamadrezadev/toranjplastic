import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  AdminGuard,
  AuthGuard,
  CapabilityGuard,
  CsrfGuard,
} from './auth.guard.js';
import { CAPABILITIES } from './capabilities.js';
import type { AuthenticatedRequest } from './identity.types.js';

const account = {
  id: 'u1',
  mobile: '+989123456789',
  displayName: 'Test',
  email: null,
  companyName: null,
  role: 'CUSTOMER' as const,
  status: 'ACTIVE' as const,
  createdAt: new Date(),
  lastLoginAt: null,
};
const context = (request: AuthenticatedRequest) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => vi.fn(),
    getClass: () => class TestController {},
  }) as unknown as ExecutionContext;

describe('authorization guards', () => {
  it('delegates authentication to the identity boundary', async () => {
    const identity = {
      authenticate: vi
        .fn()
        .mockResolvedValue({ account, sessionId: 's1', csrfDigest: 'c1' }),
    };
    await expect(
      new AuthGuard(identity as never).canActivate(
        context({} as AuthenticatedRequest),
      ),
    ).resolves.toBe(true);
    expect(identity.authenticate).toHaveBeenCalledOnce();
  });

  it('forbids a customer from admin operations', async () => {
    const request = {
      auth: { account, sessionId: 's1', csrfDigest: 'c1' },
    } as AuthenticatedRequest;
    await expect(
      new AdminGuard({} as never).canActivate(context(request)),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('accepts an authenticated administrator', async () => {
    const request = {
      auth: {
        account: { ...account, role: 'ADMIN' },
        sessionId: 's1',
        csrfDigest: 'c1',
      },
    } as AuthenticatedRequest;
    await expect(
      new AdminGuard({} as never).canActivate(context(request)),
    ).resolves.toBe(true);
  });
  it('authenticates an administrator when request auth is not preloaded', async () => {
    const identity = {
      authenticate: vi.fn().mockResolvedValue({
        account: { ...account, role: 'ADMIN' },
        sessionId: 's1',
        csrfDigest: 'c1',
      }),
    };
    await expect(
      new AdminGuard(identity as never).canActivate(
        context({} as AuthenticatedRequest),
      ),
    ).resolves.toBe(true);
  });

  it('rejects an unauthenticated administrator request', async () => {
    const identity = { authenticate: vi.fn().mockResolvedValue(null) };
    await expect(
      new AdminGuard(identity as never).canActivate(
        context({} as AuthenticatedRequest),
      ),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('delegates CSRF proof to the identity boundary and passes through on success', () => {
    const identity = { assertCsrf: vi.fn() };
    const request = {} as AuthenticatedRequest;
    expect(new CsrfGuard(identity as never).canActivate(context(request))).toBe(
      true,
    );
    expect(identity.assertCsrf).toHaveBeenCalledWith(request);
  });

  it('propagates a failed CSRF check instead of allowing the request', () => {
    const identity = {
      assertCsrf: vi.fn(() => {
        throw new Error('invalid csrf');
      }),
    };
    expect(() =>
      new CsrfGuard(identity as never).canActivate(
        context({} as AuthenticatedRequest),
      ),
    ).toThrow('invalid csrf');
  });

  it.each([
    ['ADMIN', CAPABILITIES.STAFF_MANAGEMENT, true],
    ['ADMIN', CAPABILITIES.INQUIRY_OPERATIONS, true],
    ['SALES', CAPABILITIES.INQUIRY_OPERATIONS, true],
    ['ADMIN', CAPABILITIES.QUOTATION_MANAGEMENT, true],
    ['SALES', CAPABILITIES.QUOTATION_MANAGEMENT, true],
    ['OPERATOR', CAPABILITIES.QUOTATION_MANAGEMENT, false],
    ['CUSTOMER', CAPABILITIES.QUOTATION_MANAGEMENT, false],
    ['SALES', CAPABILITIES.CONTENT_MANAGEMENT, false],
    ['OPERATOR', CAPABILITIES.CONTENT_MANAGEMENT, true],
    ['OPERATOR', CAPABILITIES.INQUIRY_OPERATIONS, false],
    ['CUSTOMER', CAPABILITIES.MANAGEMENT_ACCESS, false],
  ] as const)(
    'enforces %s capability %s',
    async (role, capability, allowed) => {
      const request = {
        auth: {
          account: { ...account, role },
          sessionId: 's1',
          csrfDigest: 'c1',
        },
      } as AuthenticatedRequest;
      const reflector = {
        getAllAndOverride: vi.fn().mockReturnValue(capability),
      };
      const result = new CapabilityGuard(
        {} as never,
        reflector as never,
      ).canActivate(context(request));
      if (allowed) await expect(result).resolves.toBe(true);
      else await expect(result).rejects.toMatchObject({ status: 403 });
    },
  );
  it('authenticates capability requests when request auth is not preloaded', async () => {
    const auth = {
      account: { ...account, role: 'SALES' as const },
      sessionId: 's1',
      csrfDigest: 'c1',
    };
    const identity = { authenticate: vi.fn().mockResolvedValue(auth) };
    const reflector = {
      getAllAndOverride: vi
        .fn()
        .mockReturnValue(CAPABILITIES.INQUIRY_OPERATIONS),
    };
    await expect(
      new CapabilityGuard(identity as never, reflector as never).canActivate(
        context({} as AuthenticatedRequest),
      ),
    ).resolves.toBe(true);
  });

  it('denies capability requests without required metadata', async () => {
    const request = {
      auth: {
        account: { ...account, role: 'ADMIN' },
        sessionId: 's1',
        csrfDigest: 'c1',
      },
    } as AuthenticatedRequest;
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    await expect(
      new CapabilityGuard({} as never, reflector as never).canActivate(
        context(request),
      ),
    ).rejects.toMatchObject({ status: 403 });
  });
  it('supports environments with Reflect.decorate', async () => {
    const originalDecorate = Reflect.decorate;
    Reflect.decorate = ((_decorators: Array<ClassDecorator>, target: object) =>
      target) as typeof Reflect.decorate;
    vi.resetModules();
    try {
      const guards = await import('./auth.guard.js');
      expect(guards.AuthGuard).toBeTypeOf('function');
      expect(guards.AdminGuard).toBeTypeOf('function');
      expect(guards.CapabilityGuard).toBeTypeOf('function');
      expect(guards.CsrfGuard).toBeTypeOf('function');
    } finally {
      Reflect.decorate = originalDecorate;
      vi.resetModules();
    }
  });
});
