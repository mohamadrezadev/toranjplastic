import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../database/prisma.service.js';
import { recordAuditEvent } from '../audit/audit.js';
import { ADMIN_CONTENT_REPOSITORY, type AdminContentRepository } from './admin-content.repository.js';
import type { AdminImageDto, AdminSpecificationDto } from './dto/admin-image.dto.js';
import { isSafeContentImageUrl } from './dto/admin-image.dto.js';
import type { CreateCategoryDto, UpdateCategoryDto } from './dto/admin-category.dto.js';
import type { CreateProductDto, UpdateProductDto } from './dto/admin-product.dto.js';
import type { CreateInjectionServiceDto, UpdateInjectionServiceDto } from './dto/admin-injection-service.dto.js';
import type { CreateMaterialDto, UpdateMaterialDto } from './dto/admin-material.dto.js';
import type { CreateArticleDto, UpdateArticleDto } from './dto/admin-article.dto.js';
import type { CreateManagedPageDto, UpdateManagedPageDto } from './dto/admin-managed-page.dto.js';
import type {
  AdminProductListQuery,
  AdminListQuery,
  ArticleWriteInput,
  CategoryWriteInput,
  InjectionServiceWriteInput,
  ManagedPageWriteInput,
  MaterialWriteInput,
  ProductWriteInput,
} from './admin-content.types.js';

function assertSafeImage(image: AdminImageDto | undefined): void {
  if (image && !isSafeContentImageUrl(image.url)) {
    throw new BadRequestException('آدرس تصویر باید یک مسیر داخلی یا نشانی http/https معتبر باشد.');
  }
}

function assertSafeImages(images: AdminImageDto[] | undefined): void {
  for (const image of images ?? []) assertSafeImage(image);
}

function isSafeInternalHref(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}

function assertSafeHref(href: string | undefined): void {
  if (href !== undefined && !isSafeInternalHref(href)) {
    throw new BadRequestException('نشانی فراخوان عمل باید یک مسیر داخلی معتبر باشد.');
  }
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

  listInjectionServices(query: AdminListQuery) {
    return this.repository.listInjectionServices(query);
  }

  async getInjectionService(id: string) {
    return this.requireFound(await this.repository.getInjectionService(id));
  }

  async createInjectionService(dto: CreateInjectionServiceDto, actorId: string) {
    assertSafeImages(dto.images);
    assertSafeHref(dto.ctaHref);
    const input: InjectionServiceWriteInput = {
      name: dto.name.trim(),
      slug: dto.slug,
      summary: dto.summary?.trim() || null,
      description: dto.description?.trim() || null,
      images: dto.images?.map(toPlainImage) ?? [],
      specifications: mapSpecifications(dto.specifications) ?? [],
      ctaLabel: dto.ctaLabel?.trim() || null,
      ctaHref: dto.ctaHref?.trim() || null,
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    const service = await this.createWithConflictHandling(() => this.repository.createInjectionService(input));
    await recordAuditEvent(this.prisma, 'INJECTION_SERVICE_CREATED', actorId, { entity: 'InjectionService', id: service.id, slug: service.slug });
    return service;
  }

  async updateInjectionService(id: string, dto: UpdateInjectionServiceDto, actorId: string) {
    assertSafeImages(dto.images);
    assertSafeHref(dto.ctaHref);
    const input = {
      ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.summary === undefined ? {} : { summary: dto.summary.trim() || null }),
      ...(dto.description === undefined ? {} : { description: dto.description.trim() || null }),
      ...(dto.images === undefined ? {} : { images: dto.images.map(toPlainImage) }),
      ...(dto.specifications === undefined ? {} : { specifications: mapSpecifications(dto.specifications) }),
      ...(dto.ctaLabel === undefined ? {} : { ctaLabel: dto.ctaLabel.trim() || null }),
      ...(dto.ctaHref === undefined ? {} : { ctaHref: dto.ctaHref.trim() || null }),
      ...(dto.displayOrder === undefined ? {} : { displayOrder: dto.displayOrder }),
      ...(dto.metaTitle === undefined ? {} : { metaTitle: dto.metaTitle.trim() || null }),
      ...(dto.metaDescription === undefined ? {} : { metaDescription: dto.metaDescription.trim() || null }),
    };
    const service = this.requireFound(
      await this.createWithConflictHandling(() => this.repository.updateInjectionService(id, input)),
    );
    await recordAuditEvent(this.prisma, 'INJECTION_SERVICE_UPDATED', actorId, { entity: 'InjectionService', id, slug: service.slug });
    return service;
  }

  async publishInjectionService(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getInjectionService(id));
    if (current.status === ContentStatus.PUBLISHED) return current;
    const service = this.requireFound(
      await this.repository.setInjectionServiceStatus(id, ContentStatus.PUBLISHED, new Date()),
    );
    await recordAuditEvent(this.prisma, 'INJECTION_SERVICE_PUBLISHED', actorId, { entity: 'InjectionService', id, slug: service.slug, fromStatus: current.status, toStatus: service.status });
    return service;
  }

  async archiveInjectionService(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getInjectionService(id));
    if (current.status === ContentStatus.ARCHIVED) return current;
    const service = this.requireFound(
      await this.repository.setInjectionServiceStatus(id, ContentStatus.ARCHIVED, null),
    );
    await recordAuditEvent(this.prisma, 'INJECTION_SERVICE_ARCHIVED', actorId, { entity: 'InjectionService', id, slug: service.slug, fromStatus: current.status, toStatus: service.status });
    return service;
  }

  listMaterials(query: AdminListQuery) {
    return this.repository.listMaterials(query);
  }

  async getMaterial(id: string) {
    return this.requireFound(await this.repository.getMaterial(id));
  }

  async createMaterial(dto: CreateMaterialDto, actorId: string) {
    assertSafeImages(dto.images);
    const input: MaterialWriteInput = {
      name: dto.name.trim(),
      slug: dto.slug,
      family: dto.family?.trim() || null,
      grade: dto.grade?.trim() || null,
      manufacturer: dto.manufacturer?.trim() || null,
      summary: dto.summary?.trim() || null,
      description: dto.description?.trim() || null,
      images: dto.images?.map(toPlainImage) ?? [],
      specifications: mapSpecifications(dto.specifications) ?? [],
      inquiryAvailable: dto.inquiryAvailable ?? true,
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    const material = await this.createWithConflictHandling(() => this.repository.createMaterial(input));
    await recordAuditEvent(this.prisma, 'MATERIAL_CREATED', actorId, { entity: 'Material', id: material.id, slug: material.slug });
    return material;
  }

  async updateMaterial(id: string, dto: UpdateMaterialDto, actorId: string) {
    assertSafeImages(dto.images);
    const input = {
      ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.family === undefined ? {} : { family: dto.family.trim() || null }),
      ...(dto.grade === undefined ? {} : { grade: dto.grade.trim() || null }),
      ...(dto.manufacturer === undefined ? {} : { manufacturer: dto.manufacturer.trim() || null }),
      ...(dto.summary === undefined ? {} : { summary: dto.summary.trim() || null }),
      ...(dto.description === undefined ? {} : { description: dto.description.trim() || null }),
      ...(dto.images === undefined ? {} : { images: dto.images.map(toPlainImage) }),
      ...(dto.specifications === undefined ? {} : { specifications: mapSpecifications(dto.specifications) }),
      ...(dto.inquiryAvailable === undefined ? {} : { inquiryAvailable: dto.inquiryAvailable }),
      ...(dto.displayOrder === undefined ? {} : { displayOrder: dto.displayOrder }),
      ...(dto.metaTitle === undefined ? {} : { metaTitle: dto.metaTitle.trim() || null }),
      ...(dto.metaDescription === undefined ? {} : { metaDescription: dto.metaDescription.trim() || null }),
    };
    const material = this.requireFound(
      await this.createWithConflictHandling(() => this.repository.updateMaterial(id, input)),
    );
    await recordAuditEvent(this.prisma, 'MATERIAL_UPDATED', actorId, { entity: 'Material', id, slug: material.slug });
    return material;
  }

  async publishMaterial(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getMaterial(id));
    if (current.status === ContentStatus.PUBLISHED) return current;
    const material = this.requireFound(
      await this.repository.setMaterialStatus(id, ContentStatus.PUBLISHED, new Date()),
    );
    await recordAuditEvent(this.prisma, 'MATERIAL_PUBLISHED', actorId, { entity: 'Material', id, slug: material.slug, fromStatus: current.status, toStatus: material.status });
    return material;
  }

  async archiveMaterial(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getMaterial(id));
    if (current.status === ContentStatus.ARCHIVED) return current;
    const material = this.requireFound(
      await this.repository.setMaterialStatus(id, ContentStatus.ARCHIVED, null),
    );
    await recordAuditEvent(this.prisma, 'MATERIAL_ARCHIVED', actorId, { entity: 'Material', id, slug: material.slug, fromStatus: current.status, toStatus: material.status });
    return material;
  }

  listArticles(query: AdminListQuery) {
    return this.repository.listArticles(query);
  }

  async getArticle(id: string) {
    return this.requireFound(await this.repository.getArticle(id));
  }

  async createArticle(dto: CreateArticleDto, actorId: string) {
    assertSafeImage(dto.featuredImage);
    const input: ArticleWriteInput = {
      title: dto.title.trim(),
      slug: dto.slug,
      summary: dto.summary?.trim() || null,
      body: dto.body,
      featuredImage: dto.featuredImage ? toPlainImage(dto.featuredImage) : null,
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    const article = await this.createWithConflictHandling(() => this.repository.createArticle(input));
    await recordAuditEvent(this.prisma, 'ARTICLE_CREATED', actorId, { entity: 'Article', id: article.id, slug: article.slug });
    return article;
  }

  async updateArticle(id: string, dto: UpdateArticleDto, actorId: string) {
    assertSafeImage(dto.featuredImage);
    const input = {
      ...(dto.title === undefined ? {} : { title: dto.title.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.summary === undefined ? {} : { summary: dto.summary.trim() || null }),
      ...(dto.body === undefined ? {} : { body: dto.body }),
      ...(dto.featuredImage === undefined ? {} : { featuredImage: toPlainImage(dto.featuredImage) }),
      ...(dto.displayOrder === undefined ? {} : { displayOrder: dto.displayOrder }),
      ...(dto.metaTitle === undefined ? {} : { metaTitle: dto.metaTitle.trim() || null }),
      ...(dto.metaDescription === undefined ? {} : { metaDescription: dto.metaDescription.trim() || null }),
    };
    const article = this.requireFound(
      await this.createWithConflictHandling(() => this.repository.updateArticle(id, input)),
    );
    await recordAuditEvent(this.prisma, 'ARTICLE_UPDATED', actorId, { entity: 'Article', id, slug: article.slug });
    return article;
  }

  async publishArticle(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getArticle(id));
    if (current.status === ContentStatus.PUBLISHED) return current;
    const article = this.requireFound(
      await this.repository.setArticleStatus(id, ContentStatus.PUBLISHED, new Date()),
    );
    await recordAuditEvent(this.prisma, 'ARTICLE_PUBLISHED', actorId, { entity: 'Article', id, slug: article.slug, fromStatus: current.status, toStatus: article.status });
    return article;
  }

  async archiveArticle(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getArticle(id));
    if (current.status === ContentStatus.ARCHIVED) return current;
    const article = this.requireFound(
      await this.repository.setArticleStatus(id, ContentStatus.ARCHIVED, null),
    );
    await recordAuditEvent(this.prisma, 'ARTICLE_ARCHIVED', actorId, { entity: 'Article', id, slug: article.slug, fromStatus: current.status, toStatus: article.status });
    return article;
  }

  listManagedPages(query: AdminListQuery) {
    return this.repository.listManagedPages(query);
  }

  async getManagedPage(id: string) {
    return this.requireFound(await this.repository.getManagedPage(id));
  }

  async createManagedPage(dto: CreateManagedPageDto, actorId: string) {
    assertSafeImages(dto.images);
    const input: ManagedPageWriteInput = {
      title: dto.title.trim(),
      slug: dto.slug,
      summary: dto.summary?.trim() || null,
      body: dto.body,
      images: dto.images?.map(toPlainImage) ?? [],
      displayOrder: dto.displayOrder,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    };
    const page = await this.createWithConflictHandling(() => this.repository.createManagedPage(input));
    await recordAuditEvent(this.prisma, 'MANAGED_PAGE_CREATED', actorId, { entity: 'ManagedPage', id: page.id, slug: page.slug });
    return page;
  }

  async updateManagedPage(id: string, dto: UpdateManagedPageDto, actorId: string) {
    assertSafeImages(dto.images);
    const input = {
      ...(dto.title === undefined ? {} : { title: dto.title.trim() }),
      ...(dto.slug === undefined ? {} : { slug: dto.slug }),
      ...(dto.summary === undefined ? {} : { summary: dto.summary.trim() || null }),
      ...(dto.body === undefined ? {} : { body: dto.body }),
      ...(dto.images === undefined ? {} : { images: dto.images.map(toPlainImage) }),
      ...(dto.displayOrder === undefined ? {} : { displayOrder: dto.displayOrder }),
      ...(dto.metaTitle === undefined ? {} : { metaTitle: dto.metaTitle.trim() || null }),
      ...(dto.metaDescription === undefined ? {} : { metaDescription: dto.metaDescription.trim() || null }),
    };
    const page = this.requireFound(
      await this.createWithConflictHandling(() => this.repository.updateManagedPage(id, input)),
    );
    await recordAuditEvent(this.prisma, 'MANAGED_PAGE_UPDATED', actorId, { entity: 'ManagedPage', id, slug: page.slug });
    return page;
  }

  async publishManagedPage(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getManagedPage(id));
    if (current.status === ContentStatus.PUBLISHED) return current;
    const page = this.requireFound(
      await this.repository.setManagedPageStatus(id, ContentStatus.PUBLISHED, new Date()),
    );
    await recordAuditEvent(this.prisma, 'MANAGED_PAGE_PUBLISHED', actorId, { entity: 'ManagedPage', id, slug: page.slug, fromStatus: current.status, toStatus: page.status });
    return page;
  }

  async archiveManagedPage(id: string, actorId: string) {
    const current = this.requireFound(await this.repository.getManagedPage(id));
    if (current.status === ContentStatus.ARCHIVED) return current;
    const page = this.requireFound(
      await this.repository.setManagedPageStatus(id, ContentStatus.ARCHIVED, null),
    );
    await recordAuditEvent(this.prisma, 'MANAGED_PAGE_ARCHIVED', actorId, { entity: 'ManagedPage', id, slug: page.slug, fromStatus: current.status, toStatus: page.status });
    return page;
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
