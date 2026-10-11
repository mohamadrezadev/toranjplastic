import { Injectable } from '@nestjs/common';
import type { ContentStatus, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { normalizeImage, normalizeImages, normalizeSpecifications } from '../content/public-content.mapper.js';
import type { AdminContentRepository } from './admin-content.repository.js';
import type {
  AdminArticle,
  AdminCategory,
  AdminInjectionService,
  AdminListQuery,
  AdminManagedPage,
  AdminMaterial,
  AdminProduct,
  AdminProductListQuery,
  ArticleWriteInput,
  CategoryWriteInput,
  InjectionServiceWriteInput,
  ManagedPageWriteInput,
  MaterialWriteInput,
  PageResult,
  ProductWriteInput,
} from './admin-content.types.js';

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  displayOrder: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

const productSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  description: true,
  categoryId: true,
  images: true,
  specifications: true,
  featured: true,
  displayOrder: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

const injectionServiceSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  description: true,
  images: true,
  specifications: true,
  ctaLabel: true,
  ctaHref: true,
  displayOrder: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.InjectionServiceSelect;

const materialSelect = {
  id: true,
  name: true,
  slug: true,
  family: true,
  grade: true,
  manufacturer: true,
  summary: true,
  description: true,
  images: true,
  specifications: true,
  inquiryAvailable: true,
  displayOrder: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MaterialSelect;

const articleSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  body: true,
  featuredImage: true,
  displayOrder: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArticleSelect;

const managedPageSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  body: true,
  images: true,
  displayOrder: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ManagedPageSelect;

type RawCategory = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;
type RawProduct = Prisma.ProductGetPayload<{ select: typeof productSelect }>;
type RawInjectionService = Prisma.InjectionServiceGetPayload<{ select: typeof injectionServiceSelect }>;
type RawMaterial = Prisma.MaterialGetPayload<{ select: typeof materialSelect }>;
type RawArticle = Prisma.ArticleGetPayload<{ select: typeof articleSelect }>;
type RawManagedPage = Prisma.ManagedPageGetPayload<{ select: typeof managedPageSelect }>;

function mapAdminCategory(row: RawCategory): AdminCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: normalizeImage(row.image),
    displayOrder: row.displayOrder,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

function mapAdminProduct(row: RawProduct): AdminProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    categoryId: row.categoryId,
    images: normalizeImages(row.images),
    specifications: normalizeSpecifications(row.specifications),
    featured: row.featured,
    displayOrder: row.displayOrder,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

function mapAdminInjectionService(row: RawInjectionService): AdminInjectionService {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    images: normalizeImages(row.images),
    specifications: normalizeSpecifications(row.specifications),
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    displayOrder: row.displayOrder,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

function mapAdminMaterial(row: RawMaterial): AdminMaterial {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    family: row.family,
    grade: row.grade,
    manufacturer: row.manufacturer,
    summary: row.summary,
    description: row.description,
    images: normalizeImages(row.images),
    specifications: normalizeSpecifications(row.specifications),
    inquiryAvailable: row.inquiryAvailable,
    displayOrder: row.displayOrder,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

function mapAdminArticle(row: RawArticle): AdminArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    featuredImage: normalizeImage(row.featuredImage),
    displayOrder: row.displayOrder,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

function mapAdminManagedPage(row: RawManagedPage): AdminManagedPage {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    images: normalizeImages(row.images),
    displayOrder: row.displayOrder,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

function pagination<T>(items: T[], request: { page: number; pageSize: number }, total: number): PageResult<T> {
  return {
    items,
    pageInfo: {
      page: request.page,
      pageSize: request.pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / request.pageSize),
    },
  };
}

function windowFor({ page, pageSize }: { page: number; pageSize: number }) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

async function handleMissing<T>(operation: Promise<T>): Promise<T | null> {
  try {
    return await operation;
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2025') return null;
    throw error;
  }
}

@Injectable()
export class PrismaAdminContentRepository implements AdminContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories(request: AdminListQuery): Promise<PageResult<AdminCategory>> {
    const where: Prisma.CategoryWhereInput = request.status ? { status: request.status } : {};
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({ where, ...windowFor(request), orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: categorySelect }),
    ]);
    return pagination(rows.map(mapAdminCategory), request, total);
  }

  async getCategory(id: string): Promise<AdminCategory | null> {
    const row = await this.prisma.category.findUnique({ where: { id }, select: categorySelect });
    return row === null ? null : mapAdminCategory(row);
  }

  async createCategory(input: CategoryWriteInput): Promise<AdminCategory> {
    const row = await this.prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        image: (input.image ?? undefined) as Prisma.InputJsonValue | undefined,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select: categorySelect,
    });
    return mapAdminCategory(row);
  }

  async updateCategory(id: string, input: Partial<CategoryWriteInput>): Promise<AdminCategory | null> {
    const row = await handleMissing(
      this.prisma.category.update({
        where: { id },
        data: {
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.description === undefined ? {} : { description: input.description }),
          ...(input.image === undefined ? {} : { image: input.image as Prisma.InputJsonValue | null }),
          ...(input.displayOrder === undefined ? {} : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined ? {} : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined ? {} : { metaDescription: input.metaDescription }),
        } as Prisma.CategoryUncheckedUpdateInput,
        select: categorySelect,
      }),
    );
    return row === null ? null : mapAdminCategory(row);
  }

  async setCategoryStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminCategory | null> {
    const row = await handleMissing(
      this.prisma.category.update({ where: { id }, data: { status, ...(publishedAt === null ? {} : { publishedAt }) }, select: categorySelect }),
    );
    return row === null ? null : mapAdminCategory(row);
  }

  async listProducts(request: AdminProductListQuery): Promise<PageResult<AdminProduct>> {
    const where: Prisma.ProductWhereInput = {
      ...(request.status ? { status: request.status } : {}),
      ...(request.featured === undefined ? {} : { featured: request.featured }),
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({ where, ...windowFor(request), orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: productSelect }),
    ]);
    return pagination(rows.map(mapAdminProduct), request, total);
  }

  async getProduct(id: string): Promise<AdminProduct | null> {
    const row = await this.prisma.product.findUnique({ where: { id }, select: productSelect });
    return row === null ? null : mapAdminProduct(row);
  }

  async createProduct(input: ProductWriteInput): Promise<AdminProduct> {
    const row = await this.prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        summary: input.summary ?? null,
        description: input.description ?? null,
        categoryId: input.categoryId ?? null,
        images: (input.images ?? []) as unknown as Prisma.InputJsonValue,
        specifications: (input.specifications ?? []) as unknown as Prisma.InputJsonValue,
        featured: input.featured ?? false,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select: productSelect,
    });
    return mapAdminProduct(row);
  }

  async updateProduct(id: string, input: Partial<ProductWriteInput>): Promise<AdminProduct | null> {
    const row = await handleMissing(
      this.prisma.product.update({
        where: { id },
        data: {
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.summary === undefined ? {} : { summary: input.summary }),
          ...(input.description === undefined ? {} : { description: input.description }),
          ...(input.categoryId === undefined ? {} : { categoryId: input.categoryId }),
          ...(input.images === undefined ? {} : { images: input.images as unknown as Prisma.InputJsonValue }),
          ...(input.specifications === undefined ? {} : { specifications: input.specifications as unknown as Prisma.InputJsonValue }),
          ...(input.featured === undefined ? {} : { featured: input.featured }),
          ...(input.displayOrder === undefined ? {} : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined ? {} : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined ? {} : { metaDescription: input.metaDescription }),
        } as Prisma.ProductUncheckedUpdateInput,
        select: productSelect,
      }),
    );
    return row === null ? null : mapAdminProduct(row);
  }

  async setProductStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminProduct | null> {
    const row = await handleMissing(
      this.prisma.product.update({ where: { id }, data: { status, ...(publishedAt === null ? {} : { publishedAt }) }, select: productSelect }),
    );
    return row === null ? null : mapAdminProduct(row);
  }

  async listInjectionServices(request: AdminListQuery): Promise<PageResult<AdminInjectionService>> {
    const where: Prisma.InjectionServiceWhereInput = request.status ? { status: request.status } : {};
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.injectionService.count({ where }),
      this.prisma.injectionService.findMany({ where, ...windowFor(request), orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: injectionServiceSelect }),
    ]);
    return pagination(rows.map(mapAdminInjectionService), request, total);
  }

  async getInjectionService(id: string): Promise<AdminInjectionService | null> {
    const row = await this.prisma.injectionService.findUnique({ where: { id }, select: injectionServiceSelect });
    return row === null ? null : mapAdminInjectionService(row);
  }

  async createInjectionService(input: InjectionServiceWriteInput): Promise<AdminInjectionService> {
    const row = await this.prisma.injectionService.create({
      data: {
        name: input.name,
        slug: input.slug,
        summary: input.summary ?? null,
        description: input.description ?? null,
        images: (input.images ?? []) as unknown as Prisma.InputJsonValue,
        specifications: (input.specifications ?? []) as unknown as Prisma.InputJsonValue,
        ctaLabel: input.ctaLabel ?? null,
        ctaHref: input.ctaHref ?? null,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select: injectionServiceSelect,
    });
    return mapAdminInjectionService(row);
  }

  async updateInjectionService(id: string, input: Partial<InjectionServiceWriteInput>): Promise<AdminInjectionService | null> {
    const row = await handleMissing(
      this.prisma.injectionService.update({
        where: { id },
        data: {
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.summary === undefined ? {} : { summary: input.summary }),
          ...(input.description === undefined ? {} : { description: input.description }),
          ...(input.images === undefined ? {} : { images: input.images as unknown as Prisma.InputJsonValue }),
          ...(input.specifications === undefined ? {} : { specifications: input.specifications as unknown as Prisma.InputJsonValue }),
          ...(input.ctaLabel === undefined ? {} : { ctaLabel: input.ctaLabel }),
          ...(input.ctaHref === undefined ? {} : { ctaHref: input.ctaHref }),
          ...(input.displayOrder === undefined ? {} : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined ? {} : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined ? {} : { metaDescription: input.metaDescription }),
        } as Prisma.InjectionServiceUncheckedUpdateInput,
        select: injectionServiceSelect,
      }),
    );
    return row === null ? null : mapAdminInjectionService(row);
  }

  async setInjectionServiceStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminInjectionService | null> {
    const row = await handleMissing(
      this.prisma.injectionService.update({ where: { id }, data: { status, ...(publishedAt === null ? {} : { publishedAt }) }, select: injectionServiceSelect }),
    );
    return row === null ? null : mapAdminInjectionService(row);
  }

  async listMaterials(request: AdminListQuery): Promise<PageResult<AdminMaterial>> {
    const where: Prisma.MaterialWhereInput = request.status ? { status: request.status } : {};
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.material.count({ where }),
      this.prisma.material.findMany({ where, ...windowFor(request), orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: materialSelect }),
    ]);
    return pagination(rows.map(mapAdminMaterial), request, total);
  }

  async getMaterial(id: string): Promise<AdminMaterial | null> {
    const row = await this.prisma.material.findUnique({ where: { id }, select: materialSelect });
    return row === null ? null : mapAdminMaterial(row);
  }

  async createMaterial(input: MaterialWriteInput): Promise<AdminMaterial> {
    const row = await this.prisma.material.create({
      data: {
        name: input.name,
        slug: input.slug,
        family: input.family ?? null,
        grade: input.grade ?? null,
        manufacturer: input.manufacturer ?? null,
        summary: input.summary ?? null,
        description: input.description ?? null,
        images: (input.images ?? []) as unknown as Prisma.InputJsonValue,
        specifications: (input.specifications ?? []) as unknown as Prisma.InputJsonValue,
        inquiryAvailable: input.inquiryAvailable ?? true,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select: materialSelect,
    });
    return mapAdminMaterial(row);
  }

  async updateMaterial(id: string, input: Partial<MaterialWriteInput>): Promise<AdminMaterial | null> {
    const row = await handleMissing(
      this.prisma.material.update({
        where: { id },
        data: {
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.family === undefined ? {} : { family: input.family }),
          ...(input.grade === undefined ? {} : { grade: input.grade }),
          ...(input.manufacturer === undefined ? {} : { manufacturer: input.manufacturer }),
          ...(input.summary === undefined ? {} : { summary: input.summary }),
          ...(input.description === undefined ? {} : { description: input.description }),
          ...(input.images === undefined ? {} : { images: input.images as unknown as Prisma.InputJsonValue }),
          ...(input.specifications === undefined ? {} : { specifications: input.specifications as unknown as Prisma.InputJsonValue }),
          ...(input.inquiryAvailable === undefined ? {} : { inquiryAvailable: input.inquiryAvailable }),
          ...(input.displayOrder === undefined ? {} : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined ? {} : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined ? {} : { metaDescription: input.metaDescription }),
        } as Prisma.MaterialUncheckedUpdateInput,
        select: materialSelect,
      }),
    );
    return row === null ? null : mapAdminMaterial(row);
  }

  async setMaterialStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminMaterial | null> {
    const row = await handleMissing(
      this.prisma.material.update({ where: { id }, data: { status, ...(publishedAt === null ? {} : { publishedAt }) }, select: materialSelect }),
    );
    return row === null ? null : mapAdminMaterial(row);
  }

  async listArticles(request: AdminListQuery): Promise<PageResult<AdminArticle>> {
    const where: Prisma.ArticleWhereInput = request.status ? { status: request.status } : {};
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({ where, ...windowFor(request), orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: articleSelect }),
    ]);
    return pagination(rows.map(mapAdminArticle), request, total);
  }

  async getArticle(id: string): Promise<AdminArticle | null> {
    const row = await this.prisma.article.findUnique({ where: { id }, select: articleSelect });
    return row === null ? null : mapAdminArticle(row);
  }

  async createArticle(input: ArticleWriteInput): Promise<AdminArticle> {
    const row = await this.prisma.article.create({
      data: {
        title: input.title,
        slug: input.slug,
        summary: input.summary ?? null,
        body: input.body,
        featuredImage: (input.featuredImage ?? undefined) as Prisma.InputJsonValue | undefined,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select: articleSelect,
    });
    return mapAdminArticle(row);
  }

  async updateArticle(id: string, input: Partial<ArticleWriteInput>): Promise<AdminArticle | null> {
    const row = await handleMissing(
      this.prisma.article.update({
        where: { id },
        data: {
          ...(input.title === undefined ? {} : { title: input.title }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.summary === undefined ? {} : { summary: input.summary }),
          ...(input.body === undefined ? {} : { body: input.body }),
          ...(input.featuredImage === undefined ? {} : { featuredImage: input.featuredImage as Prisma.InputJsonValue | null }),
          ...(input.displayOrder === undefined ? {} : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined ? {} : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined ? {} : { metaDescription: input.metaDescription }),
        } as Prisma.ArticleUncheckedUpdateInput,
        select: articleSelect,
      }),
    );
    return row === null ? null : mapAdminArticle(row);
  }

  async setArticleStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminArticle | null> {
    const row = await handleMissing(
      this.prisma.article.update({ where: { id }, data: { status, ...(publishedAt === null ? {} : { publishedAt }) }, select: articleSelect }),
    );
    return row === null ? null : mapAdminArticle(row);
  }

  async listManagedPages(request: AdminListQuery): Promise<PageResult<AdminManagedPage>> {
    const where: Prisma.ManagedPageWhereInput = request.status ? { status: request.status } : {};
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.managedPage.count({ where }),
      this.prisma.managedPage.findMany({ where, ...windowFor(request), orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: managedPageSelect }),
    ]);
    return pagination(rows.map(mapAdminManagedPage), request, total);
  }

  async getManagedPage(id: string): Promise<AdminManagedPage | null> {
    const row = await this.prisma.managedPage.findUnique({ where: { id }, select: managedPageSelect });
    return row === null ? null : mapAdminManagedPage(row);
  }

  async createManagedPage(input: ManagedPageWriteInput): Promise<AdminManagedPage> {
    const row = await this.prisma.managedPage.create({
      data: {
        title: input.title,
        slug: input.slug,
        summary: input.summary ?? null,
        body: input.body,
        images: (input.images ?? []) as unknown as Prisma.InputJsonValue,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select: managedPageSelect,
    });
    return mapAdminManagedPage(row);
  }

  async updateManagedPage(id: string, input: Partial<ManagedPageWriteInput>): Promise<AdminManagedPage | null> {
    const row = await handleMissing(
      this.prisma.managedPage.update({
        where: { id },
        data: {
          ...(input.title === undefined ? {} : { title: input.title }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.summary === undefined ? {} : { summary: input.summary }),
          ...(input.body === undefined ? {} : { body: input.body }),
          ...(input.images === undefined ? {} : { images: input.images as unknown as Prisma.InputJsonValue }),
          ...(input.displayOrder === undefined ? {} : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined ? {} : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined ? {} : { metaDescription: input.metaDescription }),
        } as Prisma.ManagedPageUncheckedUpdateInput,
        select: managedPageSelect,
      }),
    );
    return row === null ? null : mapAdminManagedPage(row);
  }

  async setManagedPageStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminManagedPage | null> {
    const row = await handleMissing(
      this.prisma.managedPage.update({ where: { id }, data: { status, ...(publishedAt === null ? {} : { publishedAt }) }, select: managedPageSelect }),
    );
    return row === null ? null : mapAdminManagedPage(row);
  }
}
