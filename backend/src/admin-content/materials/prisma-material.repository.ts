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
import type { AdminMaterialRepository } from './repository.js';
import type { AdminMaterial, MaterialWriteInput } from './types.js';

const select = {
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
type Row = Prisma.MaterialGetPayload<{ select: typeof select }>;
function map(row: Row): AdminMaterial {
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
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

@Injectable()
export class PrismaAdminMaterialRepository implements AdminMaterialRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: AdminContentPrismaClient,
  ) {}
  async list(request: AdminListQuery): Promise<PageResult<AdminMaterial>> {
    const where: Prisma.MaterialWhereInput = request.status
      ? { status: request.status }
      : {};
    const [total, rows] = await Promise.all([
      this.prisma.material.count({ where }),
      this.prisma.material.findMany({
        where,
        ...windowFor(request),
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        select,
      }),
    ]);
    return pagination(rows.map(map), request, total);
  }
  async get(id: string) {
    const row = await this.prisma.material.findUnique({
      where: { id },
      select,
    });
    return row ? map(row) : null;
  }
  async create(input: MaterialWriteInput) {
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
        specifications: (input.specifications ??
          []) as unknown as Prisma.InputJsonValue,
        inquiryAvailable: input.inquiryAvailable ?? true,
        displayOrder: input.displayOrder ?? 0,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: 'DRAFT',
      },
      select,
    });
    return map(row);
  }
  async update(id: string, input: Partial<MaterialWriteInput>) {
    const row = await handleMissing(
      this.prisma.material.update({
        where: { id },
        data: {
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.slug === undefined ? {} : { slug: input.slug }),
          ...(input.family === undefined ? {} : { family: input.family }),
          ...(input.grade === undefined ? {} : { grade: input.grade }),
          ...(input.manufacturer === undefined
            ? {}
            : { manufacturer: input.manufacturer }),
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
          ...(input.inquiryAvailable === undefined
            ? {}
            : { inquiryAvailable: input.inquiryAvailable }),
          ...(input.displayOrder === undefined
            ? {}
            : { displayOrder: input.displayOrder }),
          ...(input.metaTitle === undefined
            ? {}
            : { metaTitle: input.metaTitle }),
          ...(input.metaDescription === undefined
            ? {}
            : { metaDescription: input.metaDescription }),
        } as Prisma.MaterialUncheckedUpdateInput,
        select,
      }),
    );
    return row ? map(row) : null;
  }
  async setStatus(id: string, status: ContentStatus, publishedAt: Date | null) {
    const row = await handleMissing(
      this.prisma.material.update({
        where: { id },
        data: { status, ...(publishedAt === null ? {} : { publishedAt }) },
        select,
      }),
    );
    return row ? map(row) : null;
  }
}
