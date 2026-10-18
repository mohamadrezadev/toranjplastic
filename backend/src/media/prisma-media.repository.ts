import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { ProcessedMedia, ProcessedMediaVariant } from './processing/media-image.processor.js';
import type { AdminMediaAsset, DeletionCandidate, MediaListQuery, MediaPage, MediaRepository } from './media.types.js';

const select = {
  id: true,
  status: true,
  objectPrefix: true,
  sourceMimeType: true,
  sourceWidth: true,
  sourceHeight: true,
  variants: true,
  defaultAlt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { references: true } },
} satisfies Prisma.MediaAssetSelect;

type Row = Prisma.MediaAssetGetPayload<{ select: typeof select }>;

function internalVariants(value: Prisma.JsonValue): ProcessedMediaVariant[] {
  if (!Array.isArray(value)) return [];
  const parsed: ProcessedMediaVariant[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    if (['thumb', 'card', 'detail'].includes(String(row.name)) &&
      typeof row.key === 'string' && typeof row.width === 'number' &&
      typeof row.height === 'number' && typeof row.bytes === 'number' &&
      typeof row.checksumSha256 === 'string') {
      parsed.push({
        name: row.name as ProcessedMediaVariant['name'],
        key: row.key,
        width: row.width,
        height: row.height,
        bytes: row.bytes,
        checksumSha256: row.checksumSha256,
      });
    }
  }
  return parsed;
}

function map(row: Row): AdminMediaAsset {
  return {
    id: row.id,
    status: row.status,
    defaultAlt: row.defaultAlt,
    sourceMimeType: row.sourceMimeType,
    sourceWidth: row.sourceWidth,
    sourceHeight: row.sourceHeight,
    variants: internalVariants(row.variants).map(({ name, width, height, bytes }) => ({ name, width, height, bytes })),
    referenceCount: row._count.references,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  createProcessing(actorId: string, objectPrefix: string) {
    return this.prisma.mediaAsset.create({
      data: { status: 'PROCESSING', objectPrefix, createdById: actorId },
      select: { id: true },
    });
  }

  async markReady(id: string, actorId: string, defaultAlt: string, media: ProcessedMedia) {
    return this.prisma.$transaction(async (transaction) => {
      const row = await transaction.mediaAsset.update({
        where: { id, status: 'PROCESSING' },
        data: {
          status: 'READY',
          defaultAlt,
          sourceChecksumSha256: media.sourceChecksumSha256,
          sourceMimeType: media.sourceMimeType,
          sourceWidth: media.sourceWidth,
          sourceHeight: media.sourceHeight,
          variants: media.variants as unknown as Prisma.InputJsonValue,
        },
        select,
      });
      await transaction.securityAuditEvent.create({
        data: { action: 'MEDIA_READY', userId: actorId, metadata: { mediaAssetId: id } },
      });
      return map(row);
    });
  }

  async markFailed(id: string, actorId: string, failureCode: string) {
    await this.prisma.$transaction([
      this.prisma.mediaAsset.update({ where: { id }, data: { status: 'FAILED', failureCode } }),
      this.prisma.securityAuditEvent.create({
        data: { action: 'MEDIA_FAILED', userId: actorId, metadata: { mediaAssetId: id, failureCode } },
      }),
    ]);
  }

  async list(query: MediaListQuery): Promise<MediaPage> {
    const where: Prisma.MediaAssetWhereInput = {
      status: query.status ?? { not: 'DELETED' },
      ...(query.search ? { defaultAlt: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.mediaAsset.count({ where }),
      this.prisma.mediaAsset.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select,
      }),
    ]);
    return { items: rows.map(map), page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) };
  }

  async get(id: string) {
    const row = await this.prisma.mediaAsset.findFirst({ where: { id, status: { not: 'DELETED' } }, select });
    return row ? map(row) : null;
  }

  async updateDefaultAlt(id: string, actorId: string, defaultAlt: string) {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.mediaAsset.findFirst({ where: { id, status: 'READY' }, select: { id: true } });
      if (!existing) return null;
      const row = await transaction.mediaAsset.update({ where: { id }, data: { defaultAlt }, select });
      await transaction.securityAuditEvent.create({ data: { action: 'MEDIA_ALT_UPDATED', userId: actorId, metadata: { mediaAssetId: id } } });
      return map(row);
    });
  }

  async beginDeletion(id: string, actorId: string): Promise<DeletionCandidate> {
    return this.prisma.$transaction(async (transaction) => {
      const row = await transaction.mediaAsset.findUnique({ where: { id }, select });
      if (!row) return { state: 'missing' };
      if (row._count.references > 0) return { state: 'in-use' };
      const variants = internalVariants(row.variants);
      if (row.status === 'DELETED') return { state: 'deleted' };
      if (row.status !== 'DELETION_PENDING') {
        await transaction.mediaAsset.update({ where: { id }, data: { status: 'DELETION_PENDING' } });
        await transaction.securityAuditEvent.create({ data: { action: 'MEDIA_DELETION_REQUESTED', userId: actorId, metadata: { mediaAssetId: id } } });
      }
      return { state: 'pending', variants };
    });
  }

  async completeDeletion(id: string, actorId: string) {
    await this.prisma.$transaction([
      this.prisma.mediaAsset.update({ where: { id }, data: { status: 'DELETED', deletedAt: new Date() } }),
      this.prisma.securityAuditEvent.create({ data: { action: 'MEDIA_DELETED', userId: actorId, metadata: { mediaAssetId: id } } }),
    ]);
  }

  async findPrivateVariant(id: string, variant: ProcessedMediaVariant['name']) {
    const row = await this.prisma.mediaAsset.findFirst({
      where: { id, status: 'READY' },
      select: { variants: true },
    });
    return row ? internalVariants(row.variants).find((item) => item.name === variant) ?? null : null;
  }

  async findPublicVariant(id: string, variant: ProcessedMediaVariant['name'], now: Date) {
    const publication = { status: 'PUBLISHED' as const, publishedAt: { not: null, lte: now } };
    const row = await this.prisma.mediaAsset.findFirst({
      where: {
        id,
        status: 'READY',
        references: {
          some: {
            OR: [
              {
                usage: 'PRODUCT_GALLERY',
                product: {
                  is: {
                    ...publication,
                    OR: [
                      { categoryId: null },
                      { category: { is: publication } },
                    ],
                  },
                },
              },
              { usage: 'ARTICLE_FEATURED', article: { is: publication } },
            ],
          },
        },
      },
      select: { variants: true },
    });
    return row ? internalVariants(row.variants).find((item) => item.name === variant) ?? null : null;
  }
}
