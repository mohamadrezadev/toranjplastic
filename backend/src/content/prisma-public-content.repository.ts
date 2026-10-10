import { Injectable } from '@nestjs/common';
import { ContentStatus, type Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import type {
  PageRequest,
  PageResult,
  ProductPageRequest,
  PublicArticle,
  PublicCategory,
  PublicInjectionService,
  PublicManagedPage,
  PublicMaterial,
  PublicProduct,
} from './content.types.js';
import {
  mapArticle,
  mapCategory,
  mapManagedPage,
  mapMaterial,
  mapProduct,
  mapService,
} from './public-content.mapper.js';
import type { PublicContentRepository } from './public-content.repository.js';

const seoSelect = {
  metaTitle: true,
  metaDescription: true,
  publishedAt: true,
} as const;

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  ...seoSelect,
} satisfies Prisma.CategorySelect;

const productSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  description: true,
  images: true,
  specifications: true,
  featured: true,
  category: { select: { id: true, name: true, slug: true } },
  ...seoSelect,
} satisfies Prisma.ProductSelect;

const serviceSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  description: true,
  images: true,
  specifications: true,
  ctaLabel: true,
  ctaHref: true,
  ...seoSelect,
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
  ...seoSelect,
} satisfies Prisma.MaterialSelect;

const articleSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  body: true,
  featuredImage: true,
  ...seoSelect,
} satisfies Prisma.ArticleSelect;

const pageSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  body: true,
  images: true,
  ...seoSelect,
} satisfies Prisma.ManagedPageSelect;

function publishedWhere(now: Date) {
  return {
    status: ContentStatus.PUBLISHED,
    publishedAt: { not: null, lte: now },
  } as const;
}

function pagination<T>(items: T[], request: PageRequest, total: number): PageResult<T> {
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

function windowFor({ page, pageSize }: PageRequest) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

@Injectable()
export class PrismaPublicContentRepository implements PublicContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories(request: PageRequest): Promise<PageResult<PublicCategory>> {
    const where = publishedWhere(new Date());
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        ...windowFor(request),
        orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'asc' }],
        select: categorySelect,
      }),
    ]);
    return pagination(rows.map(mapCategory), request, total);
  }

  async listProducts(request: ProductPageRequest): Promise<PageResult<PublicProduct>> {
    const now = new Date();
    const where: Prisma.ProductWhereInput = {
      ...publishedWhere(now),
      ...(request.featured === undefined ? {} : { featured: request.featured }),
      OR: [
        { categoryId: null },
        { category: { is: publishedWhere(now) } },
      ],
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        ...windowFor(request),
        orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'asc' }],
        select: productSelect,
      }),
    ]);
    return pagination(rows.map(mapProduct), request, total);
  }

  async findProduct(slug: string): Promise<PublicProduct | null> {
    const now = new Date();
    const row = await this.prisma.product.findFirst({
      where: {
        slug,
        ...publishedWhere(now),
        OR: [{ categoryId: null }, { category: { is: publishedWhere(now) } }],
      },
      select: productSelect,
    });
    return row === null ? null : mapProduct(row);
  }

  async listServices(request: PageRequest): Promise<PageResult<PublicInjectionService>> {
    const where = publishedWhere(new Date());
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.injectionService.count({ where }),
      this.prisma.injectionService.findMany({
        where,
        ...windowFor(request),
        orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'asc' }],
        select: serviceSelect,
      }),
    ]);
    return pagination(rows.map(mapService), request, total);
  }

  async findService(slug: string): Promise<PublicInjectionService | null> {
    const row = await this.prisma.injectionService.findFirst({
      where: { slug, ...publishedWhere(new Date()) },
      select: serviceSelect,
    });
    return row === null ? null : mapService(row);
  }

  async listMaterials(request: PageRequest): Promise<PageResult<PublicMaterial>> {
    const where = publishedWhere(new Date());
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.material.count({ where }),
      this.prisma.material.findMany({
        where,
        ...windowFor(request),
        orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'asc' }],
        select: materialSelect,
      }),
    ]);
    return pagination(rows.map(mapMaterial), request, total);
  }

  async findMaterial(slug: string): Promise<PublicMaterial | null> {
    const row = await this.prisma.material.findFirst({
      where: { slug, ...publishedWhere(new Date()) },
      select: materialSelect,
    });
    return row === null ? null : mapMaterial(row);
  }

  async listArticles(request: PageRequest): Promise<PageResult<PublicArticle>> {
    const where = publishedWhere(new Date());
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        ...windowFor(request),
        orderBy: [{ publishedAt: 'desc' }, { displayOrder: 'asc' }, { id: 'asc' }],
        select: articleSelect,
      }),
    ]);
    return pagination(rows.map(mapArticle), request, total);
  }

  async findArticle(slug: string): Promise<PublicArticle | null> {
    const row = await this.prisma.article.findFirst({
      where: { slug, ...publishedWhere(new Date()) },
      select: articleSelect,
    });
    return row === null ? null : mapArticle(row);
  }

  async findPage(slug: string): Promise<PublicManagedPage | null> {
    const row = await this.prisma.managedPage.findFirst({
      where: { slug, ...publishedWhere(new Date()) },
      select: pageSelect,
    });
    return row === null ? null : mapManagedPage(row);
  }
}
