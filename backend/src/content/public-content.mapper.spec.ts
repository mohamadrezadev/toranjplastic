import { describe, expect, it } from 'vitest';
import {
  mapProduct,
  mapService,
  normalizeImages,
  normalizeSpecifications,
} from './public-content.mapper.js';

const publishedAt = new Date('2026-10-10T10:00:00.000Z');

describe('public content mappers', () => {
  it('normalizes only safe image and specification shapes', () => {
    expect(
      normalizeImages([
        { url: '/media/item.webp', alt: 'نمای محصول', width: 800, height: 600 },
        { url: 'javascript:alert(1)', alt: 'unsafe' },
        { url: '/missing-alt.webp' },
        'raw',
      ]),
    ).toEqual([
      { url: '/media/item.webp', alt: 'نمای محصول', width: 800, height: 600 },
    ]);
    expect(
      normalizeSpecifications([
        { label: 'جنس', value: 'نمونه تأییدشده' },
        { label: '', value: 'invalid' },
        { raw: true },
      ]),
    ).toEqual([{ label: 'جنس', value: 'نمونه تأییدشده' }]);
  });

  it('emits an explicit product DTO without lifecycle or raw JSON fields', () => {
    const result = mapProduct({
      id: 'product-1',
      name: 'محصول تأییدشده',
      slug: 'approved-product',
      summary: null,
      description: null,
      category: { id: 'category-1', name: 'دسته', slug: 'category' },
      images: { unexpected: true },
      specifications: null,
      featured: true,
      metaTitle: null,
      metaDescription: null,
      publishedAt,
    });
    expect(result).toMatchObject({
      id: 'product-1',
      images: [],
      specifications: [],
      publishedAt: publishedAt.toISOString(),
    });
    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('createdAt');
    expect(result).not.toHaveProperty('price');
    expect(result).not.toHaveProperty('inventory');
  });

  it('drops an unsafe service CTA target', () => {
    expect(
      mapService({
        id: 'service-1',
        name: 'خدمت',
        slug: 'service',
        summary: null,
        description: null,
        images: [],
        specifications: [],
        ctaLabel: 'ادامه',
        ctaHref: 'javascript:alert(1)',
        metaTitle: null,
        metaDescription: null,
        publishedAt,
      }).ctaHref,
    ).toBeNull();
  });
});
