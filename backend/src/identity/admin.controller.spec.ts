import { describe, expect, it } from 'vitest';
import type { AuthenticatedRequest } from './identity.types.js';
import { AdminController } from './admin.controller.js';

describe('AdminController', () => {
  it('returns only the authenticated public account and authorization flag', () => {
    const account = { id: 'sales-1', role: 'SALES' };
    const request = { auth: { account } } as unknown as AuthenticatedRequest;

    expect(new AdminController().access(request)).toEqual({
      account,
      authorized: true,
    });
  });
});
