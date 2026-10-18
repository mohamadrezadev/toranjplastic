// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { isAdminMediaAsset, isAdminMediaPage } from './schema';
import { mediaAssetIdFromPublicUrl } from './MediaPicker';

const asset = {
  id: 'media-1', status: 'READY', defaultAlt: 'تصویر', sourceMimeType: 'image/webp',
  sourceWidth: 800, sourceHeight: 600,
  variants: [{ name: 'card', width: 800, height: 600, bytes: 1200 }],
  referenceCount: 2, createdAt: '2026-10-18T00:00:00.000Z', updatedAt: '2026-10-18T00:00:00.000Z',
};

describe('admin media frontend contracts', () => {
  it('accepts explicit asset/page contracts and rejects leaked or malformed shapes', () => {
    expect(isAdminMediaAsset(asset)).toBe(true);
    expect(isAdminMediaPage({ items: [asset], page: 1, pageSize: 20, total: 1, totalPages: 1 })).toBe(true);
    expect(isAdminMediaAsset({ ...asset, variants: [{ name: 'original', width: 1, height: 1, bytes: 1 }] })).toBe(false);
  });

  it('recovers only a stable managed id from application-owned variant URLs', () => {
    expect(mediaAssetIdFromPublicUrl('https://media.example/api/v1/media/public/media-1/detail')).toBe('media-1');
    expect(mediaAssetIdFromPublicUrl('/api/v1/media/public/media-2/card')).toBe('media-2');
    expect(mediaAssetIdFromPublicUrl('https://legacy.example/image.jpg')).toBeUndefined();
  });
});
