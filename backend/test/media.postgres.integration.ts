import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/database/prisma.service.js';

function isolatedDatabase(value: string | undefined) {
  if (!value) throw new Error('DATABASE_URL is required for PostgreSQL integration tests.');
  const url = new URL(value);
  const name = url.pathname.slice(1);
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || !/(^|[_-])test($|[_-])/i.test(name)) {
    throw new Error('Refusing PostgreSQL integration test: use a local database whose name contains test.');
  }
  return name;
}

describe('media PostgreSQL schema integration', () => {
  const database = isolatedDatabase(process.env.DATABASE_URL);
  const marker = `media-it-${randomUUID()}`;
  let prisma: PrismaService;
  let userId: string;
  let productId: string;
  let articleId: string;
  const assetIds: string[] = [];

  beforeAll(async () => {
    expect(database).toMatch(/test/i);
    prisma = new PrismaService();
    await prisma.$connect();
    const user = await prisma.user.create({
      data: {
        mobile: `+984${Date.now().toString().slice(-9)}`,
        displayName: marker,
        role: 'OPERATOR',
      },
    });
    userId = user.id;
    const product = await prisma.product.create({
      data: {
        name: marker,
        slug: `${marker}-product`,
        images: [{ url: '/catalog/legacy.webp', alt: 'تصویر قدیمی' }],
      },
    });
    productId = product.id;
    const article = await prisma.article.create({
      data: {
        title: marker,
        slug: `${marker}-article`,
        body: 'integration',
        featuredImage: { url: '/catalog/article.webp', alt: 'تصویر مقاله' },
      },
    });
    articleId = article.id;
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.mediaReference.deleteMany({ where: { mediaAssetId: { in: assetIds } } });
    await prisma.mediaAsset.deleteMany({ where: { id: { in: assetIds } } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.article.deleteMany({ where: { id: articleId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  async function asset(suffix: string) {
    const created = await prisma.mediaAsset.create({
      data: {
        status: 'READY',
        objectPrefix: `objects/${marker}/${suffix}`,
        sourceChecksumSha256: 'a'.repeat(64),
        sourceMimeType: 'image/png',
        sourceWidth: 100,
        sourceHeight: 50,
        variants: [{ name: 'thumb', key: `objects/${marker}/${suffix}/thumb.webp`, width: 100, height: 50 }],
        defaultAlt: 'تصویر آزمایشی',
        createdById: userId,
      },
    });
    assetIds.push(created.id);
    return created;
  }

  it('enforces exactly one compatible owner and deterministic Product positions', async () => {
    const first = await asset('owner');
    await expect(prisma.mediaReference.create({
      data: {
        mediaAssetId: first.id,
        usage: 'PRODUCT_GALLERY',
        productId,
        articleId,
        position: 0,
        alt: 'مالک نامعتبر',
      },
    })).rejects.toThrow();

    await prisma.mediaReference.create({
      data: { mediaAssetId: first.id, usage: 'PRODUCT_GALLERY', productId, position: 0, alt: 'کاور' },
    });
    const duplicate = await asset('duplicate-position');
    await expect(prisma.mediaReference.create({
      data: { mediaAssetId: duplicate.id, usage: 'PRODUCT_GALLERY', productId, position: 0, alt: 'تکراری' },
    })).rejects.toThrow();
    await expect(prisma.mediaReference.create({
      data: { mediaAssetId: duplicate.id, usage: 'PRODUCT_GALLERY', productId, position: 6, alt: 'خارج محدوده' },
    })).rejects.toThrow();
  });

  it('allows only one featured reference per Article', async () => {
    const first = await asset('article-one');
    const second = await asset('article-two');
    await prisma.mediaReference.create({
      data: { mediaAssetId: first.id, usage: 'ARTICLE_FEATURED', articleId, alt: 'تصویر اول' },
    });
    await expect(prisma.mediaReference.create({
      data: { mediaAssetId: second.id, usage: 'ARTICLE_FEATURED', articleId, alt: 'تصویر دوم' },
    })).rejects.toThrow();
  });

  it('protects referenced assets from physical row deletion', async () => {
    const referenced = await asset('protected');
    await prisma.mediaReference.create({
      data: { mediaAssetId: referenced.id, usage: 'PRODUCT_GALLERY', productId, position: 1, alt: 'محافظت‌شده' },
    });
    await expect(prisma.mediaAsset.delete({ where: { id: referenced.id } })).rejects.toThrow();
  });

  it('keeps existing legacy projections and initializes content versions non-destructively', async () => {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
    expect(product.contentVersion).toBe(0);
    expect(product.images).toEqual([{ url: '/catalog/legacy.webp', alt: 'تصویر قدیمی' }]);
    expect(article.contentVersion).toBe(0);
    expect(article.featuredImage).toEqual({ url: '/catalog/article.webp', alt: 'تصویر مقاله' });
  });
});
