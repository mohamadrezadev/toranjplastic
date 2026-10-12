import { describe, expect, it, vi } from 'vitest';
import type { AuditEventWriter } from '../../audit/audit.js';
import { ContentStatus } from '../../generated/prisma/enums.js';
import { transitionStatus, withConflictHandling } from './mutations.js';

function auditWriter() {
  const create = vi.fn(async (_args: unknown) => ({}));
  return {
    audit: { securityAuditEvent: { create } } as AuditEventWriter,
    create,
  };
}

describe('admin content mutation helpers', () => {
  it('translates Prisma unique violations without hiding unrelated failures', async () => {
    await expect(
      withConflictHandling(async () => Promise.reject({ code: 'P2002' })),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      withConflictHandling(async () =>
        Promise.reject(new Error('storage unavailable')),
      ),
    ).rejects.toThrow('storage unavailable');
  });

  it('audits an idempotent lifecycle action without rewriting status', async () => {
    const current = {
      id: 'category-1',
      slug: 'category',
      status: ContentStatus.PUBLISHED as ContentStatus,
    };
    const get = vi.fn(async () => current);
    const setStatus = vi.fn();
    const { audit, create } = auditWriter();

    const result = await transitionStatus({
      id: current.id,
      target: ContentStatus.PUBLISHED,
      publishedAt: new Date('2026-10-11T00:00:00.000Z'),
      actorId: 'admin-1',
      action: 'CATEGORY_PUBLISHED',
      audit,
      get,
      setStatus,
    });

    expect(result).toBe(current);
    expect(setStatus).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'CATEGORY_PUBLISHED',
        userId: 'admin-1',
        metadata: expect.objectContaining({
          fromStatus: 'PUBLISHED',
          toStatus: 'PUBLISHED',
        }),
      }),
    });
  });

  it('persists and audits a lifecycle transition with its previous status', async () => {
    const current = {
      id: 'category-1',
      slug: 'category',
      status: ContentStatus.DRAFT as ContentStatus,
    };
    const updated = { ...current, status: ContentStatus.ARCHIVED };
    const setStatus = vi.fn(async () => updated);
    const { audit, create } = auditWriter();

    const result = await transitionStatus({
      id: current.id,
      target: ContentStatus.ARCHIVED,
      publishedAt: null,
      actorId: 'admin-1',
      action: 'CATEGORY_ARCHIVED',
      audit,
      get: vi.fn(async () => current),
      setStatus,
    });

    expect(result).toBe(updated);
    expect(setStatus).toHaveBeenCalledWith(
      current.id,
      ContentStatus.ARCHIVED,
      null,
    );
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'CATEGORY_ARCHIVED',
        metadata: expect.objectContaining({
          fromStatus: 'DRAFT',
          toStatus: 'ARCHIVED',
        }),
      }),
    });
  });
});
