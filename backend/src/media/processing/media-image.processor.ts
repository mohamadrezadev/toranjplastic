import { randomUUID } from 'node:crypto';
import { Transform, type Readable } from 'node:stream';
import sharp, { type OutputInfo } from 'sharp';
import type { MediaStorage } from '../storage/media-storage.js';
import { MediaStorageUnavailableError } from '../storage/media-storage.errors.js';
import {
  MediaInvalidFileError,
  MediaPixelLimitError,
  MediaUploadTooLargeError,
} from './media-processing.errors.js';
import { ProcessingSemaphore } from './processing-semaphore.js';

export type MediaVariantName = 'thumb' | 'card' | 'detail';

export interface ProcessedMediaVariant {
  name: MediaVariantName;
  key: string;
  width: number;
  height: number;
  bytes: number;
  checksumSha256: string;
}

export interface ProcessedMedia {
  objectPrefix: string;
  sourceMimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  sourceChecksumSha256: string;
  sourceWidth: number;
  sourceHeight: number;
  variants: ProcessedMediaVariant[];
}

export interface MediaImageProcessorOptions {
  maxUploadBytes: number;
  maxPixels: number;
  processingConcurrency: number;
}

const variants: ReadonlyArray<{ name: MediaVariantName; width: number }> = [
  { name: 'thumb', width: 320 },
  { name: 'card', width: 800 },
  { name: 'detail', width: 1600 },
];

export class MediaImageProcessor {
  private readonly semaphore: ProcessingSemaphore;

  constructor(
    private readonly storage: MediaStorage,
    private readonly options: MediaImageProcessorOptions,
  ) {
    this.semaphore = new ProcessingSemaphore(options.processingConcurrency);
  }

  async process(source: Readable, objectPrefix?: string): Promise<ProcessedMedia> {
    return this.semaphore.run(() => this.processImage(source, objectPrefix));
  }

  private async processImage(source: Readable, requestedPrefix?: string): Promise<ProcessedMedia> {
    const limiter = new Transform({
      transform: (chunk: Buffer, _encoding, callback) => {
        limiterBytes += chunk.length;
        callback(
          limiterBytes > this.options.maxUploadBytes ? new MediaUploadTooLargeError() : null,
          chunk,
        );
      },
    });
    let limiterBytes = 0;
    source.pipe(limiter);

    const raw = await this.storage.put(limiter);
    const pendingKeys = new Set<string>();
    const finalizedKeys = new Set<string>();
    try {
      const sourceMimeType = await this.detectMime(raw.key);
      const objectPrefix = requestedPrefix ?? `objects/${randomUUID().slice(0, 2)}/${randomUUID()}`;
      const metadataInput = await this.storage.open(raw.key);
      const analyzer = sharp({ limitInputPixels: this.options.maxPixels, sequentialRead: true, failOn: 'warning' });
      const metadataPromise = analyzer.metadata();
      metadataInput.pipe(analyzer);
      const metadata = await metadataPromise;
      if (!metadata.width || !metadata.height) throw new MediaInvalidFileError();
      if (metadata.width * metadata.height > this.options.maxPixels) throw new MediaPixelLimitError();

      const variantPromises = variants.map(async (variant) => {
        const variantInput = await this.storage.open(raw.key);
        const output = sharp({ limitInputPixels: this.options.maxPixels, sequentialRead: true, failOn: 'warning' })
          .rotate()
          .resize({ width: variant.width, withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 82, effort: 4 });
        const info = new Promise<OutputInfo>((resolve, reject) => {
          output.once('info', resolve);
          output.once('error', reject);
        });
        const temporaryPromise = this.storage.put(output);
        variantInput.pipe(output);
        const [temporary, outputInfo] = await Promise.all([temporaryPromise, info]);
        pendingKeys.add(temporary.key);
        const finalKey = `${objectPrefix}/${variant.name}.webp`;
        await this.storage.finalize(temporary.key, finalKey);
        pendingKeys.delete(temporary.key);
        finalizedKeys.add(finalKey);
        return {
          name: variant.name,
          key: finalKey,
          width: outputInfo.width,
          height: outputInfo.height,
          bytes: temporary.bytesWritten,
          checksumSha256: temporary.checksumSha256,
        };
      });

      const processedVariants = await Promise.all(variantPromises);

      return {
        objectPrefix,
        sourceMimeType,
        sourceChecksumSha256: raw.checksumSha256,
        sourceWidth: metadata.width,
        sourceHeight: metadata.height,
        variants: processedVariants,
      };
    } catch (error) {
      await Promise.all([
        ...Array.from(pendingKeys, (key) => this.storage.delete(key)),
        ...Array.from(finalizedKeys, (key) => this.storage.delete(key)),
      ]);
      if (error instanceof MediaUploadTooLargeError || error instanceof MediaPixelLimitError) throw error;
      if (error instanceof MediaInvalidFileError) throw error;
      if (error instanceof MediaStorageUnavailableError) throw error;
      if (error instanceof Error && error.message.toLowerCase().includes('pixel limit')) {
        throw new MediaPixelLimitError();
      }
      throw new MediaInvalidFileError();
    } finally {
      await this.storage.delete(raw.key);
    }
  }

  private async detectMime(key: string): Promise<ProcessedMedia['sourceMimeType']> {
    const source = await this.storage.open(key);
    const iterator = source[Symbol.asyncIterator]();
    const first = await iterator.next();
    await iterator.return?.();
    const bytes = Buffer.isBuffer(first.value) ? first.value : Buffer.from(first.value ?? []);

    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
    if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    throw new MediaInvalidFileError();
  }
}
