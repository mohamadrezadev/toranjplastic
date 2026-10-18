import { createHash, randomUUID } from 'node:crypto';
import { constants as fsConstants, createReadStream, createWriteStream } from 'node:fs';
import { access, lstat, mkdir, realpath, rename, unlink } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { Transform, type Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { MediaStorage, TemporaryMediaObject } from './media-storage.js';
import { MediaStorageUnavailableError, UnsafeMediaKeyError } from './media-storage.errors.js';

const TEMPORARY_DIRECTORY = '.tmp';

export class MountedDiskStorage implements MediaStorage {
  private readonly root: string;

  constructor(configuredRoot: string) {
    if (!isAbsolute(configuredRoot)) throw new MediaStorageUnavailableError();
    this.root = resolve(configuredRoot);
  }

  async put(source: Readable): Promise<TemporaryMediaObject> {
    await this.assertRoot();
    await this.ensureSafeDirectory(TEMPORARY_DIRECTORY);

    const key = `${TEMPORARY_DIRECTORY}/${randomUUID()}.part`;
    const target = await this.resolveSafeKey(key);
    const hash = createHash('sha256');
    let bytesWritten = 0;
    const counter = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        bytesWritten += chunk.length;
        hash.update(chunk);
        callback(null, chunk);
      },
    });

    try {
      await pipeline(source, counter, createWriteStream(target, { flags: 'wx', mode: 0o600 }));
      return { key, bytesWritten, checksumSha256: hash.digest('hex') };
    } catch (error) {
      await unlink(target).catch(() => undefined);
      throw error;
    }
  }

  async open(key: string): Promise<Readable> {
    await this.assertRoot();
    const target = await this.resolveSafeKey(key);
    const details = await lstat(target).catch(() => null);
    if (!details?.isFile() || details.isSymbolicLink()) throw new UnsafeMediaKeyError();
    return createReadStream(target);
  }

  async exists(key: string): Promise<boolean> {
    await this.assertRoot();
    const target = await this.resolveSafeKey(key);
    const details = await lstat(target).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (!details) return false;
    if (details.isSymbolicLink()) throw new UnsafeMediaKeyError();
    return details.isFile();
  }

  async finalize(temporaryKey: string, finalKey: string): Promise<void> {
    await this.assertRoot();
    if (!temporaryKey.startsWith(`${TEMPORARY_DIRECTORY}/`)) throw new UnsafeMediaKeyError();
    const source = await this.resolveSafeKey(temporaryKey);
    const sourceDetails = await lstat(source).catch(() => null);
    if (!sourceDetails?.isFile() || sourceDetails.isSymbolicLink()) throw new UnsafeMediaKeyError();

    const target = await this.resolveSafeKey(finalKey);
    if (await this.exists(finalKey)) throw new UnsafeMediaKeyError();
    await this.ensureSafeDirectory(relative(this.root, dirname(target)).split(sep).join('/'));
    await rename(source, target);
  }

  async delete(key: string): Promise<void> {
    await this.assertRoot();
    const target = await this.resolveSafeKey(key);
    const details = await lstat(target).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (!details) return;
    if (!details.isFile() || details.isSymbolicLink()) throw new UnsafeMediaKeyError();
    await unlink(target);
  }

  private async assertRoot() {
    try {
      const details = await lstat(this.root);
      if (!details.isDirectory() || details.isSymbolicLink()) throw new Error('unsafe root');
      if ((await realpath(this.root)) !== this.root) throw new Error('unexpected root');
      await access(this.root, fsConstants.R_OK | fsConstants.W_OK);
    } catch {
      throw new MediaStorageUnavailableError();
    }
  }

  private validateKey(key: string) {
    if (!key || key.includes('\\') || key.includes('\0') || isAbsolute(key)) throw new UnsafeMediaKeyError();
    const segments = key.split('/');
    if (segments.some((segment) => !segment || segment === '.' || segment === '..')) throw new UnsafeMediaKeyError();
    return segments;
  }

  private async resolveSafeKey(key: string) {
    const segments = this.validateKey(key);
    const target = resolve(this.root, ...segments);
    const rootPrefix = `${this.root}${sep}`;
    if (!target.startsWith(rootPrefix)) throw new UnsafeMediaKeyError();

    let current = this.root;
    for (const segment of segments) {
      current = resolve(current, segment);
      const details = await lstat(current).catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
      if (!details) break;
      if (details.isSymbolicLink()) throw new UnsafeMediaKeyError();
    }
    return target;
  }

  private async ensureSafeDirectory(key: string) {
    const target = await this.resolveSafeKey(key);
    await mkdir(target, { recursive: true, mode: 0o700 });
    const resolved = await realpath(target);
    if (resolved !== target) throw new UnsafeMediaKeyError();
  }
}
