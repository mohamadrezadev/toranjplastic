import { describe, expect, it, vi } from 'vitest';
import { recordAuditEvent } from './audit.js';

describe('recordAuditEvent', () => {
  it('writes an audit row with the action, actor and metadata', async () => {
    const create = vi.fn(async () => ({}));
    const client = { securityAuditEvent: { create } };

    await recordAuditEvent(client, 'PRODUCT_PUBLISHED', 'admin-1', { entity: 'Product', id: 'p1' });

    expect(create).toHaveBeenCalledWith({
      data: { action: 'PRODUCT_PUBLISHED', userId: 'admin-1', metadata: { entity: 'Product', id: 'p1' } },
    });
  });

  it('allows a null actor and omitted metadata', async () => {
    const create = vi.fn(async () => ({}));
    const client = { securityAuditEvent: { create } };

    await recordAuditEvent(client, 'SYSTEM_EVENT', null);

    expect(create).toHaveBeenCalledWith({
      data: { action: 'SYSTEM_EVENT', userId: null, metadata: undefined },
    });
  });
});
