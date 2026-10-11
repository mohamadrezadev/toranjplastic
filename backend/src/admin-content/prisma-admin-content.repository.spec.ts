import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { PrismaAdminContentRepository } from './prisma-admin-content.repository.js';

describe('PrismaAdminContentRepository', () => {
  it('lists categories across all statuses when no status filter is given', async () => {
    const count = vi.fn(async () => 0);
    const findMany = vi.fn(async () => []);
    const prisma = {
      category: { count, findMany },
      $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
    } as unknown as PrismaService;
    const repository = new PrismaAdminContentRepository(prisma);

    await repository.listCategories({ page: 1, pageSize: 20 });

    expect(count).toHaveBeenCalledWith({ where: {} });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {}, skip: 0, take: 20 }));
  });

  it('filters categories by an explicit status', async () => {
    const count = vi.fn(async () => 0);
    const findMany = vi.fn(async () => []);
    const prisma = {
      category: { count, findMany },
      $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
    } as unknown as PrismaService;
    const repository = new PrismaAdminContentRepository(prisma);

    await repository.listCategories({ page: 1, pageSize: 20, status: 'DRAFT' as never });

    expect(count).toHaveBeenCalledWith({ where: { status: 'DRAFT' } });
  });

  it('returns null instead of throwing when updating a missing category', async () => {
    const update = vi.fn(async () => {
      throw { code: 'P2025' };
    });
    const prisma = { category: { update } } as unknown as PrismaService;
    const repository = new PrismaAdminContentRepository(prisma);

    await expect(repository.updateCategory('missing', { name: 'New name' })).resolves.toBeNull();
  });

  it('propagates a non-missing-record error from updateCategory', async () => {
    const update = vi.fn(async () => {
      throw { code: 'P2002' };
    });
    const prisma = { category: { update } } as unknown as PrismaService;
    const repository = new PrismaAdminContentRepository(prisma);

    await expect(repository.updateCategory('c1', { slug: 'taken' })).rejects.toMatchObject({ code: 'P2002' });
  });

  it('sets publishedAt only when provided for a status transition', async () => {
    const update = vi.fn(async (args: unknown) => ({ ...(args as { data: object }).data, id: 'c1', name: 'Cat', slug: 'cat', description: null, image: null, displayOrder: 0, status: 'ARCHIVED', publishedAt: null, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date() }));
    const prisma = { category: { update } } as unknown as PrismaService;
    const repository = new PrismaAdminContentRepository(prisma);

    await repository.setCategoryStatus('c1', 'ARCHIVED' as never, null);

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'ARCHIVED' } }));
  });

  it('does not clear categoryId on a product update that omits it', async () => {
    const update = vi.fn(async (args: unknown) => ({ ...(args as { data: object }).data, id: 'p1', name: 'P', slug: 'p', summary: null, description: null, categoryId: 'existing-category', images: [], specifications: [], featured: false, displayOrder: 0, status: 'DRAFT', publishedAt: null, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date() }));
    const prisma = { product: { update } } as unknown as PrismaService;
    const repository = new PrismaAdminContentRepository(prisma);

    const result = await repository.updateProduct('p1', { name: 'Renamed' });

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { name: 'Renamed' } }));
    expect(result?.categoryId).toBe('existing-category');
  });
});
