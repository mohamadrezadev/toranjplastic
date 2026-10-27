import type { Readable } from 'node:stream';

export const MEDIA_STORAGE = Symbol('MEDIA_STORAGE');

export interface TemporaryMediaObject {
  key: string;
  bytesWritten: number;
  checksumSha256: string;
}

export interface MediaStorage {
  put(source: Readable): Promise<TemporaryMediaObject>;
  open(key: string): Promise<Readable>;
  exists(key: string): Promise<boolean>;
  finalize(temporaryKey: string, finalKey: string): Promise<void>;
  delete(key: string): Promise<void>;
  checkReadiness(minFreeBytes?: number): Promise<boolean>;
  cleanTemporaryFiles(olderThan: Date, dryRun?: boolean): Promise<string[]>;
  listAllKeys(): Promise<string[]>;
  getChecksum(key: string): Promise<string>;
}
