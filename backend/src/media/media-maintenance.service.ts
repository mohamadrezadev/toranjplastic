import { Inject, Injectable, Optional } from '@nestjs/common';
import type { AppEnvironment } from '../config/environment.js';
import { PrismaService } from '../database/prisma.service.js';
import { MEDIA_CONFIG } from './media.tokens.js';
import type { ProcessedMediaVariant } from './processing/media-image.processor.js';
import { MEDIA_STORAGE, type MediaStorage } from './storage/media-storage.js';

export interface MediaMetrics {
  storage: {
    availableBytes: number;
    totalBytes: number;
    usagePercent: number;
  };
  assets: {
    totalReady: number;
    totalProcessing: number;
    totalFailed: number;
    unattachedReady: number;
  };
}

export interface CleanupReport {
  dryRun: boolean;
  temporaryFilesCleaned: number;
  temporaryFileKeys: string[];
  unattachedAssetsCleaned: number;
  unattachedAssetIds: string[];
}

export interface ReconciliationReport {
  totalAssetsChecked: number;
  missingVariants: { assetId: string; variantName: string; key: string }[];
  corruptVariants: { assetId: string; variantName: string; key: string }[];
  orphanedKeys: string[];
}

export interface ManifestAssetVariant {
  name: string;
  key: string;
  width: number;
  height: number;
  bytes: number;
  checksumSha256: string;
}

export interface ManifestAsset {
  id: string;
  status: string;
  objectPrefix: string;
  sourceChecksumSha256: string | null;
  sourceMimeType: string | null;
  sourceWidth: number | null;
  sourceHeight: number | null;
  defaultAlt: string | null;
  variants: ManifestAssetVariant[];
}

export interface MediaManifest {
  version: '1.0';
  exportedAt: string;
  assets: ManifestAsset[];
}

function parseVariants(raw: unknown): ManifestAssetVariant[] {
  if (!Array.isArray(raw)) return [];
  const list: ManifestAssetVariant[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    if (
      typeof row.name === 'string' &&
      typeof row.key === 'string' &&
      typeof row.width === 'number' &&
      typeof row.height === 'number' &&
      typeof row.bytes === 'number' &&
      typeof row.checksumSha256 === 'string'
    ) {
      list.push({
        name: row.name,
        key: row.key,
        width: row.width,
        height: row.height,
        bytes: row.bytes,
        checksumSha256: row.checksumSha256,
      });
    }
  }
  return list;
}

@Injectable()
export class MediaMaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStorage,
    @Optional() @Inject(MEDIA_CONFIG) private readonly config?: AppEnvironment['media'],
  ) {}

  async cleanup(options: {
    dryRun?: boolean;
    batchSize?: number;
    now?: Date;
    actorId?: string;
  } = {}): Promise<CleanupReport> {
    const now = options.now ?? new Date();
    const dryRun = options.dryRun ?? false;
    const batchSize = options.batchSize ?? 50;
    const actorId = options.actorId ?? 'system-maintenance';

    // 1. Temporary files cleanup
    const tempRetentionHours = this.config?.tempRetentionHours ?? 24;
    const tempOlderThan = new Date(now.getTime() - tempRetentionHours * 60 * 60 * 1000);
    const cleanedTempKeys = await this.storage.cleanTemporaryFiles(tempOlderThan, dryRun);

    // 2. Unattached assets cleanup
    const unattachedRetentionDays = this.config?.unattachedRetentionDays ?? 30;
    const unattachedOlderThan = new Date(now.getTime() - unattachedRetentionDays * 24 * 60 * 60 * 1000);

    const candidates = await this.prisma.mediaAsset.findMany({
      where: {
        status: 'READY',
        createdAt: { lt: unattachedOlderThan },
        references: { none: {} },
      },
      take: batchSize,
      select: {
        id: true,
        variants: true,
        _count: { select: { references: true } },
      },
    });

    const cleanedAssetIds: string[] = [];

    if (dryRun) {
      for (const candidate of candidates) {
        cleanedAssetIds.push(candidate.id);
      }
    } else {
      for (const candidate of candidates) {
        // Re-check references inside a transaction
        const shouldDelete = await this.prisma.$transaction(async (tx) => {
          const fresh = await tx.mediaAsset.findUnique({
            where: { id: candidate.id },
            select: { id: true, status: true, _count: { select: { references: true } } },
          });

          // Guard against race conditions: if asset gained reference, preserve it!
          if (!fresh || fresh.status !== 'READY' || fresh._count.references > 0) {
            return false;
          }

          await tx.mediaAsset.update({
            where: { id: candidate.id },
            data: { status: 'DELETION_PENDING' },
          });
          return true;
        });

        if (!shouldDelete) continue;

        // Physical deletion of variants
        const variants = parseVariants(candidate.variants);
        await Promise.all(variants.map((v) => this.storage.delete(v.key).catch(() => undefined)));

        // Finalize deletion in DB
        await this.prisma.$transaction([
          this.prisma.mediaAsset.update({
            where: { id: candidate.id },
            data: { status: 'DELETED', deletedAt: now },
          }),
          this.prisma.securityAuditEvent.create({
            data: {
              action: 'MEDIA_UNATTACHED_CLEANUP',
              userId: actorId,
              metadata: { mediaAssetId: candidate.id },
            },
          }),
        ]);

        cleanedAssetIds.push(candidate.id);
      }

      // Record batch audit event
      if (cleanedTempKeys.length > 0 || cleanedAssetIds.length > 0) {
        await this.prisma.securityAuditEvent.create({
          data: {
            action: 'MEDIA_CLEANUP_BATCH',
            userId: actorId,
            metadata: {
              temporaryFilesCleaned: cleanedTempKeys.length,
              unattachedAssetsCleaned: cleanedAssetIds.length,
              dryRun: false,
            },
          },
        });
      }
    }

    return {
      dryRun,
      temporaryFilesCleaned: cleanedTempKeys.length,
      temporaryFileKeys: cleanedTempKeys,
      unattachedAssetsCleaned: cleanedAssetIds.length,
      unattachedAssetIds: cleanedAssetIds,
    };
  }

  async reconcile(options: { verifyChecksums?: boolean } = {}): Promise<ReconciliationReport> {
    const verifyChecksums = options.verifyChecksums ?? false;

    const assets = await this.prisma.mediaAsset.findMany({
      where: { status: { not: 'DELETED' } },
      select: { id: true, variants: true },
    });

    const knownKeys = new Set<string>();
    const missingVariants: ReconciliationReport['missingVariants'] = [];
    const corruptVariants: ReconciliationReport['corruptVariants'] = [];

    for (const asset of assets) {
      const variants = parseVariants(asset.variants);
      for (const variant of variants) {
        knownKeys.add(variant.key);
        const exists = await this.storage.exists(variant.key);
        if (!exists) {
          missingVariants.push({
            assetId: asset.id,
            variantName: variant.name,
            key: variant.key,
          });
          continue;
        }

        if (verifyChecksums) {
          const actualChecksum = await this.storage.getChecksum(variant.key).catch(() => null);
          if (actualChecksum && actualChecksum !== variant.checksumSha256) {
            corruptVariants.push({
              assetId: asset.id,
              variantName: variant.name,
              key: variant.key,
            });
          }
        }
      }
    }

    // Identify orphaned storage files
    const allDiskKeys = await this.storage.listAllKeys();
    const orphanedKeys = allDiskKeys.filter((diskKey) => !knownKeys.has(diskKey));

    return {
      totalAssetsChecked: assets.length,
      missingVariants,
      corruptVariants,
      orphanedKeys,
    };
  }

  async exportManifest(): Promise<MediaManifest> {
    const assets = await this.prisma.mediaAsset.findMany({
      where: { status: { not: 'DELETED' } },
      select: {
        id: true,
        status: true,
        objectPrefix: true,
        sourceChecksumSha256: true,
        sourceMimeType: true,
        sourceWidth: true,
        sourceHeight: true,
        defaultAlt: true,
        variants: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      assets: assets.map((a) => ({
        id: a.id,
        status: a.status,
        objectPrefix: a.objectPrefix,
        sourceChecksumSha256: a.sourceChecksumSha256,
        sourceMimeType: a.sourceMimeType,
        sourceWidth: a.sourceWidth,
        sourceHeight: a.sourceHeight,
        defaultAlt: a.defaultAlt,
        variants: parseVariants(a.variants),
      })),
    };
  }

  async migrateLibrary(
    targetStorage: MediaStorage,
    manifest: MediaManifest,
  ): Promise<{ copied: number; verified: number }> {
    let copied = 0;
    let verified = 0;

    for (const asset of manifest.assets) {
      for (const variant of asset.variants) {
        const stream = await this.storage.open(variant.key);
        const temp = await targetStorage.put(stream);
        if (temp.checksumSha256 !== variant.checksumSha256) {
          await targetStorage.delete(temp.key).catch(() => undefined);
          throw new Error(`Checksum mismatch during migration of ${variant.key}`);
        }
        await targetStorage.finalize(temp.key, variant.key);
        copied++;
        verified++;
      }
    }

    return { copied, verified };
  }

  async getMetrics(): Promise<MediaMetrics> {
    const [readyCount, processingCount, failedCount, unattachedCount] = await Promise.all([
      this.prisma.mediaAsset.count({ where: { status: 'READY' } }),
      this.prisma.mediaAsset.count({ where: { status: 'PROCESSING' } }),
      this.prisma.mediaAsset.count({ where: { status: 'FAILED' } }),
      this.prisma.mediaAsset.count({ where: { status: 'READY', references: { none: {} } } }),
    ]);

    let availableBytes = 0;
    let totalBytes = 0;
    let usagePercent = 0;

    try {
      const { statfs } = await import('node:fs/promises');
      const stats = await statfs(this.config?.root ?? process.cwd());
      availableBytes = Number(stats.bavail) * Number(stats.bsize);
      totalBytes = Number(stats.blocks) * Number(stats.bsize);
      usagePercent = totalBytes > 0 ? Math.round(((totalBytes - availableBytes) / totalBytes) * 100) : 0;
    } catch {
      // safe fallback
    }

    return {
      storage: {
        availableBytes,
        totalBytes,
        usagePercent,
      },
      assets: {
        totalReady: readyCount,
        totalProcessing: processingCount,
        totalFailed: failedCount,
        unattachedReady: unattachedCount,
      },
    };
  }
}
