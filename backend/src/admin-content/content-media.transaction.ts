import { BadRequestException, ConflictException } from '@nestjs/common';
import type { ContentImage } from '../content-shared/stored-content.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { AdminManagedImageDto } from './dto/admin-image.dto.js';
import type { AdminContentPrismaClient } from './shared/prisma-repository.js';

interface ManagedReference {
  mediaAssetId: string;
  alt: string;
  position: number;
}

export interface PreparedProductMedia {
  projection: ContentImage[];
  references: ManagedReference[];
}

export interface PreparedArticleMedia {
  projection: ContentImage | null;
  reference: Omit<ManagedReference, 'position'> | null;
}

export interface ContentMediaTransaction {
  prepareProduct(images: AdminManagedImageDto[]): Promise<PreparedProductMedia>;
  replaceProductReferences(productId: string, references: ManagedReference[]): Promise<void>;
  productHasReferences(productId: string): Promise<boolean>;
  prepareArticle(image: AdminManagedImageDto | null): Promise<PreparedArticleMedia>;
  replaceArticleReference(articleId: string, reference: PreparedArticleMedia['reference']): Promise<void>;
  articleHasReference(articleId: string): Promise<boolean>;
  assertProductPublishable(productId: string): Promise<void>;
  assertArticlePublishable(articleId: string): Promise<void>;
}

type Variant = { name: string; width: number; height: number };

function variants(value: Prisma.JsonValue): Variant[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Variant =>
    Boolean(item && typeof item === 'object' && !Array.isArray(item) &&
      typeof (item as Record<string, unknown>).name === 'string' &&
      typeof (item as Record<string, unknown>).width === 'number' &&
      typeof (item as Record<string, unknown>).height === 'number'));
}

function mediaNotReady(): never {
  throw new ConflictException({ code: 'MEDIA_NOT_READY' });
}

export class PrismaContentMediaTransaction implements ContentMediaTransaction {
  constructor(
    private readonly prisma: AdminContentPrismaClient,
    private readonly publicOrigin: string,
  ) {}

  async prepareProduct(images: AdminManagedImageDto[]): Promise<PreparedProductMedia> {
    const managedIds = images.flatMap((image) => image.mediaAssetId ? [image.mediaAssetId] : []);
    if (new Set(managedIds).size !== managedIds.length) {
      throw new BadRequestException({ code: 'DUPLICATE_MEDIA_ASSET' });
    }
    const assets = await this.readyAssets(managedIds);
    const references: ManagedReference[] = [];
    const projection = images.map((image, position) => {
      if (image.mediaAssetId) {
        references.push({ mediaAssetId: image.mediaAssetId, alt: image.alt, position });
        return this.projection(image.mediaAssetId, image.alt, assets);
      }
      return this.legacyProjection(image);
    });
    return { projection, references };
  }

  async replaceProductReferences(productId: string, references: ManagedReference[]): Promise<void> {
    await this.prisma.mediaReference.deleteMany({ where: { productId } });
    if (references.length > 0) {
      await this.prisma.mediaReference.createMany({
        data: references.map((reference) => ({
          ...reference,
          productId,
          usage: 'PRODUCT_GALLERY' as const,
        })),
      });
    }
  }

  async productHasReferences(productId: string): Promise<boolean> {
    return (await this.prisma.mediaReference.count({ where: { productId } })) > 0;
  }

  async prepareArticle(image: AdminManagedImageDto | null): Promise<PreparedArticleMedia> {
    if (!image) return { projection: null, reference: null };
    if (!image.mediaAssetId) {
      return { projection: this.legacyProjection(image), reference: null };
    }
    const assets = await this.readyAssets([image.mediaAssetId]);
    return {
      projection: this.projection(image.mediaAssetId, image.alt, assets),
      reference: { mediaAssetId: image.mediaAssetId, alt: image.alt },
    };
  }

  async replaceArticleReference(articleId: string, reference: PreparedArticleMedia['reference']): Promise<void> {
    await this.prisma.mediaReference.deleteMany({ where: { articleId } });
    if (reference) {
      await this.prisma.mediaReference.create({
        data: { ...reference, articleId, usage: 'ARTICLE_FEATURED' },
      });
    }
  }

  async articleHasReference(articleId: string): Promise<boolean> {
    return (await this.prisma.mediaReference.count({ where: { articleId } })) > 0;
  }

  async assertProductPublishable(productId: string): Promise<void> {
    await this.assertReferencesPublishable({ productId });
  }

  async assertArticlePublishable(articleId: string): Promise<void> {
    await this.assertReferencesPublishable({ articleId });
  }

  private async readyAssets(ids: string[]) {
    if (ids.length === 0) return new Map<string, Variant[]>();
    const rows = await this.prisma.mediaAsset.findMany({
      where: { id: { in: ids }, status: 'READY' },
      select: { id: true, variants: true },
    });
    if (rows.length !== ids.length) mediaNotReady();
    return new Map(rows.map((row) => [row.id, variants(row.variants)]));
  }

  private projection(id: string, alt: string, assets: Map<string, Variant[]>): ContentImage {
    const detail = assets.get(id)?.find((variant) => variant.name === 'detail');
    if (!detail) mediaNotReady();
    return {
      url: `${this.publicOrigin}/api/v1/media/public/${id}/detail`,
      alt,
      width: detail.width,
      height: detail.height,
    };
  }

  private legacyProjection(image: AdminManagedImageDto): ContentImage {
    if (!image.url) throw new BadRequestException({ code: 'INVALID_IMAGE_SOURCE' });
    return {
      url: image.url,
      alt: image.alt,
      ...(image.width === undefined ? {} : { width: image.width }),
      ...(image.height === undefined ? {} : { height: image.height }),
    };
  }

  private async assertReferencesPublishable(where: { productId: string } | { articleId: string }): Promise<void> {
    const references = await this.prisma.mediaReference.findMany({
      where,
      select: { mediaAsset: { select: { status: true, variants: true } } },
    });
    const required = ['thumb', 'card', 'detail'];
    for (const reference of references) {
      const names = new Set(variants(reference.mediaAsset.variants).map((variant) => variant.name));
      if (reference.mediaAsset.status !== 'READY' || required.some((name) => !names.has(name))) {
        mediaNotReady();
      }
    }
  }
}
