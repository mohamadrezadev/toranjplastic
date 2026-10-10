import { describe, expect, it, vi } from 'vitest';
import { ContentStatus } from '../generated/prisma/client.js';
import type { PrismaService } from '../database/prisma.service.js';
import { PrismaPublicContentRepository } from './prisma-public-content.repository.js';

describe('PrismaPublicContentRepository', () => {
  it('filters products by effective publication, eligible category and featured state', async () => {
    const count = vi.fn(async () => 0);
    const findMany = vi.fn(async () => []);
    const prisma = {
      product: { count, findMany },
      $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
    } as unknown as PrismaService;
    const repository = new PrismaPublicContentRepository(prisma);

    const result = await repository.listProducts({ page: 2, pageSize: 12, featured: true });

    expect(result.pageInfo).toEqual({ page: 2, pageSize: 12, total: 0, totalPages: 0 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 12,
        take: 12,
        where: expect.objectContaining({
          status: ContentStatus.PUBLISHED,
          featured: true,
          publishedAt: expect.objectContaining({ not: null, lte: expect.any(Date) }),
          OR: expect.arrayContaining([
            { categoryId: null },
            expect.objectContaining({ category: expect.any(Object) }),
          ]),
        }),
        orderBy: [
          { displayOrder: 'asc' },
          { publishedAt: 'desc' },
          { id: 'asc' },
        ],
      }),
    );
  });

  it('uses the same publication boundary for hidden detail slugs', async () => {
    const findFirst = vi.fn(async () => null);
    const prisma = { product: { findFirst } } as unknown as PrismaService;
    const repository = new PrismaPublicContentRepository(prisma);

    await expect(repository.findProduct('draft-product')).resolves.toBeNull();
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          slug: 'draft-product',
          status: ContentStatus.PUBLISHED,
          publishedAt: expect.objectContaining({ not: null, lte: expect.any(Date) }),
        }),
      }),
    );
  });
});
