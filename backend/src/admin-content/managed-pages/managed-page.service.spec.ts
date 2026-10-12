import { describe, expect, it, vi } from 'vitest';
import type { AuditEventWriter } from '../../audit/audit.js';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminContentUnitOfWork } from '../unit-of-work.js';
import { AdminManagedPageService } from './managed-page.service.js';
import type { AdminManagedPageRepository } from './repository.js';

const record = {
  id: 'page-1',
  title: 'صفحه',
  slug: 'page',
  summary: null,
  body: 'متن',
  images: [],
  displayOrder: 0,
  status: ContentStatus.DRAFT,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
};
function fixture(overrides: Partial<AdminManagedPageRepository> = {}) {
  const create = vi.fn(async () => record);
  const update = vi.fn(async () => record);
  const repository: AdminManagedPageRepository = {
    list: vi.fn(),
    get: vi.fn(async () => record),
    create,
    update,
    setStatus: vi.fn(),
    ...overrides,
  };
  const auditCreate = vi.fn(async () => ({}));
  const audit = {
    securityAuditEvent: { create: auditCreate },
  } as AuditEventWriter;
  const unitOfWork = {
    run: vi.fn(async (work: (context: unknown) => Promise<unknown>) =>
      work({ managedPages: repository, audit }),
    ),
  } as unknown as AdminContentUnitOfWork;
  return {
    service: new AdminManagedPageService(repository, unitOfWork),
    create,
    update,
    auditCreate,
  };
}

describe('AdminManagedPageService', () => {
  it('creates a page with explicit body and images', async () => {
    const { service, create, auditCreate } = fixture();
    await service.create(
      {
        title: ' صفحه ',
        slug: 'page',
        body: 'متن',
        images: [{ url: '/p.webp', alt: 'p' }],
      },
      'admin-1',
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'صفحه',
        body: 'متن',
        images: [{ url: '/p.webp', alt: 'p' }],
      }),
    );
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'MANAGED_PAGE_CREATED' }),
    });
  });
  it('updates page fields and audits', async () => {
    const { service, update, auditCreate } = fixture();
    await service.update(record.id, { summary: ' خلاصه ' }, 'admin-1');
    expect(update).toHaveBeenCalledWith(record.id, { summary: 'خلاصه' });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'MANAGED_PAGE_UPDATED' }),
    });
  });
  it('audits an idempotent archive without writing status', async () => {
    const archived = { ...record, status: ContentStatus.ARCHIVED };
    const setStatus = vi.fn();
    const { service, auditCreate } = fixture({
      get: vi.fn(async () => archived),
      setStatus,
    });
    await service.archive(record.id, 'admin-1');
    expect(setStatus).not.toHaveBeenCalled();
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'MANAGED_PAGE_ARCHIVED' }),
    });
  });
});
