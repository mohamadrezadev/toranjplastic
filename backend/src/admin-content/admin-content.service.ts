import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../database/prisma.service.js';
import { recordAuditEvent } from '../audit/audit.js';
import { ADMIN_CONTENT_REPOSITORY, type AdminContentRepository } from './admin-content.repository.js';
import type { AdminImageDto, AdminSpecificationDto } from './dto/admin-image.dto.js';
import { isSafeContentImageUrl } from './dto/admin-image.dto.js';
import type { CreateCategoryDto, UpdateCategoryDto } from './dto/admin-category.dto.js';
import type { CreateProductDto, UpdateProductDto } from './dto/admin-product.dto.js';
import type { AdminProductListQuery, AdminListQuery, CategoryWriteInput, ProductWriteInput } from './admin-content.types.js';

function assertSafeImage(image: AdminImageDto | undefined): void {
  if (image && !isSafeContentImageUrl(image.url)) {
    throw new BadRequestException('آدرس تصویر باید یک مسیر داخلی یا نشانی http/https معتبر باشد.');
  }
}

function assertSafeImages(images: AdminImageDto[] | undefined): void {
  for (const image of images ?? []) assertSafeImage(image);
}

function mapSpecifications(items: AdminSpecificationDto[] | undefined) {
  return items?.map((item) => ({ label: item.label, value: item.value }));
}

function toPlainImage(image: AdminImageDto) {
  return { url: image.url, alt: image.alt, ...(image.width === undefined ? {} : { width: image.width }), ...(image.height === undefined ? {} : { height: image.height }) };
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'P2002';
}

@Injectable()
export class AdminContentService {
  constructor(
    @Inject(ADMIN_CONTENT_REPOSITORY) private readonly repository: AdminContentRepository,
    private readonly prisma: PrismaService,
  ) {}

  listCategories(query: AdminListQuery) {
    return this.repository.listCategories(query);
  }

  async getCategory(id: string) {
    return this.requireFound(await this.repository.getCategory(id));
  }

  async createCategory(dto: CreateCategoryDto, actorId: string) {
    assertSafeImage(dto.image);
    const input: CategoryWriteInput = {
      name: dto.name.trim(),
      slug: dto.slug,
      description: dto.description?.trim() || null,
      image: dto.image ? toPlainImage(dto.image) : null,
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    const category = await this.createWithConflictHandling(() => this.repository.createCategory(input));
    await recordAuditEvent(this.prisma, 'CATEGORY_CREATED', actorId, { entity: 'Category', id: category.id, slug: category.slug });
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, actorId: string) {
    assertSafeImage(dto.image);
    const input = {
      ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.description === undefined ? {} : { description: dto.description.trim() || null }),
      ...(dto.image === undefined ? {} : { image: toPlainImage(dto.image) }),
      ...(dto.displayOrder === undefined ? {} : { displayOrder: dto.displayOrder }),
      ...(dto.metaTitle === undefined ? {} : { metaTitle: dto.metaTitle.trim() || null }),
      ...(dto.metaDescription === undefined ? {} : { metaDescription: dto.metaDescription.trim() || null }),
    };
    const category = this.requireFound(
      await this.createWithConflictHandling(() => this.repository.updateCategory(id, input)),
    );
    await recordAuditEvent(this.prisma, 'CATEGORY_UPDATED', actorId, { entity: 'Category', id, slug: category.slug });
    return category;
  }

  async publishCategory(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getCategory(id));
    if (current.status === ContentStatus.PUBLISHED) return current;
    const category = this.requireFound(
      await this.repository.setCategoryStatus(id, ContentStatus.PUBLISHED, new Date()),
    );
    await recordAuditEvent(this.prisma, 'CATEGORY_PUBLISHED', actorId, { entity: 'Category', id, slug: category.slug, fromStatus: current.status, toStatus: category.status });
    return category;
  }

  async archiveCategory(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getCategory(id));
    if (current.status === ContentStatus.ARCHIVED) return current;
    const category = this.requireFound(
      await this.repository.setCategoryStatus(id, ContentStatus.ARCHIVED, null),
    );
    await recordAuditEvent(this.prisma, 'CATEGORY_ARCHIVED', actorId, { entity: 'Category', id, slug: category.slug, fromStatus: current.status, toStatus: category.status });
    return category;
  }

  listProducts(query: AdminProductListQuery) {
    return this.repository.listProducts(query);
  }

  async getProduct(id: string) {
    return this.requireFound(await this.repository.getProduct(id));
  }

  async createProduct(dto: CreateProductDto, actorId: string) {
    assertSafeImages(dto.images);
    const input: ProductWriteInput = {
      name: dto.name.trim(),
      slug: dto.slug,
      summary: dto.summary?.trim() || null,
      description: dto.description?.trim() || null,
      categoryId: dto.categoryId ?? null,
      images: dto.images?.map(toPlainImage) ?? [],
      specifications: mapSpecifications(dto.specifications) ?? [],
      featured: dto.featured ?? false,
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    const product = await this.createWithConflictHandling(() => this.repository.createProduct(input));
    await recordAuditEvent(this.prisma, 'PRODUCT_CREATED', actorId, { entity: 'Product', id: product.id, slug: product.slug });
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto, actorId: string) {
    assertSafeImages(dto.images);
    const input = {
      ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.summary === undefined ? {} : { summary: dto.summary.trim() || null }),
      ...(dto.description === undefined ? {} : { description: dto.description.trim() || null }),
      ...(dto.categoryId === undefined ? {} : { categoryId: dto.categoryId }),
      ...(dto.images === undefined ? {} : { images: dto.images.map(toPlainImage) }),
      ...(dto.specifications === undefined ? {} : { specifications: mapSpecifications(dto.specifications) }),
      ...(dto.featured === undefined ? {} : { featured: dto.featured }),
      ...(dto.displayOrder === undefined ? {} : { displayOrder: dto.displayOrder }),
      ...(dto.metaTitle === undefined ? {} : { metaTitle: dto.metaTitle.trim() || null }),
      ...(dto.metaDescription === undefined ? {} : { metaDescription: dto.metaDescription.trim() || null }),
    };
    const product = this.requireFound(
      await this.createWithConflictHandling(() => this.repository.updateProduct(id, input)),
    );
    await recordAuditEvent(this.prisma, 'PRODUCT_UPDATED', actorId, { entity: 'Product', id, slug: product.slug });
    return product;
  }

  async publishProduct(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getProduct(id));
    if (current.status === ContentStatus.PUBLISHED) return current;
    const product = this.requireFound(
      await this.repository.setProductStatus(id, ContentStatus.PUBLISHED, new Date()),
    );
    await recordAuditEvent(this.prisma, 'PRODUCT_PUBLISHED', actorId, { entity: 'Product', id, slug: product.slug, fromStatus: current.status, toStatus: product.status });
    return product;
  }

  async archiveProduct(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getProduct(id));
    if (current.status === ContentStatus.ARCHIVED) return current;
    const product = this.requireFound(
      await this.repository.setProductStatus(id, ContentStatus.ARCHIVED, null),
    );
    await recordAuditEvent(this.prisma, 'PRODUCT_ARCHIVED', actorId, { entity: 'Product', id, slug: product.slug, fromStatus: current.status, toStatus: product.status });
    return product;
  }

  private requireFound<T>(value: T | null): T {
    if (value === null) throw new NotFoundException('محتوا یافت نشد.');
    return value;
  }

  private async createWithConflictHandling<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new ConflictException('اسلاگ وارد شده قبلاً استفاده شده است.');
      throw error;
    }
  }
}
