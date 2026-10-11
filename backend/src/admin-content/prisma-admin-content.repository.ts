import { Injectable } from '@nestjs/common';
import type { ContentStatus, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { normalizeImage, normalizeImages, normalizeSpecifications } from '../content/public-content.mapper.js';
import type { AdminContentRepository } from './admin-content.repository.js';
import type {
  AdminCategory,
  AdminListQuery,
  AdminProduct,
  AdminProductListQuery,
  CategoryWriteInput,
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

type RawCategory = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;
type RawProduct = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

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
}
