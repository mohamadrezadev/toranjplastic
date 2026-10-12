import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type {
  AdminImageDto,
  AdminSpecificationDto,
} from '../dto/admin-image.dto.js';
import { isSafeContentImageUrl } from '../dto/admin-image.dto.js';
import type {
  CreateProductDto,
  UpdateProductDto,
} from '../dto/admin-product.dto.js';
import {
  recordContentAudit,
  requireFound,
  transitionStatus,
  withConflictHandling,
} from '../shared/mutations.js';
import {
  ADMIN_CONTENT_UNIT_OF_WORK,
  type AdminContentUnitOfWork,
} from '../unit-of-work.js';
import {
  ADMIN_PRODUCT_REPOSITORY,
  type AdminProductRepository,
} from './repository.js';
import type { AdminProductListQuery, ProductWriteInput } from './types.js';

function imageValue(image: AdminImageDto) {
  return {
    url: image.url,
    alt: image.alt,
    ...(image.width === undefined ? {} : { width: image.width }),
    ...(image.height === undefined ? {} : { height: image.height }),
  };
}

function specificationValues(items: AdminSpecificationDto[] | undefined) {
  return items?.map((item) => ({ label: item.label, value: item.value }));
}

function assertSafeImages(images: AdminImageDto[] | undefined): void {
  if (images?.some((image) => !isSafeContentImageUrl(image.url))) {
    throw new BadRequestException(
      'آدرس تصویر باید یک مسیر داخلی یا نشانی http/https معتبر باشد.',
    );
  }
}

@Injectable()
export class AdminProductService {
  constructor(
    @Inject(ADMIN_PRODUCT_REPOSITORY)
    private readonly products: AdminProductRepository,
    @Inject(ADMIN_CONTENT_UNIT_OF_WORK)
    private readonly unitOfWork: AdminContentUnitOfWork,
  ) {}

  list(query: AdminProductListQuery) {
    return this.products.list(query);
  }
  async get(id: string) {
    return requireFound(await this.products.get(id));
  }

  create(dto: CreateProductDto, actorId: string) {
    assertSafeImages(dto.images);
    const input: ProductWriteInput = {
      name: dto.name.trim(),
      slug: dto.slug,
      summary: dto.summary?.trim() || null,
      description: dto.description?.trim() || null,
      categoryId: dto.categoryId ?? null,
      images: dto.images?.map(imageValue) ?? [],
      specifications: specificationValues(dto.specifications) ?? [],
      featured: dto.featured ?? false,
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    return this.unitOfWork.run(async ({ products, audit }) => {
      const product = await withConflictHandling(() => products.create(input));
      await recordContentAudit(audit, 'PRODUCT_CREATED', actorId, product);
      return product;
    });
  }

  update(id: string, dto: UpdateProductDto, actorId: string) {
    assertSafeImages(dto.images);
    const input: Partial<ProductWriteInput> = {
      ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.summary === undefined
        ? {}
        : { summary: dto.summary.trim() || null }),
      ...(dto.description === undefined
        ? {}
        : { description: dto.description.trim() || null }),
      ...(dto.categoryId === undefined ? {} : { categoryId: dto.categoryId }),
      ...(dto.images === undefined
        ? {}
        : { images: dto.images.map(imageValue) }),
      ...(dto.specifications === undefined
        ? {}
        : { specifications: specificationValues(dto.specifications) }),
      ...(dto.featured === undefined ? {} : { featured: dto.featured }),
      ...(dto.displayOrder === undefined
        ? {}
        : { displayOrder: dto.displayOrder }),
      ...(dto.metaTitle === undefined
        ? {}
        : { metaTitle: dto.metaTitle.trim() || null }),
      ...(dto.metaDescription === undefined
        ? {}
        : { metaDescription: dto.metaDescription.trim() || null }),
    };
    return this.unitOfWork.run(async ({ products, audit }) => {
      const product = requireFound(
        await withConflictHandling(() => products.update(id, input)),
      );
      await recordContentAudit(audit, 'PRODUCT_UPDATED', actorId, product);
      return product;
    });
  }

  publish(id: string, actorId: string) {
    return this.unitOfWork.run(({ products, audit }) =>
      transitionStatus({
        id,
        actorId,
        audit,
        action: 'PRODUCT_PUBLISHED',
        target: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        get: products.get.bind(products),
        setStatus: products.setStatus.bind(products),
      }),
    );
  }

  archive(id: string, actorId: string) {
    return this.unitOfWork.run(({ products, audit }) =>
      transitionStatus({
        id,
        actorId,
        audit,
        action: 'PRODUCT_ARCHIVED',
        target: ContentStatus.ARCHIVED,
        publishedAt: null,
        get: products.get.bind(products),
        setStatus: products.setStatus.bind(products),
      }),
    );
  }
}
