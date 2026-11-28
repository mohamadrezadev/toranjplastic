import { createHash, randomUUID } from 'node:crypto';
import { Transform, type Readable } from 'node:stream';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { S3MediaConfig } from '../../config/environment.js';
import type { MediaStorage, TemporaryMediaObject } from './media-storage.js';
import { UnsafeMediaKeyError } from './media-storage.errors.js';

const TEMPORARY_DIRECTORY = '.tmp';

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return (
    candidate.name === 'NotFound' ||
    candidate.name === 'NoSuchKey' ||
    candidate.$metadata?.httpStatusCode === 404
  );
}

/**
 * Provider-neutral S3-compatible implementation of MediaStorage.
 * Stores objects under an optional prefix while returning and accepting only
 * relative keys so PostgreSQL and public URLs remain provider-independent.
 */
export class S3MediaStorage implements MediaStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly keyPrefix: string;

  constructor(config: S3MediaConfig, client?: S3Client) {
    this.bucket = config.bucket;
    this.keyPrefix = config.keyPrefix ? `${config.keyPrefix.replace(/^\/+|\/+$/g, '')}/` : '';
    this.client =
      client ??
      new S3Client({
        region: config.region,
        ...(config.endpoint ? { endpoint: config.endpoint } : {}),
        forcePathStyle: config.forcePathStyle,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });
  }

  async put(source: Readable): Promise<TemporaryMediaObject> {
    const key = `${TEMPORARY_DIRECTORY}/${randomUUID()}.part`;
    const objectKey = this.toObjectKey(key);
    const hash = createHash('sha256');
    const chunks: Buffer[] = [];
    let bytesWritten = 0;

    const collector = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytesWritten += buf.length;
        hash.update(buf);
        chunks.push(buf);
        callback(null, buf);
      },
    });

    await new Promise<void>((resolve, reject) => {
      source.on('error', reject);
      collector.on('error', reject);
      collector.on('finish', resolve);
      source.pipe(collector);
      collector.resume();
    });

    const checksumSha256 = hash.digest('hex');
    const body = Buffer.concat(chunks, bytesWritten);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
          Body: body,
          ContentLength: bytesWritten,
          Metadata: { sha256: checksumSha256 },
        }),
      );
      return { key, bytesWritten, checksumSha256 };
    } catch (error) {
      await this.delete(key).catch(() => undefined);
      throw error;
    }
  }

  async open(key: string): Promise<Readable> {
    const objectKey = this.toObjectKey(key);
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
    if (!response.Body) {
      throw new UnsafeMediaKeyError();
    }
    return response.Body as Readable;
  }

  async exists(key: string): Promise<boolean> {
    const objectKey = this.toObjectKey(key);
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
        }),
      );
      return true;
    } catch (error) {
      if (isNotFoundError(error)) return false;
      throw error;
    }
  }

  async finalize(temporaryKey: string, finalKey: string): Promise<void> {
    if (!temporaryKey.startsWith(`${TEMPORARY_DIRECTORY}/`)) {
      throw new UnsafeMediaKeyError();
    }
    const sourceObjectKey = this.toObjectKey(temporaryKey);
    const targetObjectKey = this.toObjectKey(finalKey);

    if (!(await this.exists(temporaryKey))) {
      throw new UnsafeMediaKeyError();
    }
    if (await this.exists(finalKey)) {
      throw new UnsafeMediaKeyError();
    }

    const encodedSource = `${this.bucket}/${sourceObjectKey
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`;

    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        Key: targetObjectKey,
        CopySource: encodedSource,
        MetadataDirective: 'COPY',
      }),
    );

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: sourceObjectKey,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    const objectKey = this.toObjectKey(key);
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
  }

  async checkReadiness(): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch {
      return false;
    }
  }

  async cleanTemporaryFiles(olderThan: Date, dryRun = false): Promise<string[]> {
    const prefix = `${this.keyPrefix}${TEMPORARY_DIRECTORY}/`;
    const pruned: string[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );
      for (const item of response.Contents ?? []) {
        if (!item.Key || !item.Key.endsWith('.part')) continue;
        if (item.LastModified && item.LastModified < olderThan) {
          const relativeKey = this.toRelativeKey(item.Key);
          pruned.push(relativeKey);
          if (!dryRun) {
            await this.delete(relativeKey).catch(() => undefined);
          }
        }
      }
      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    return pruned;
  }

  async listAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: this.keyPrefix || undefined,
          ContinuationToken: continuationToken,
        }),
      );
      for (const item of response.Contents ?? []) {
        if (!item.Key) continue;
        const relativeKey = this.toRelativeKey(item.Key);
        if (relativeKey === TEMPORARY_DIRECTORY || relativeKey.startsWith(`${TEMPORARY_DIRECTORY}/`)) {
          continue;
        }
        keys.push(relativeKey);
      }
      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    return keys;
  }

  async getChecksum(key: string): Promise<string> {
    const objectKey = this.toObjectKey(key);
    const head = await this.client.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
    const metadataSha = head.Metadata?.sha256;
    if (metadataSha && /^[a-f0-9]{64}$/i.test(metadataSha)) {
      return metadataSha;
    }

    const stream = await this.open(key);
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private toObjectKey(key: string): string {
    if (
      !key ||
      key.includes('\0') ||
      key.startsWith('/') ||
      key.includes('\\')
    ) {
      throw new UnsafeMediaKeyError();
    }
    const segments = key.split('/');
    if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
      throw new UnsafeMediaKeyError();
    }
    return `${this.keyPrefix}${segments.join('/')}`;
  }

  private toRelativeKey(objectKey: string): string {
    if (this.keyPrefix && objectKey.startsWith(this.keyPrefix)) {
      return objectKey.slice(this.keyPrefix.length);
    }
    return objectKey;
  }
}
