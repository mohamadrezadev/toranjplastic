import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import { MEDIA_STORAGE, type MediaStorage } from './storage/media-storage.js';
import { MEDIA_REPOSITORY, type MediaListQuery, type MediaRepository } from './media.types.js';
import { MediaImageProcessor } from './processing/media-image.processor.js';

@Injectable()
export class MediaService {
  constructor(
    @Inject(MEDIA_REPOSITORY) private readonly repository: MediaRepository,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStorage,
    private readonly processor: MediaImageProcessor,
  ) {}

  list(query: MediaListQuery) { return this.repository.list(query); }

  async get(id: string) {
    const asset = await this.repository.get(id);
    if (!asset) throw new NotFoundException();
    return asset;
  }

  async upload(source: Readable, defaultAltPromise: Promise<string>, actorId: string) {
    const objectPrefix = `objects/${randomUUID().slice(0, 2)}/${randomUUID()}`;
    const processing = await this.repository.createProcessing(actorId, objectPrefix);
    try {
      const [media, defaultAlt] = await Promise.all([
        this.processor.process(source, objectPrefix),
        defaultAltPromise,
      ]);
      const normalizedAlt = defaultAlt.trim();
      if (normalizedAlt.length < 1 || normalizedAlt.length > 300) throw new Error('MEDIA_INVALID_ALT');
      return await this.repository.markReady(processing.id, actorId, normalizedAlt, media);
    } catch (error) {
      const failureCode = typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
        ? error.code : 'MEDIA_PROCESSING_FAILED';
      await this.repository.markFailed(processing.id, actorId, failureCode).catch(() => undefined);
      throw error;
    }
  }

  async updateDefaultAlt(id: string, defaultAlt: string, actorId: string) {
    const asset = await this.repository.updateDefaultAlt(id, actorId, defaultAlt);
    if (!asset) throw new NotFoundException();
    return asset;
  }

  async delete(id: string, actorId: string) {
    const candidate = await this.repository.beginDeletion(id, actorId);
    if (candidate.state === 'missing') throw new NotFoundException();
    if (candidate.state === 'in-use') throw new ConflictException({ code: 'MEDIA_IN_USE', message: 'این رسانه در حال استفاده است.' });
    if (candidate.state === 'deleted') return;
    await Promise.all((candidate.variants ?? []).map((variant) => this.storage.delete(variant.key)));
    await this.repository.completeDeletion(id, actorId);
  }

  async privateVariant(id: string, variantName: 'thumb' | 'card' | 'detail') {
    const variant = await this.repository.findPrivateVariant(id, variantName);
    if (!variant) throw new NotFoundException();
    return { stream: await this.storage.open(variant.key), etag: variant.checksumSha256 };
  }

  async publicVariant(id: string, variantName: 'thumb' | 'card' | 'detail') {
    const variant = await this.repository.findPublicVariant(id, variantName, new Date());
    if (!variant) throw new NotFoundException();
    try {
      return { stream: await this.storage.open(variant.key), etag: variant.checksumSha256 };
    } catch {
      throw new NotFoundException();
    }
  }
}
