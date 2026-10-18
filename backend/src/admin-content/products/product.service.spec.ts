import { describe, expect, it, vi } from 'vitest';
import type { AuditEventWriter } from '../../audit/audit.js';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminContentUnitOfWork } from '../unit-of-work.js';
import { AdminProductService } from './product.service.js';
import type { AdminProductRepository } from './repository.js';

const product = {
  id: 'product-1',
  name: 'محصول',
  slug: 'product',
  summary: null,
  description: null,
  categoryId: null,
  images: [],
  specifications: [],
  featured: false,
  displayOrder: 0,
  status: ContentStatus.DRAFT,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
  contentVersion: 0,
};

function fixture(overrides: Partial<AdminProductRepository> = {}) {
  const create = vi.fn(async () => product);
  const update = vi.fn(async () => product);
  const repository: AdminProductRepository = {
    list: vi.fn(),
    get: vi.fn(async () => product),
    create,
    update,
    setStatus: vi.fn(),
    ...overrides,
  };
  const auditCreate = vi.fn(async (_args: unknown) => ({}));
  const audit = {
    securityAuditEvent: { create: auditCreate },
  } as AuditEventWriter;
  const media = {
    prepareProduct: vi.fn(async () => ({
      projection: [{ url: 'https://media.example/api/v1/media/public/media-1/detail', alt: 'محصول', width: 800, height: 600 }],
      references: [{ mediaAssetId: 'media-1', alt: 'محصول', position: 0 }],
    })),
    replaceProductReferences: vi.fn(async () => undefined),
    productHasReferences: vi.fn(async () => false),
    assertProductPublishable: vi.fn(async () => undefined),
  };
  const unitOfWork = {
    run: vi.fn(async (work: (context: unknown) => Promise<unknown>) =>
      work({
        products: repository,
        audit,
        media,
      }),
    ),
  } as unknown as AdminContentUnitOfWork;
  return {
    service: new AdminProductService(repository, unitOfWork),
    repository,
    create,
    update,
    auditCreate,
    media,
  };
}

describe('AdminProductService', () => {
  it('creates and audits a product with explicit media, specifications, and category mapping', async () => {
    const { service, create, auditCreate } = fixture();
    await expect(
      service.create(
        {
          name: '  محصول  ',
          slug: 'product',
          categoryId: 'category-1',
          featured: true,
          images: [{ url: '/product.webp', alt: 'محصول', width: 800 }],
          specifications: [{ label: 'وزن', value: '۱۰ گرم' }],
        },
        'admin-1',
      ),
    ).resolves.toBe(product);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'محصول',
        categoryId: 'category-1',
        featured: true,
        images: [{ url: '/product.webp', alt: 'محصول', width: 800 }],
        specifications: [{ label: 'وزن', value: '۱۰ گرم' }],
      }),
    );
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'PRODUCT_CREATED',
        userId: 'admin-1',
      }),
    });
  });

  it('updates and audits only the supplied product fields', async () => {
    const { service, update, auditCreate } = fixture();
    await expect(
      service.update(
        product.id,
        { name: '  محصول تازه  ', featured: true },
        'admin-1',
      ),
    ).resolves.toBe(product);
    expect(update).toHaveBeenCalledWith(product.id, {
      name: 'محصول تازه',
      featured: true,
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'PRODUCT_UPDATED',
        userId: 'admin-1',
      }),
    });
  });

  it('creates managed Product projection, version and references atomically', async () => {
    const { service, create, media } = fixture();

    await service.create({
      name: 'محصول',
      slug: 'product',
      images: [{ mediaAssetId: 'media-1', alt: 'محصول' }],
    }, 'admin-1');

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      contentVersion: 1,
      images: [expect.objectContaining({
        url: 'https://media.example/api/v1/media/public/media-1/detail',
      })],
    }));
    expect(media.replaceProductReferences).toHaveBeenCalledWith(product.id, [
      { mediaAssetId: 'media-1', alt: 'محصول', position: 0 },
    ]);
  });

  it('requires and enforces expectedVersion for managed Product updates', async () => {
    const missingVersion = fixture();
    await expect(missingVersion.service.update(product.id, {
      images: [{ mediaAssetId: 'media-1', alt: 'محصول' }],
    }, 'admin-1')).rejects.toMatchObject({ response: { code: 'EXPECTED_VERSION_REQUIRED' } });

    const stale = fixture({ update: vi.fn(async () => null) });
    await expect(stale.service.update(product.id, {
      expectedVersion: 4,
      images: [{ mediaAssetId: 'media-1', alt: 'محصول' }],
    }, 'admin-1')).rejects.toMatchObject({ response: { code: 'CONTENT_VERSION_CONFLICT' } });
    expect(stale.media.replaceProductReferences).not.toHaveBeenCalled();
    expect(stale.auditCreate).not.toHaveBeenCalled();
  });

  it('publishes and audits a draft product through one unit-of-work callback', async () => {
    const published = { ...product, status: ContentStatus.PUBLISHED };
    const setStatus = vi.fn(async () => published);
    const { service, auditCreate } = fixture({ setStatus });
    await expect(service.publish(product.id, 'admin-1')).resolves.toBe(
      published,
    );
    expect(setStatus).toHaveBeenCalledWith(
      product.id,
      ContentStatus.PUBLISHED,
      expect.any(Date),
    );
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'PRODUCT_PUBLISHED',
        metadata: expect.objectContaining({
          fromStatus: 'DRAFT',
          toStatus: 'PUBLISHED',
        }),
      }),
    });
  });

  it('does not change lifecycle or audit when the publication media gate fails', async () => {
    const setStatus = vi.fn();
    const { service, media, auditCreate } = fixture({ setStatus });
    media.assertProductPublishable.mockRejectedValueOnce(
      Object.assign(new Error('not ready'), { response: { code: 'MEDIA_NOT_READY' } }),
    );

    await expect(service.publish(product.id, 'admin-1')).rejects.toMatchObject({
      response: { code: 'MEDIA_NOT_READY' },
    });
    expect(setStatus).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });

  it('audits an idempotent archive without rewriting status', async () => {
    const archived = { ...product, status: ContentStatus.ARCHIVED };
    const setStatus = vi.fn();
    const { service, auditCreate } = fixture({
      get: vi.fn(async () => archived),
      setStatus,
    });
    await expect(service.archive(product.id, 'admin-1')).resolves.toBe(
      archived,
    );
    expect(setStatus).not.toHaveBeenCalled();
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'PRODUCT_ARCHIVED',
        metadata: expect.objectContaining({
          fromStatus: 'ARCHIVED',
          toStatus: 'ARCHIVED',
        }),
      }),
    });
  });
});
