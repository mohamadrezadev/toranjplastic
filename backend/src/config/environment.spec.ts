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
    ['MEDIA_STORAGE_PROVIDER', 's3'],
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
});
