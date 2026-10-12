import { describe, expect, it, vi } from 'vitest';
import type { AuditEventWriter } from '../../audit/audit.js';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminContentUnitOfWork } from '../unit-of-work.js';
import { AdminInjectionServiceService } from './injection-service.service.js';
import type { AdminInjectionServiceRepository } from './repository.js';

const record = {
  id: 'service-1',
  name: 'خدمت',
  slug: 'service',
  summary: null,
  description: null,
  images: [],
  specifications: [],
  ctaLabel: null,
  ctaHref: null,
  displayOrder: 0,
  status: ContentStatus.DRAFT,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
};
function fixture(overrides: Partial<AdminInjectionServiceRepository> = {}) {
  const create = vi.fn(async () => record);
  const update = vi.fn(async () => record);
  const repository: AdminInjectionServiceRepository = {
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
      work({ injectionServices: repository, audit }),
    ),
  } as unknown as AdminContentUnitOfWork;
  return {
    service: new AdminInjectionServiceService(repository, unitOfWork),
    create,
    update,
    auditCreate,
  };
}

describe('AdminInjectionServiceService', () => {
  it('creates an explicitly mapped service and audit record', async () => {
    const { service, create, auditCreate } = fixture();
    await service.create(
      {
        name: '  خدمت  ',
        slug: 'service',
        ctaLabel: ' تماس ',
        ctaHref: '/contact',
        images: [{ url: '/x.webp', alt: 'x' }],
        specifications: [{ label: 'ظرفیت', value: 'نمونه' }],
      },
      'admin-1',
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'خدمت',
        ctaLabel: 'تماس',
        ctaHref: '/contact',
        images: [{ url: '/x.webp', alt: 'x' }],
      }),
    );
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'INJECTION_SERVICE_CREATED' }),
    });
  });
  it('updates only supplied fields and audits', async () => {
    const { service, update, auditCreate } = fixture();
    await service.update(record.id, { description: ' توضیح ' }, 'admin-1');
    expect(update).toHaveBeenCalledWith(record.id, { description: 'توضیح' });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'INJECTION_SERVICE_UPDATED' }),
    });
  });
  it('audits an idempotent publish without writing status', async () => {
    const published = { ...record, status: ContentStatus.PUBLISHED };
    const setStatus = vi.fn();
    const { service, auditCreate } = fixture({
      get: vi.fn(async () => published),
      setStatus,
    });
    await service.publish(record.id, 'admin-1');
    expect(setStatus).not.toHaveBeenCalled();
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'INJECTION_SERVICE_PUBLISHED',
        metadata: expect.objectContaining({
          fromStatus: 'PUBLISHED',
          toStatus: 'PUBLISHED',
        }),
      }),
    });
  });
});
