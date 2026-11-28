import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import type { S3Client } from '@aws-sdk/client-s3';
import { describe, expect, it } from 'vitest';
import { UnsafeMediaKeyError } from './media-storage.errors.js';
import { S3MediaStorage } from './s3.storage.js';

interface StoredObject {
  body: Buffer;
  metadata?: Record<string, string>;
  lastModified: Date;
}

function createMockS3Client() {
  const objects = new Map<string, StoredObject>();
  let failHeadBucket = false;

  const client = {
    send: async (command: { constructor: { name: string }; input: Record<string, unknown> }) => {
      const name = command.constructor.name;
      const input = command.input;

      if (name === 'PutObjectCommand') {
        objects.set(String(input.Key), {
          body: Buffer.from(input.Body as Buffer),
          metadata: (input.Metadata as Record<string, string> | undefined) ?? {},
          lastModified: new Date(),
        });
        return {};
      }

      if (name === 'GetObjectCommand') {
        const item = objects.get(String(input.Key));
        if (!item) {
          const error = new Error('NoSuchKey');
          error.name = 'NoSuchKey';
          throw error;
        }
        return { Body: Readable.from(item.body) };
      }

      if (name === 'HeadObjectCommand') {
        const item = objects.get(String(input.Key));
        if (!item) {
          const error = new Error('NotFound');
          error.name = 'NotFound';
          throw error;
        }
        return { Metadata: item.metadata ?? {} };
      }

      if (name === 'CopyObjectCommand') {
        const copySource = decodeURIComponent(String(input.CopySource));
        const slash = copySource.indexOf('/');
        const sourceKey = copySource.slice(slash + 1);
        const item = objects.get(sourceKey);
        if (!item) {
          const error = new Error('NoSuchKey');
          error.name = 'NoSuchKey';
          throw error;
        }
        objects.set(String(input.Key), {
          body: Buffer.from(item.body),
          metadata: { ...item.metadata },
          lastModified: new Date(),
        });
        return {};
      }

      if (name === 'DeleteObjectCommand') {
        objects.delete(String(input.Key));
        return {};
      }

      if (name === 'HeadBucketCommand') {
        if (failHeadBucket) throw new Error('Bucket unreachable');
        return {};
      }

      if (name === 'ListObjectsV2Command') {
        const prefix = String(input.Prefix ?? '');
        const contents = [...objects.entries()]
          .filter(([key]) => !prefix || key.startsWith(prefix))
          .map(([key, item]) => ({ Key: key, LastModified: item.lastModified }));
        return { Contents: contents, IsTruncated: false };
      }

      throw new Error(`Unsupported command: ${name}`);
    },
  } as unknown as S3Client;

  return {
    client,
    objects,
    setFailHeadBucket: (value: boolean) => {
      failHeadBucket = value;
    },
  };
}

async function readStream(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

describe('S3MediaStorage', () => {
  const config = {
    endpoint: 'http://127.0.0.1:9000',
    region: 'us-east-1',
    bucket: 'toranj-media',
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
    forcePathStyle: true,
    keyPrefix: 'backend',
  };

  it('supports put, finalize, exists, open, getChecksum, listAllKeys, and delete', async () => {
    const mock = createMockS3Client();
    const storage = new S3MediaStorage(config, mock.client);
    const payload = Buffer.from('toranj-s3-media-bytes');
    const expectedSha = createHash('sha256').update(payload).digest('hex');

    const temp = await storage.put(Readable.from(payload));
    expect(temp.key).toMatch(/^\.tmp\/.+\.part$/);
    expect(temp.bytesWritten).toBe(payload.length);
    expect(temp.checksumSha256).toBe(expectedSha);
    expect(mock.objects.has(`backend/${temp.key}`)).toBe(true);

    await storage.finalize(temp.key, 'objects/asset-1/original.webp');
    expect(await storage.exists(temp.key)).toBe(false);
    expect(await storage.exists('objects/asset-1/original.webp')).toBe(true);
    expect(mock.objects.has('backend/objects/asset-1/original.webp')).toBe(true);

    const downloaded = await readStream(await storage.open('objects/asset-1/original.webp'));
    expect(downloaded).toEqual(payload);
    expect(await storage.getChecksum('objects/asset-1/original.webp')).toBe(expectedSha);
    expect(await storage.listAllKeys()).toEqual(['objects/asset-1/original.webp']);

    await storage.delete('objects/asset-1/original.webp');
    expect(await storage.exists('objects/asset-1/original.webp')).toBe(false);
    // Idempotent delete
    await storage.delete('objects/asset-1/original.webp');
  });

  it('rejects unsafe keys and prevents overwriting existing targets on finalize', async () => {
    const mock = createMockS3Client();
    const storage = new S3MediaStorage(config, mock.client);

    await expect(storage.exists('../secret')).rejects.toThrow(UnsafeMediaKeyError);
    await expect(storage.exists('/leading/slash')).rejects.toThrow(UnsafeMediaKeyError);
    await expect(storage.open('windows\\path')).rejects.toThrow(UnsafeMediaKeyError);
    await expect(storage.finalize('objects/not-temp.webp', 'objects/dest.webp')).rejects.toThrow(
      UnsafeMediaKeyError,
    );

    const first = await storage.put(Readable.from(Buffer.from('one')));
    await storage.finalize(first.key, 'objects/shared.webp');
    const second = await storage.put(Readable.from(Buffer.from('two')));
    await expect(storage.finalize(second.key, 'objects/shared.webp')).rejects.toThrow(
      UnsafeMediaKeyError,
    );
  });

  it('checks bucket readiness and prunes expired temporary objects', async () => {
    const mock = createMockS3Client();
    const storage = new S3MediaStorage(config, mock.client);

    expect(await storage.checkReadiness()).toBe(true);
    mock.setFailHeadBucket(true);
    expect(await storage.checkReadiness()).toBe(false);

    const temp = await storage.put(Readable.from(Buffer.from('stale')));
    const entry = mock.objects.get(`backend/${temp.key}`);
    if (entry) entry.lastModified = new Date(Date.now() - 3_600_000);

    const dry = await storage.cleanTemporaryFiles(new Date(Date.now() - 60_000), true);
    expect(dry).toEqual([temp.key]);
    expect(await storage.exists(temp.key)).toBe(true);

    const pruned = await storage.cleanTemporaryFiles(new Date(Date.now() - 60_000), false);
    expect(pruned).toEqual([temp.key]);
    expect(await storage.exists(temp.key)).toBe(false);
  });
});
