import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { loadEnvironment } from './environment.js';

describe('loadEnvironment', () => {
  it('returns secure local defaults', () => {
    expect(loadEnvironment({})).toEqual({
      port: 3001,
      frontendOrigin: 'http://localhost:3000',
      auth: { sessionDays: 7, loginLimit: 10, loginWindowSeconds: 900, cookieSecure: false },
      media: {
        storageProvider: 'mounted-disk',
        root: resolve(process.cwd(), 'var', 'media'),
        publicOrigin: 'http://localhost:3001',
        maxUploadBytes: 10_485_760,
        maxPixels: 20_000_000,
        minFreeBytes: 1_073_741_824,
        maxProductImages: 6,
        processingConcurrency: 2,
        tempRetentionHours: 24,
        unattachedRetentionDays: 30,
      },
    });
  });

  it('loads valid S3 configuration without requiring MEDIA_ROOT in production', () => {
    const loaded = loadEnvironment({
      NODE_ENV: 'production',
      MEDIA_PUBLIC_ORIGIN: 'https://api.example.com',
      MEDIA_STORAGE_PROVIDER: 's3',
      MEDIA_S3_ENDPOINT: 'http://127.0.0.1:9000',
      MEDIA_S3_REGION: 'us-east-1',
      MEDIA_S3_BUCKET: 'toranj-media',
      MEDIA_S3_ACCESS_KEY_ID: 'minioadmin',
      MEDIA_S3_SECRET_ACCESS_KEY: 'minioadmin',
      MEDIA_S3_KEY_PREFIX: '/backend/',
    });

    expect(loaded.media.storageProvider).toBe('s3');
    expect(loaded.media.s3).toEqual({
      endpoint: 'http://127.0.0.1:9000',
      region: 'us-east-1',
      bucket: 'toranj-media',
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
      forcePathStyle: true,
      keyPrefix: 'backend',
    });
  });

  it.each(['0', '65536', 'abc'])('rejects invalid port %s', (port) => {
    expect(() => loadEnvironment({ BACKEND_PORT: port })).toThrow(
      'BACKEND_PORT',
    );
  });

  it('rejects an origin with a path', () => {
    expect(() =>
      loadEnvironment({ FRONTEND_ORIGIN: 'https://example.com/app' }),
    ).toThrow('FRONTEND_ORIGIN');
  });

  it('requires an explicit absolute media root and HTTPS origin in production', () => {
    expect(() => loadEnvironment({ NODE_ENV: 'production' })).toThrow('MEDIA_ROOT');
    expect(() => loadEnvironment({
      NODE_ENV: 'production',
      MEDIA_ROOT: resolve(process.cwd(), 'media'),
      MEDIA_PUBLIC_ORIGIN: 'http://media.example.com',
    })).toThrow('MEDIA_PUBLIC_ORIGIN');
  });

  it.each([
    ['MEDIA_STORAGE_PROVIDER', 'unknown'],
    ['MEDIA_ROOT', 'relative/media'],
    ['MEDIA_MAX_UPLOAD_BYTES', '0'],
    ['MEDIA_MAX_PIXELS', '40000001'],
    ['MEDIA_MAX_PRODUCT_IMAGES', '7'],
    ['MEDIA_PROCESSING_CONCURRENCY', '0'],
    ['MEDIA_TEMP_RETENTION_HOURS', '169'],
    ['MEDIA_UNATTACHED_RETENTION_DAYS', '0'],
  ])('rejects unsafe media setting %s=%s', (name, value) => {
    expect(() => loadEnvironment({ [name]: value })).toThrow(name);
  });

  it('requires S3 bucket and credentials when MEDIA_STORAGE_PROVIDER=s3', () => {
    expect(() => loadEnvironment({ MEDIA_STORAGE_PROVIDER: 's3' })).toThrow('MEDIA_S3_BUCKET');
    expect(() =>
      loadEnvironment({
        MEDIA_STORAGE_PROVIDER: 's3',
        MEDIA_S3_BUCKET: 'toranj-media',
      }),
    ).toThrow('MEDIA_S3_ACCESS_KEY_ID');
    expect(() =>
      loadEnvironment({
        MEDIA_STORAGE_PROVIDER: 's3',
        MEDIA_S3_BUCKET: 'toranj-media',
        MEDIA_S3_ACCESS_KEY_ID: 'key',
      }),
    ).toThrow('MEDIA_S3_SECRET_ACCESS_KEY');
  });
});
