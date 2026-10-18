import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { UpdateArticleDto } from './admin-article.dto.js';
import { CreateProductDto, UpdateProductDto } from './admin-product.dto.js';

const validProduct = {
  name: 'محصول',
  slug: 'managed-product',
};

describe('managed media content DTOs', () => {
  it.each([
    { url: '/legacy/image.jpg', alt: 'تصویر قدیمی', width: 640, height: 480 },
    { mediaAssetId: 'cm-media-1', alt: 'تصویر مدیریت‌شده' },
  ])('accepts a valid legacy or managed Product image', async (image) => {
    const dto = plainToInstance(CreateProductDto, { ...validProduct, images: [image] });

    expect(await validate(dto)).toEqual([]);
  });

  it.each([
    { alt: 'بدون منبع' },
    { url: '/legacy.jpg', mediaAssetId: 'cm-media-1', alt: 'منبع ترکیبی' },
    { mediaAssetId: 'cm-media-1', alt: 'ابعاد غیرمجاز', width: 100 },
    { mediaAssetId: 'cm-media-1' },
  ])('rejects an invalid discriminated image input', async (image) => {
    const dto = plainToInstance(CreateProductDto, { ...validProduct, images: [image] });

    expect(await validate(dto)).not.toHaveLength(0);
  });

  it('rejects Product galleries with more than six images', async () => {
    const images = Array.from({ length: 7 }, (_, index) => ({
      mediaAssetId: `cm-media-${index}`,
      alt: `تصویر ${index}`,
    }));
    const dto = plainToInstance(CreateProductDto, { ...validProduct, images });

    expect(await validate(dto)).not.toHaveLength(0);
  });

  it('accepts optimistic version inputs and an explicit Article image clear', async () => {
    const product = plainToInstance(UpdateProductDto, {
      expectedVersion: 2,
      images: [{ mediaAssetId: 'cm-media-1', alt: 'تصویر' }],
    });
    const article = plainToInstance(UpdateArticleDto, {
      expectedVersion: 3,
      featuredImage: null,
    });

    expect(await validate(product)).toEqual([]);
    expect(await validate(article)).toEqual([]);
  });

  it('rejects negative optimistic versions', async () => {
    const dto = plainToInstance(UpdateProductDto, { expectedVersion: -1 });

    expect(await validate(dto)).not.toHaveLength(0);
  });
});
