import { describe, expect, it, vi } from 'vitest';
import type { AuditEventWriter } from '../../audit/audit.js';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminContentUnitOfWork } from '../unit-of-work.js';
import { AdminCategoryService } from './category.service.js';
import type { AdminCategoryRepository } from './repository.js';

const category = {
  id: 'category-1',
  name: 'دسته',
  slug: 'category',
  description: null,
  image: null,
  displayOrder: 0,
  status: ContentStatus.DRAFT,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
};

function fixture(overrides: Partial<AdminCategoryRepository> = {}) {
  const create = vi.fn(async () => category);
  const repository: AdminCategoryRepository = {
    list: vi.fn(),
    get: vi.fn(async () => category),
    create,
    update: vi.fn(),
    setStatus: vi.fn(),
    ...overrides,
  };
  const auditCreate = vi.fn(async (_args: unknown) => ({}));
  const audit = {
    securityAuditEvent: { create: auditCreate },
  } as AuditEventWriter;
  const unitOfWork = {
    run: vi.fn(async (work: (context: unknown) => Promise<unknown>) =>
      work({ categories: repository, audit }),
    ),
  } as unknown as AdminContentUnitOfWork;
  return {
    service: new AdminCategoryService(repository, unitOfWork),
    repository,
    create,
    auditCreate,
  };
}

describe('AdminCategoryService', () => {
  it('creates and audits a category through one unit-of-work callback', async () => {
    const { service, create, auditCreate } = fixture();
    await expect(
      service.create({ name: '  دسته  ', slug: 'category' }, 'admin-1'),
    ).resolves.toBe(category);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'دسته', slug: 'category' }),
    );
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'CATEGORY_CREATED',
        userId: 'admin-1',
      }),
    });
  });

  it('audits an idempotent publish without rewriting status', async () => {
    const published = { ...category, status: ContentStatus.PUBLISHED };
    const setStatus = vi.fn();
    const { service, auditCreate } = fixture({
      get: vi.fn(async () => published),
      setStatus,
    });
    await expect(service.publish(category.id, 'admin-1')).resolves.toBe(
      published,
    );
    expect(setStatus).not.toHaveBeenCalled();
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'CATEGORY_PUBLISHED',
        metadata: expect.objectContaining({
          fromStatus: 'PUBLISHED',
          toStatus: 'PUBLISHED',
        }),
      }),
    });
  });
});
