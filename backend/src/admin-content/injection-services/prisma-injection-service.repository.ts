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
import type { AdminListQuery, PageResult } from '../shared/types.js';
import type { AdminInjectionServiceRepository } from './repository.js';
import type {
  AdminInjectionService,
  InjectionServiceWriteInput,
} from './types.js';

const select = {
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
type Row = Prisma.InjectionServiceGetPayload<{ select: typeof select }>;
function map(row: Row): AdminInjectionService {
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
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

@Injectable()
export class PrismaAdminInjectionServiceRepository implements AdminInjectionServiceRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: AdminContentPrismaClient,
  ) {}
  async list(
    request: AdminListQuery,
  ): Promise<PageResult<AdminInjectionService>> {
    const where: Prisma.InjectionServiceWhereInput = request.status
      ? { status: request.status }
      : {};
    const [total, rows] = await Promise.all([
      this.prisma.injectionService.count({ where }),
      this.prisma.injectionService.findMany({
        where,
        ...windowFor(request),
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        select,
      }),
    ]);
    return pagination(rows.map(map), request, total);
  }
  async get(id: string) {
    const row = await this.prisma.injectionService.findUnique({
      where: { id },
      select,
    });
    return row ? map(row) : null;
  }
  async create(input: InjectionServiceWriteInput) {
    const row = await this.prisma.injectionService.create({
      data: {
        name: input.name,
        slug: input.slug,
        summary: input.summary ?? null,
        description: input.description ?? null,
        images: (input.images ?? []) as unknown as Prisma.InputJsonValue,
        specifications: (input.specifications ??
          []) as unknown as Prisma.InputJsonValue,
        ctaLabel: input.ctaLabel ?? null,
        ctaHref: input.ctaHref ?? null,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select,
    });
    return map(row);
  }
  async update(id: string, input: Partial<InjectionServiceWriteInput>) {
    const row = await handleMissing(
      this.prisma.injectionService.update({
        where: { id },
        data: {
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.summary === undefined ? {} : { summary: input.summary }),
          ...(input.description === undefined
            ? {}
            : { description: input.description }),
          ...(input.images === undefined
            ? {}
            : { images: input.images as unknown as Prisma.InputJsonValue }),
          ...(input.specifications === undefined
            ? {}
            : {
                specifications:
                  input.specifications as unknown as Prisma.InputJsonValue,
              }),
          ...(input.ctaLabel === undefined ? {} : { ctaLabel: input.ctaLabel }),
          ...(input.ctaHref === undefined ? {} : { ctaHref: input.ctaHref }),
          ...(input.displayOrder === undefined
            ? {}
            : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined
            ? {}
            : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined
            ? {}
            : { metaDescription: input.metaDescription }),
        } as Prisma.InjectionServiceUncheckedUpdateInput,
        select,
      }),
    );
    return row ? map(row) : null;
  }
  async setStatus(id: string, status: ContentStatus, publishedAt: Date | null) {
    const row = await handleMissing(
      this.prisma.injectionService.update({
        where: { id },
        data: { status, ...(publishedAt === null ? {} : { publishedAt }) },
        select,
      }),
    );
    return row ? map(row) : null;
  }
}
