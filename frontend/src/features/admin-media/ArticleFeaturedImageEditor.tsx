'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { MediaPicker, mediaAssetIdFromPublicUrl } from './MediaPicker';
import type { AdminMediaAsset } from './types';
import type { PublicImage } from '@/lib/public-content';
import styles from './MediaComponents.module.css';

export interface ArticleFeaturedImageEditorProps {
  initialImage?: PublicImage | null;
  mediaAssets?: AdminMediaAsset[];
}

export function ArticleFeaturedImageEditor({
  initialImage,
  mediaAssets = [],
}: ArticleFeaturedImageEditorProps) {
  const [mediaAssetId, setMediaAssetId] = useState<string | undefined>(() =>
    initialImage ? mediaAssetIdFromPublicUrl(initialImage.url) : undefined,
  );
  const [legacyUrl, setLegacyUrl] = useState<string | undefined>(() =>
    initialImage && !mediaAssetIdFromPublicUrl(initialImage.url) ? initialImage.url : undefined,
  );
  const [alt, setAlt] = useState<string>(() => initialImage?.alt ?? '');
  const [isCleared, setIsCleared] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const hasImage = !isCleared && (Boolean(mediaAssetId) || Boolean(legacyUrl));
  const previewSrc = mediaAssetId
    ? `/api/admin-media/${encodeURIComponent(mediaAssetId)}/preview?variant=thumb`
    : legacyUrl;

  const handleSelectAsset = (asset: AdminMediaAsset) => {
    setMediaAssetId(asset.id);
    setLegacyUrl(undefined);
    setAlt(asset.defaultAlt ?? '');
    setIsCleared(false);
  };

  const handleClear = () => {
    setIsCleared(true);
    setMediaAssetId(undefined);
    setLegacyUrl(undefined);
    setAlt('');
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend>تصویر شاخص مقاله (اختیاری)</legend>

      {hasImage ? (
        <div className={styles.galleryCard}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={alt || 'تصویر شاخص'}
            className={styles.galleryPreview}
          />
          <div className={styles.galleryFields}>
            <Input
              label="متن جایگزین (Alt) تصویر شاخص"
              name="featuredImageAlt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              required
              maxLength={240}
              placeholder="توضیح تصویر شاخص برای سئو و دسترس‌پذیری…"
            />
            <small style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
              {mediaAssetId ? 'رسانه انتخاب‌شده از کتابخانه ترنج' : `آدرس قدیمی: ${legacyUrl}`}
            </small>

            {/* Hidden form inputs */}
            {mediaAssetId ? (
              <input type="hidden" name="featuredImageMediaAssetId" value={mediaAssetId} />
            ) : (
              <input type="hidden" name="featuredImageUrl" value={legacyUrl ?? ''} />
            )}
          </div>

          <div className={styles.galleryControls}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPickerOpen(true)}
            >
              تغییر تصویر
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleClear}
            >
              حذف تصویر شاخص
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            {initialImage && isCleared
              ? 'تصویر شاخص حذف شد (پس از ذخیره اعمال می‌شود).'
              : 'هنوز تصویر شاخصی برای این مقاله انتخاب نشده است.'}
          </p>

          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPickerOpen(true)}
            >
              + انتخاب تصویر از کتابخانه
            </Button>
          </div>

          {/* If the image was originally present and staff explicitly cleared it, output featuredImageClear */}
          {initialImage && isCleared && (
            <input type="hidden" name="featuredImageClear" value="on" />
          )}
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        label="تصویر شاخص مقاله"
        assets={mediaAssets}
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(asset) => {
          handleSelectAsset(asset);
          setIsPickerOpen(false);
        }}
      />
    </fieldset>
  );
}
