import { Inject, Injectable } from '@nestjs/common';
import {
  normalizeImages,
  normalizeSpecifications,
} from '../../content-shared/stored-content.js';
import { PrismaService } from '../../database/prisma.service.js';
import type { ContentStatus, Prisma } from '../../generated/prisma/client.js';
import {
  handleMissing,
  pagination,
  type AdminContentPrismaClient,
  windowFor,
} from '../shared/prisma-repository.js';
import type { PageResult } from '../shared/types.js';
import type { AdminProductRepository } from './repository.js';
import type {
  AdminProduct,
  AdminProductListQuery,
  ProductWriteInput,
} from './types.js';

const select = {
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
type Row = Prisma.ProductGetPayload<{ select: typeof select }>;
function map(row: Row): AdminProduct {
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
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

@Injectable()
export class PrismaAdminProductRepository implements AdminProductRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: AdminContentPrismaClient,
  ) {}
  async list(
    request: AdminProductListQuery,
  ): Promise<PageResult<AdminProduct>> {
    const where: Prisma.ProductWhereInput = {
      ...(request.status ? { status: request.status } : {}),
      ...(request.featured === undefined ? {} : { featured: request.featured }),
    };
    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        ...windowFor(request),
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        select,
      }),
    ]);
    return pagination(rows.map(map), request, total);
  }
  async get(id: string) {
    const row = await this.prisma.product.findUnique({ where: { id }, select });
    return row ? map(row) : null;
  }
  async create(input: ProductWriteInput) {
    const row = await this.prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        summary: input.summary ?? null,
        description: input.description ?? null,
        categoryId: input.categoryId ?? null,
        images: (input.images ?? []) as unknown as Prisma.InputJsonValue,
        specifications: (input.specifications ??
          []) as unknown as Prisma.InputJsonValue,
        featured: input.featured ?? false,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select,
    });
    return map(row);
  }
  async update(id: string, input: Partial<ProductWriteInput>) {
    const row = await handleMissing(
      this.prisma.product.update({
        where: { id },
        data: {
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.summary === undefined ? {} : { summary: input.summary }),
          ...(input.description === undefined
            ? {}
            : { description: input.description }),
          ...(input.categoryId === undefined
            ? {}
            : { categoryId: input.categoryId }),
          ...(input.images === undefined
            ? {}
            : { images: input.images as unknown as Prisma.InputJsonValue }),
          ...(input.specifications === undefined
            ? {}
            : {
                specifications:
                  input.specifications as unknown as Prisma.InputJsonValue,
              }),
          ...(input.featured === undefined ? {} : { featured: input.featured }),
          ...(input.displayOrder === undefined
            ? {}
            : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined
            ? {}
            : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined
            ? {}
            : { metaDescription: input.metaDescription }),
        } as Prisma.ProductUncheckedUpdateInput,
        select,
      }),
    );
    return row ? map(row) : null;
  }
  async setStatus(id: string, status: ContentStatus, publishedAt: Date | null) {
    const row = await handleMissing(
      this.prisma.product.update({
        where: { id },
        data: { status, ...(publishedAt === null ? {} : { publishedAt }) },
        select,
      }),
    );
    return row ? map(row) : null;
  }
}
