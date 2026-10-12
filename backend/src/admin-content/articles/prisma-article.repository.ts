import { Inject, Injectable } from '@nestjs/common';
import { normalizeImage } from '../../content-shared/stored-content.js';
import { PrismaService } from '../../database/prisma.service.js';
import type { ContentStatus, Prisma } from '../../generated/prisma/client.js';
import {
  handleMissing,
  pagination,
  type AdminContentPrismaClient,
  windowFor,
} from '../shared/prisma-repository.js';
import type { AdminListQuery, PageResult } from '../shared/types.js';
import type { AdminArticleRepository } from './repository.js';
import type { AdminArticle, ArticleWriteInput } from './types.js';

const select = {
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
type Row = Prisma.ArticleGetPayload<{ select: typeof select }>;
function map(row: Row): AdminArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    featuredImage: normalizeImage(row.featuredImage),
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
export class PrismaAdminArticleRepository implements AdminArticleRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: AdminContentPrismaClient,
  ) {}
  async list(request: AdminListQuery): Promise<PageResult<AdminArticle>> {
    const where: Prisma.ArticleWhereInput = request.status
      ? { status: request.status }
      : {};
    const [total, rows] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        ...windowFor(request),
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        select,
      }),
    ]);
    return pagination(rows.map(map), request, total);
  }
  async get(id: string) {
    const row = await this.prisma.article.findUnique({ where: { id }, select });
    return row ? map(row) : null;
  }
  async create(input: ArticleWriteInput) {
    const row = await this.prisma.article.create({
      data: {
        title: input.title,
        slug: input.slug,
        summary: input.summary ?? null,
        body: input.body,
        featuredImage: (input.featuredImage ?? undefined) as
          Prisma.InputJsonValue | undefined,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select,
    });
    return map(row);
  }
  async update(id: string, input: Partial<ArticleWriteInput>) {
    const row = await handleMissing(
      this.prisma.article.update({
        where: { id },
        data: {
          ...(input.title === undefined ? {} : { title: input.title }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.summary === undefined ? {} : { summary: input.summary }),
          ...(input.body === undefined ? {} : { body: input.body }),
          ...(input.featuredImage === undefined
            ? {}
            : {
                featuredImage:
                  input.featuredImage as Prisma.InputJsonValue | null,
              }),
          ...(input.displayOrder === undefined
            ? {}
            : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined
            ? {}
            : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined
            ? {}
            : { metaDescription: input.metaDescription }),
        } as Prisma.ArticleUncheckedUpdateInput,
        select,
      }),
    );
    return row ? map(row) : null;
  }
  async setStatus(id: string, status: ContentStatus, publishedAt: Date | null) {
    const row = await handleMissing(
      this.prisma.article.update({
        where: { id },
        data: { status, ...(publishedAt === null ? {} : { publishedAt }) },
        select,
      }),
    );
    return row ? map(row) : null;
  }
}
