import { describe, expect, it, vi } from 'vitest';
import { MediaMaintenanceService } from './media-maintenance.service.js';
import type { PrismaService } from '../database/prisma.service.js';
import type { MediaStorage } from './storage/media-storage.js';
import { Readable } from 'node:stream';

describe('MediaMaintenanceService', () => {
  const now = new Date('2026-10-27T12:00:00.000Z');

  describe('cleanup', () => {
    it('executes cleanup in dry-run mode without modifying DB or deleting files', async () => {
      const mockStorage = {
        cleanTemporaryFiles: vi.fn().mockResolvedValue(['.tmp/old-part.part']),
        delete: vi.fn(),
      } as unknown as MediaStorage;

      const mockPrisma = {
        mediaAsset: {
          findMany: vi.fn().mockResolvedValue([
            { id: 'asset-unattached-1', variants: [{ name: 'thumb', key: 'objects/1/thumb.webp', bytes: 100, checksumSha256: 'abc' }] },
          ]),
        },
      } as unknown as PrismaService;

      const service = new MediaMaintenanceService(mockPrisma, mockStorage, {
        tempRetentionHours: 24,
        unattachedRetentionDays: 30,
      } as never);

      const report = await service.cleanup({ dryRun: true, now });

      expect(report.dryRun).toBe(true);
      expect(report.temporaryFilesCleaned).toBe(1);
      expect(report.temporaryFileKeys).toEqual(['.tmp/old-part.part']);
      expect(report.unattachedAssetsCleaned).toBe(1);
      expect(report.unattachedAssetIds).toEqual(['asset-unattached-1']);

      expect(mockStorage.cleanTemporaryFiles).toHaveBeenCalledWith(expect.any(Date), true);
      expect(mockStorage.delete).not.toHaveBeenCalled();
    });

    it('performs live cleanup of unattached assets and records audit event', async () => {
      const mockStorage = {
        cleanTemporaryFiles: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as MediaStorage;

      const mockTx = {
        mediaAsset: {
          findUnique: vi.fn().mockResolvedValue({ id: 'asset-1', status: 'READY', _count: { references: 0 } }),
          update: vi.fn().mockResolvedValue({ id: 'asset-1' }),
        },
        securityAuditEvent: {
          create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
        },
      };

      const mockPrisma = {
        mediaAsset: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 'asset-1',
              variants: [{ name: 'thumb', key: 'objects/1/thumb.webp', width: 320, height: 240, bytes: 500, checksumSha256: 'hash' }],
              _count: { references: 0 },
            },
          ]),
          update: vi.fn().mockResolvedValue({ id: 'asset-1' }),
        },
        securityAuditEvent: {
          create: vi.fn().mockResolvedValue({ id: 'audit-2' }),
        },
        $transaction: vi.fn().mockImplementation((cb) => (typeof cb === 'function' ? cb(mockTx) : Promise.all(cb))),
      } as unknown as PrismaService;

      const service = new MediaMaintenanceService(mockPrisma, mockStorage, {
        tempRetentionHours: 24,
        unattachedRetentionDays: 30,
      } as never);

      const report = await service.cleanup({ dryRun: false, now });

      expect(report.dryRun).toBe(false);
      expect(report.unattachedAssetsCleaned).toBe(1);
      expect(mockStorage.delete).toHaveBeenCalledWith('objects/1/thumb.webp');
    });

    it('preserves an asset if it gains a reference before cleanup commits', async () => {
      const mockStorage = {
        cleanTemporaryFiles: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      } as unknown as MediaStorage;

      const mockTx = {
        mediaAsset: {
          // Fresh lookup during transaction reveals asset was just referenced by a Product!
          findUnique: vi.fn().mockResolvedValue({ id: 'asset-raced', status: 'READY', _count: { references: 1 } }),
          update: vi.fn(),
        },
      };

      const mockPrisma = {
        mediaAsset: {
          findMany: vi.fn().mockResolvedValue([
            { id: 'asset-raced', variants: [], _count: { references: 0 } },
          ]),
        },
        $transaction: vi.fn().mockImplementation((cb) => (typeof cb === 'function' ? cb(mockTx) : Promise.all(cb))),
      } as unknown as PrismaService;

      const service = new MediaMaintenanceService(mockPrisma, mockStorage);
      const report = await service.cleanup({ dryRun: false, now });

      // Asset was protected and skipped!
      expect(report.unattachedAssetsCleaned).toBe(0);
      expect(mockStorage.delete).not.toHaveBeenCalled();
      expect(mockTx.mediaAsset.update).not.toHaveBeenCalled();
    });
  });

  describe('reconciliation', () => {
    it('detects missing, corrupt, and orphaned files correctly', async () => {
      const mockStorage = {
        exists: vi.fn().mockImplementation(async (key: string) => key === 'objects/asset1/card.webp'),
        getChecksum: vi.fn().mockImplementation(async (key: string) => {
          if (key === 'objects/asset1/card.webp') return 'corrupt-checksum';
          return 'ok';
        }),
        listAllKeys: vi.fn().mockResolvedValue([
          'objects/asset1/card.webp',
          'objects/orphaned/unused.webp',
        ]),
      } as unknown as MediaStorage;

      const mockPrisma = {
        mediaAsset: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 'asset-1',
              variants: [
                { name: 'card', key: 'objects/asset1/card.webp', width: 800, height: 600, bytes: 1000, checksumSha256: 'expected-checksum' },
                { name: 'detail', key: 'objects/asset1/detail.webp', width: 1600, height: 1200, bytes: 3000, checksumSha256: 'detail-hash' },
              ],
            },
          ]),
        },
      } as unknown as PrismaService;

      const service = new MediaMaintenanceService(mockPrisma, mockStorage);
      const report = await service.reconcile({ verifyChecksums: true });

      expect(report.totalAssetsChecked).toBe(1);
      // detail variant is missing
      expect(report.missingVariants).toHaveLength(1);
      expect(report.missingVariants[0]).toMatchObject({ assetId: 'asset-1', variantName: 'detail' });

      // card variant has corrupt checksum
      expect(report.corruptVariants).toHaveLength(1);
      expect(report.corruptVariants[0]).toMatchObject({ assetId: 'asset-1', variantName: 'card' });

      // orphaned file not in DB
      expect(report.orphanedKeys).toEqual(['objects/orphaned/unused.webp']);
    });
  });

  describe('manifest and migration', () => {
    it('exports a portable manifest of assets and copies/verifies to target storage', async () => {
      const mockPrisma = {
        mediaAsset: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 'asset-1',
              status: 'READY',
              objectPrefix: 'objects/p1',
              sourceChecksumSha256: 'src-hash',
              sourceMimeType: 'image/webp',
              sourceWidth: 800,
              sourceHeight: 600,
              defaultAlt: 'قالب پلاستیک',
              variants: [
                { name: 'thumb', key: 'objects/p1/thumb.webp', width: 320, height: 240, bytes: 50, checksumSha256: 'thumb-hash' },
              ],
            },
          ]),
        },
      } as unknown as PrismaService;

      const sourceStorage = {
        open: vi.fn().mockResolvedValue(Readable.from(['image-bytes'])),
      } as unknown as MediaStorage;

      const targetStorage = {
        put: vi.fn().mockResolvedValue({ key: '.tmp/part1.part', bytesWritten: 11, checksumSha256: 'thumb-hash' }),
        finalize: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn(),
      } as unknown as MediaStorage;

      const service = new MediaMaintenanceService(mockPrisma, sourceStorage);
      const manifest = await service.exportManifest();

      expect(manifest.version).toBe('1.0');
      expect(manifest.assets).toHaveLength(1);
      expect(manifest.assets[0].defaultAlt).toBe('قالب پلاستیک');

      const migrationResult = await service.migrateLibrary(targetStorage, manifest);
      expect(migrationResult.copied).toBe(1);
      expect(migrationResult.verified).toBe(1);

      expect(targetStorage.finalize).toHaveBeenCalledWith('.tmp/part1.part', 'objects/p1/thumb.webp');
    });

    it('returns bounded operational metrics for media storage and assets', async () => {
      const mockPrisma = {
        mediaAsset: {
          count: vi.fn()
            .mockResolvedValueOnce(10) // totalReady
            .mockResolvedValueOnce(0)  // totalProcessing
            .mockResolvedValueOnce(1)  // totalFailed
            .mockResolvedValueOnce(3), // unattachedReady
        },
      } as unknown as PrismaService;

      const service = new MediaMaintenanceService(mockPrisma, {} as never);
      const metrics = await service.getMetrics();

      expect(metrics.assets).toEqual({
        totalReady: 10,
        totalProcessing: 0,
        totalFailed: 1,
        unattachedReady: 3,
      });
      expect(metrics.storage.availableBytes).toBeGreaterThanOrEqual(0);
      expect(metrics.storage.usagePercent).toBeGreaterThanOrEqual(0);
    });
  });
});
