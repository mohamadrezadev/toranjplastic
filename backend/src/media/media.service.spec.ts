import { ConflictException, NotFoundException } from '@nestjs/common';
import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import type { MediaStorage } from './storage/media-storage.js';
import type { ProcessedMedia, ProcessedMediaVariant, MediaImageProcessor } from './processing/media-image.processor.js';
import type { AdminMediaAsset, DeletionCandidate, MediaListQuery, MediaPage, MediaRepository } from './media.types.js';
import { MediaService } from './media.service.js';

const variant: ProcessedMediaVariant = {
  name: 'thumb',
  key: 'objects/a/thumb.webp',
  width: 100,
  height: 50,
  bytes: 20,
  checksumSha256: 'a'.repeat(64),
};

const processed: ProcessedMedia = {
  objectPrefix: 'objects/a',
  sourceMimeType: 'image/png',
  sourceChecksumSha256: 'b'.repeat(64),
  sourceWidth: 100,
  sourceHeight: 50,
  variants: [variant],
};

const dto: AdminMediaAsset = {
  id: 'media-1',
  status: 'READY',
  defaultAlt: 'تصویر',
  sourceMimeType: 'image/png',
  sourceWidth: 100,
  sourceHeight: 50,
  variants: [{ name: 'thumb', width: 100, height: 50, bytes: 20 }],
  referenceCount: 0,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

class FakeRepository implements MediaRepository {
  failedCode: string | null = null;
  deletion: DeletionCandidate = { state: 'pending', variants: [variant] };
  completed = false;
  createProcessing = vi.fn(async () => ({ id: 'media-1' }));
  markReady = vi.fn(async () => dto);
  markFailed = vi.fn(async (_id: string, _actor: string, code: string) => { this.failedCode = code; });
  list = vi.fn(async (_query: MediaListQuery): Promise<MediaPage> => ({ items: [dto], page: 1, pageSize: 20, total: 1, totalPages: 1 }));
  get = vi.fn(async () => dto as AdminMediaAsset | null);
  updateDefaultAlt = vi.fn(async () => dto as AdminMediaAsset | null);
  beginDeletion = vi.fn(async () => this.deletion);
  completeDeletion = vi.fn(async () => { this.completed = true; });
  findPrivateVariant = vi.fn(async () => variant as ProcessedMediaVariant | null);
  findPublicVariant = vi.fn(async () => variant as ProcessedMediaVariant | null);
}

function fixture(process: () => Promise<ProcessedMedia> = async () => processed) {
  const repository = new FakeRepository();
  const deleted: string[] = [];
  const storage: MediaStorage = {
    put: async () => { throw new Error('not used'); },
    open: async () => Readable.from(['webp']),
    exists: async () => true,
    finalize: async () => undefined,
    delete: async (key) => { deleted.push(key); },
  };
  const processor = { process } as unknown as MediaImageProcessor;
  return { repository, storage, deleted, service: new MediaService(repository, storage, processor) };
}

describe('MediaService', () => {
  it('creates PROCESSING state before processing and atomically promotes safe metadata', async () => {
    const { service, repository } = fixture();
    await expect(service.upload(Readable.from(['input']), Promise.resolve('  تصویر محصول  '), 'actor-1')).resolves.toBe(dto);
    expect(repository.createProcessing).toHaveBeenCalledBefore(repository.markReady);
    expect(repository.markReady).toHaveBeenCalledWith('media-1', 'actor-1', 'تصویر محصول', processed);
    expect(repository.failedCode).toBeNull();
  });

  it('marks a processing asset failed with a stable code without exposing storage details', async () => {
    const failure = Object.assign(new Error('C:/secret/mount'), { code: 'MEDIA_INVALID_FILE' });
    const { service, repository } = fixture(async () => { throw failure; });
    await expect(service.upload(Readable.from(['input']), Promise.resolve('تصویر'), 'actor-1')).rejects.toBe(failure);
    expect(repository.failedCode).toBe('MEDIA_INVALID_FILE');
  });

  it('blocks referenced deletion and does not touch storage', async () => {
    const { service, repository, deleted } = fixture();
    repository.deletion = { state: 'in-use' };
    await expect(service.delete('media-1', 'actor-1')).rejects.toBeInstanceOf(ConflictException);
    expect(deleted).toEqual([]);
  });

  it('deletes only repository-owned variant keys and completes lifecycle idempotently', async () => {
    const { service, repository, deleted } = fixture();
    await service.delete('media-1', 'actor-1');
    expect(deleted).toEqual([variant.key]);
    expect(repository.completed).toBe(true);
  });

  it('conceals missing private and public variants with the same not-found boundary', async () => {
    const { service, repository } = fixture();
    repository.findPrivateVariant.mockResolvedValue(null);
    repository.findPublicVariant.mockResolvedValue(null);
    await expect(service.privateVariant('hidden', 'thumb')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.publicVariant('hidden', 'thumb')).rejects.toBeInstanceOf(NotFoundException);
  });
});
