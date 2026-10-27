import { createReadStream } from 'node:fs';
import { mkdtemp, mkdir, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { text } from 'node:stream/consumers';
import { afterEach, describe, expect, it } from 'vitest';
import { MediaStorageUnavailableError, UnsafeMediaKeyError } from './media-storage.errors.js';
import { MountedDiskStorage } from './mounted-disk.storage.js';

const roots: string[] = [];

async function temporaryRoot() {
  const root = await mkdtemp(join(tmpdir(), 'toranj-media-test-'));
  roots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('MountedDiskStorage', () => {
  it('streams to a random temporary key and atomically finalizes it', async () => {
    const root = await temporaryRoot();
    const storage = new MountedDiskStorage(root);

    const pending = await storage.put(Readable.from(['portable-media']));
    expect(pending.key).toMatch(/^\.tmp\/[a-f0-9-]+\.part$/);
    expect(pending.bytesWritten).toBe(14);
    expect(pending.checksumSha256).toHaveLength(64);
    expect(await storage.exists('objects/a/asset.webp')).toBe(false);

    await storage.finalize(pending.key, 'objects/a/asset.webp');
    expect(await text(await storage.open('objects/a/asset.webp'))).toBe('portable-media');
    expect(await storage.exists(pending.key)).toBe(false);

    await storage.delete('objects/a/asset.webp');
    await storage.delete('objects/a/asset.webp');
    expect(await storage.exists('objects/a/asset.webp')).toBe(false);
  });

  it('keeps the same relative-key behavior across independent adapter roots', async () => {
    const first = new MountedDiskStorage(await temporaryRoot());
    const second = new MountedDiskStorage(await temporaryRoot());

    for (const storage of [first, second]) {
      const pending = await storage.put(Readable.from(['same-bytes']));
      await storage.finalize(pending.key, 'objects/shared/card.webp');
      expect(await text(await storage.open('objects/shared/card.webp'))).toBe('same-bytes');
    }
  });

  it.each(['../secret', '/absolute/file', 'objects\\escape', 'objects//file'])('rejects unsafe key %s', async (key) => {
    const storage = new MountedDiskStorage(await temporaryRoot());
    await expect(storage.exists(key)).rejects.toBeInstanceOf(UnsafeMediaKeyError);
  });

  it('rejects symlink traversal when the platform permits creating a link', async () => {
    const root = await temporaryRoot();
    const outside = await temporaryRoot();
    await writeFile(join(outside, 'secret.webp'), 'secret');
    try {
      await symlink(outside, join(root, 'linked'), 'dir');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EPERM') return;
      throw error;
    }

    const storage = new MountedDiskStorage(root);
    await expect(storage.open('linked/secret.webp')).rejects.toBeInstanceOf(UnsafeMediaKeyError);
  });

  it('does not fall back when the configured root is missing', async () => {
    const parent = await temporaryRoot();
    const storage = new MountedDiskStorage(join(parent, 'missing'));
    await expect(storage.put(Readable.from(['data']))).rejects.toBeInstanceOf(MediaStorageUnavailableError);
  });

  it('reports a missing object without disclosing or reading another location', async () => {
    const storage = new MountedDiskStorage(await temporaryRoot());
    expect(await storage.exists('objects/missing.webp')).toBe(false);
    await expect(storage.open('objects/missing.webp')).rejects.toBeInstanceOf(UnsafeMediaKeyError);
  });

  it('removes a partial temporary object when its input stream fails', async () => {
    const root = await temporaryRoot();
    const storage = new MountedDiskStorage(root);
    const failing = new Readable({
      read() {
        this.push('partial');
        this.destroy(new Error('stream failed'));
      },
    });

    await expect(storage.put(failing)).rejects.toThrow('stream failed');
    expect(await readdir(join(root, '.tmp'))).toEqual([]);
  });

  it('rejects a configured root that is itself a symlink', async () => {
    const root = await temporaryRoot();
    const target = join(root, 'target');
    const linked = join(root, 'linked-root');
    await mkdir(target);
    try {
      await symlink(target, linked, 'dir');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EPERM') return;
      throw error;
    }

    await expect(new MountedDiskStorage(linked).exists('asset.webp')).rejects.toBeInstanceOf(MediaStorageUnavailableError);
  });

  it('opens files using streams instead of returning provider paths', async () => {
    const root = await temporaryRoot();
    await mkdir(join(root, 'objects'));
    await writeFile(join(root, 'objects', 'fixture.webp'), 'fixture');
    const storage = new MountedDiskStorage(root);
    const opened = await storage.open('objects/fixture.webp');
    expect(opened).toBeInstanceOf(createReadStream(join(root, 'objects', 'fixture.webp')).constructor);
    expect(await text(opened)).toBe('fixture');
  });

  it('checks storage readiness and enforces free space threshold', async () => {
    const root = await temporaryRoot();
    const storage = new MountedDiskStorage(root);

    // Valid root and reasonable threshold
    expect(await storage.checkReadiness(1024)).toBe(true);

    // Impossible threshold (1 Petabyte)
    expect(await storage.checkReadiness(1024 * 1024 * 1024 * 1024 * 1000)).toBe(false);

    // Missing root
    const missingStorage = new MountedDiskStorage(join(root, 'non-existent-subpath'));
    expect(await missingStorage.checkReadiness()).toBe(false);
  });

  it('prunes temporary part files older than target date and lists/checksums objects', async () => {
    const root = await temporaryRoot();
    const storage = new MountedDiskStorage(root);

    // Create an object
    const pending = await storage.put(Readable.from(['real-checksum-data']));
    await storage.finalize(pending.key, 'objects/catalog/img.webp');

    // Create a temporary part file directly
    await mkdir(join(root, '.tmp'), { recursive: true });
    const oldPart = join(root, '.tmp', 'old.part');
    await writeFile(oldPart, 'stale-data');

    // Prune in dry-run mode
    const futureDate = new Date(Date.now() + 60_000);
    const dryPruned = await storage.cleanTemporaryFiles(futureDate, true);
    expect(dryPruned).toContain('.tmp/old.part');
    expect(await text(createReadStream(oldPart))).toBe('stale-data');

    // Prune in live mode
    const livePruned = await storage.cleanTemporaryFiles(futureDate, false);
    expect(livePruned).toContain('.tmp/old.part');

    // List all keys
    const allKeys = await storage.listAllKeys();
    expect(allKeys).toContain('objects/catalog/img.webp');

    // Get checksum
    const checksum = await storage.getChecksum('objects/catalog/img.webp');
    expect(checksum).toBe(pending.checksumSha256);
  });
});
