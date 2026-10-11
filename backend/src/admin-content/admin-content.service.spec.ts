import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { AdminContentService } from './admin-content.service.js';
import type { AdminContentRepository } from './admin-content.repository.js';
import type { AdminCategory, AdminProduct } from './admin-content.types.js';

const category: AdminCategory = {
  id: 'c1', name: 'دسته', slug: 'cat', description: null, image: null, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

const product: AdminProduct = {
  id: 'p1', name: 'محصول', slug: 'prod', summary: null, description: null, categoryId: null, images: [], specifications: [], featured: false, displayOrder: 0,
  status: 'DRAFT' as never, publishedAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  metaTitle: null, metaDescription: null,
};

function emptyRepository(): AdminContentRepository {
  return {
    listCategories: vi.fn(),
    getCategory: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    setCategoryStatus: vi.fn(),
    listProducts: vi.fn(),
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    setProductStatus: vi.fn(),
  };
}

function prismaMock() {
  const create = vi.fn(async () => ({}));
  return { prisma: { securityAuditEvent: { create } } as unknown as PrismaService, create };
}

describe('AdminContentService', () => {
  it('rejects an image with an unsafe URL before touching the repository', async () => {
    const createCategory = vi.fn();
    const repository = { ...emptyRepository(), createCategory };
    const service = new AdminContentService(repository, prismaMock().prisma);

    await expect(
      service.createCategory({ name: 'دسته', slug: 'cat', image: { url: '//evil.example.com/x.png', alt: 'x' } } as never, 'admin-1'),
    ).rejects.toMatchObject({ status: 400 });
    expect(createCategory).not.toHaveBeenCalled();
  });

  it('translates a duplicate slug into a 409 without a generic 500', async () => {
    const createCategory = vi.fn().mockRejectedValue({ code: 'P2002' });
    const repository = { ...emptyRepository(), createCategory };
    const service = new AdminContentService(repository, prismaMock().prisma);

    await expect(service.createCategory({ name: 'دسته', slug: 'cat' } as never, 'admin-1')).rejects.toMatchObject({ status: 409 });
  });

  it('throws 404 when updating a category that does not exist', async () => {
    const updateCategory = vi.fn().mockResolvedValue(null);
    const repository = { ...emptyRepository(), updateCategory };
    const service = new AdminContentService(repository, prismaMock().prisma);

    await expect(service.updateCategory('missing', { name: 'New' } as never, 'admin-1')).rejects.toMatchObject({ status: 404 });
  });

  it('publishing an already-published category is a no-op that does not write a new status', async () => {
    const getCategory = vi.fn().mockResolvedValue({ ...category, status: 'PUBLISHED' as never });
    const setCategoryStatus = vi.fn();
    const repository = { ...emptyRepository(), getCategory, setCategoryStatus };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.publishCategory('c1', 'admin-1');

    expect(result.status).toBe('PUBLISHED');
    expect(setCategoryStatus).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('publishes a draft category and records an audit event with the acting admin', async () => {
    const getCategory = vi.fn().mockResolvedValue(category);
    const setCategoryStatus = vi.fn().mockResolvedValue({ ...category, status: 'PUBLISHED' as never, publishedAt: '2026-02-01T00:00:00.000Z' });
    const repository = { ...emptyRepository(), getCategory, setCategoryStatus };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.publishCategory('c1', 'admin-1');

    expect(result.status).toBe('PUBLISHED');
    expect(setCategoryStatus).toHaveBeenCalledWith('c1', 'PUBLISHED', expect.any(Date));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'CATEGORY_PUBLISHED', userId: 'admin-1' }) }),
    );
  });

  it('archiving an already-archived product is idempotent', async () => {
    const getProduct = vi.fn().mockResolvedValue({ ...product, status: 'ARCHIVED' as never });
    const setProductStatus = vi.fn();
    const repository = { ...emptyRepository(), getProduct, setProductStatus };
    const service = new AdminContentService(repository, prismaMock().prisma);

    const result = await service.archiveProduct('p1', 'admin-1');

    expect(result.status).toBe('ARCHIVED');
    expect(setProductStatus).not.toHaveBeenCalled();
  });

  it('creates a product in draft status via the repository and audits the action', async () => {
    const createProduct = vi.fn().mockResolvedValue(product);
    const repository = { ...emptyRepository(), createProduct };
    const { prisma, create } = prismaMock();
    const service = new AdminContentService(repository, prisma);

    const result = await service.createProduct({ name: 'محصول', slug: 'prod', images: [{ url: '/catalog/x.webp', alt: 'x' }] } as never, 'admin-1');

    expect(result).toBe(product);
    expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({ name: 'محصول', slug: 'prod' }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'PRODUCT_CREATED', userId: 'admin-1' }) }),
    );
  });
});
