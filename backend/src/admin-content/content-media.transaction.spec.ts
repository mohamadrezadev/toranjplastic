import { describe, expect, it, vi } from 'vitest';
import type { AdminContentPrismaClient } from './shared/prisma-repository.js';
import { PrismaContentMediaTransaction } from './content-media.transaction.js';

const allVariants = [
  { name: 'thumb', width: 320, height: 240 },
  { name: 'card', width: 800, height: 600 },
  { name: 'detail', width: 1600, height: 1200 },
];

function fixture() {
  const findManyAssets = vi.fn(async ({ where }: { where: { id: { in: string[] } } }) =>
    where.id.in.map((id) => ({ id, variants: allVariants })));
  const deleteMany = vi.fn(async () => ({ count: 0 }));
  const createMany = vi.fn(async () => ({ count: 1 }));
  const findManyReferences = vi.fn<() => Promise<Array<{
    mediaAsset: { status: string; variants: typeof allVariants };
  }>>>(async () => []);
  const prisma = {
    mediaAsset: { findMany: findManyAssets },
    mediaReference: {
      findMany: findManyReferences,
      deleteMany,
      createMany,
      create: vi.fn(),
      count: vi.fn(async () => 0),
    },
  } as unknown as AdminContentPrismaClient;
  return {
    transaction: new PrismaContentMediaTransaction(prisma, 'https://media.example'),
    findManyAssets,
    findManyReferences,
    deleteMany,
    createMany,
  };
}

describe('PrismaContentMediaTransaction', () => {
  it('preserves mixed gallery order and uses full-gallery positions for managed references', async () => {
    const { transaction, createMany } = fixture();
    const prepared = await transaction.prepareProduct([
      { url: '/legacy.webp', alt: 'قدیمی', width: 400 },
      { mediaAssetId: 'media-1', alt: 'مدیریت‌شده' },
    ]);

    expect(prepared.projection).toEqual([
      { url: '/legacy.webp', alt: 'قدیمی', width: 400 },
      {
        url: 'https://media.example/api/v1/media/public/media-1/detail',
        alt: 'مدیریت‌شده', width: 1600, height: 1200,
      },
    ]);
    expect(prepared.references).toEqual([
      { mediaAssetId: 'media-1', alt: 'مدیریت‌شده', position: 1 },
    ]);

    await transaction.replaceProductReferences('product-1', prepared.references);
    expect(createMany).toHaveBeenCalledWith({ data: [{
      mediaAssetId: 'media-1', alt: 'مدیریت‌شده', position: 1,
      productId: 'product-1', usage: 'PRODUCT_GALLERY',
    }] });
  });

  it('rejects duplicate or unavailable managed assets', async () => {
    const duplicate = fixture();
    await expect(duplicate.transaction.prepareProduct([
      { mediaAssetId: 'media-1', alt: 'اول' },
      { mediaAssetId: 'media-1', alt: 'دوم' },
    ])).rejects.toMatchObject({ response: { code: 'DUPLICATE_MEDIA_ASSET' } });
    expect(duplicate.findManyAssets).not.toHaveBeenCalled();

    const unavailable = fixture();
    unavailable.findManyAssets.mockResolvedValueOnce([]);
    await expect(unavailable.transaction.prepareArticle({
      mediaAssetId: 'missing', alt: 'ناموجود',
    })).rejects.toMatchObject({ response: { code: 'MEDIA_NOT_READY' } });
  });

  it('blocks publication when any referenced asset lacks a required variant', async () => {
    const { transaction, findManyReferences } = fixture();
    findManyReferences.mockResolvedValueOnce([{
      mediaAsset: { status: 'READY', variants: allVariants.filter((item) => item.name !== 'card') },
    }]);

    await expect(transaction.assertProductPublishable('product-1'))
      .rejects.toMatchObject({ response: { code: 'MEDIA_NOT_READY' } });
  });
});
