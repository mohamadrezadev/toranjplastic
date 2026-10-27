import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import { MountedDiskStorage } from '../storage/mounted-disk.storage.js';
import { MediaInvalidFileError, MediaPixelLimitError, MediaUploadTooLargeError } from './media-processing.errors.js';
import { MediaImageProcessor } from './media-image.processor.js';

const roots: string[] = [];

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'toranj-processor-test-'));
  roots.push(root);
  const storage = new MountedDiskStorage(root);
  return {
    root,
    storage,
    processor: new MediaImageProcessor(storage, {
      maxUploadBytes: 1_048_576,
      maxPixels: 20_000_000,
      processingConcurrency: 2,
    }),
  };
}

async function raster(format: 'jpeg' | 'png' | 'webp', width = 1800, height = 900) {
  const image = sharp({
    create: { width, height, channels: 3, background: { r: 20, g: 100, b: 180 } },
  });
  return image[format]().toBuffer();
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('MediaImageProcessor', () => {
  it.each([
    ['jpeg', 'image/jpeg'],
    ['png', 'image/png'],
    ['webp', 'image/webp'],
  ] as const)('normalizes valid %s input into bounded WebP variants', async (format, mime) => {
    const { processor, storage } = await fixture();
    const result = await processor.process(Readable.from([await raster(format)]));

    expect(result.sourceMimeType).toBe(mime);
    expect(result.sourceWidth).toBe(1800);
    expect(result.variants.map((variant) => variant.width)).toEqual([320, 800, 1600]);
    expect(new Set(result.variants.map((variant) => variant.checksumSha256)).size).toBe(3);

    for (const variant of result.variants) {
      const metadata = await sharp(await streamBuffer(await storage.open(variant.key))).metadata();
      expect(metadata.format).toBe('webp');
      expect(metadata.exif).toBeUndefined();
      expect(metadata.width).toBeLessThanOrEqual(variant.name === 'thumb' ? 320 : variant.name === 'card' ? 800 : 1600);
    }
  }, 15000);

  it.each([
    Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
    Buffer.from('<html>not an image</html>'),
    Buffer.from('MZ executable'),
    Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x01]),
  ])('rejects unsupported, forged, or corrupt content', async (input) => {
    const { processor, root } = await fixture();
    await expect(processor.process(Readable.from([input]))).rejects.toBeInstanceOf(MediaInvalidFileError);
    expect(await storedFiles(root)).toEqual([]);
  });

  it('stops streaming when the byte limit is exceeded and leaves no file residue', async () => {
    const { root, storage } = await fixture();
    const processor = new MediaImageProcessor(storage, {
      maxUploadBytes: 16,
      maxPixels: 20_000_000,
      processingConcurrency: 1,
    });
    await expect(processor.process(Readable.from([Buffer.alloc(17)]))).rejects.toBeInstanceOf(MediaUploadTooLargeError);
    expect(await storedFiles(root)).toEqual([]);
  });

  it('rejects decoded images above the configured pixel limit without permanent residue', async () => {
    const { root, storage } = await fixture();
    const processor = new MediaImageProcessor(storage, {
      maxUploadBytes: 1_048_576,
      maxPixels: 5_000,
      processingConcurrency: 1,
    });
    await expect(processor.process(Readable.from([await raster('png', 100, 100)]))).rejects.toBeInstanceOf(MediaPixelLimitError);
    expect(await storedFiles(root)).toEqual([]);
  });

  it('does not upscale a source smaller than every target variant', async () => {
    const { processor } = await fixture();
    const result = await processor.process(Readable.from([await raster('png', 100, 50)]));
    expect(result.variants.map(({ width, height }) => [width, height])).toEqual([
      [100, 50],
      [100, 50],
      [100, 50],
    ]);
  });
});

async function streamBuffer(stream: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function storedFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
}
