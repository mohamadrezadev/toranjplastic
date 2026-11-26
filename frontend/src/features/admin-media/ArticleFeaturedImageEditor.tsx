'use client';

import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { useEffect, useRef, useState } from 'react';
import { AdminFieldset } from '@/components/admin/AdminContent';
import { Button, Input } from '@/components/ui';
import { MediaPicker, mediaAssetIdFromPublicUrl } from './MediaPicker';
import type { AdminMediaAsset } from './types';
import type { PublicImage } from '@/lib/public-content';
import styles from './MediaComponents.module.css';

export interface ArticleFeaturedImageEditorProps {
  initialImage?: PublicImage | null;
  mediaAssets?: AdminMediaAsset[];
}

/*
 * Featured image of an article (OpenSpec change rebuild-ui-with-astryx, task 8.3).
 * Same data contract as before (hidden `featuredImageMediaAssetId` or
 * `featuredImageUrl`, `featuredImageAlt`, and `featuredImageClear` when an
 * existing image is removed); presentation is an Astryx card with the shared
 * fields and buttons, and the picker is the shared dialog.
 */
export function ArticleFeaturedImageEditor({ initialImage, mediaAssets = [] }: ArticleFeaturedImageEditorProps) {
  const [mediaAssetId, setMediaAssetId] = useState<string | undefined>(() =>
    initialImage ? mediaAssetIdFromPublicUrl(initialImage.url) : undefined,
  );
  const [legacyUrl, setLegacyUrl] = useState<string | undefined>(() =>
    initialImage && !mediaAssetIdFromPublicUrl(initialImage.url) ? initialImage.url : undefined,
  );
  const [alt, setAlt] = useState<string>(() => initialImage?.alt ?? '');
  const [isCleared, setIsCleared] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const focusPick = useRef(false);

  // After the image is removed the clear button is gone: focus moves to the pick button.
  useEffect(() => {
    if (!focusPick.current) return;
    document.getElementById('featured-image-pick')?.focus();
    focusPick.current = false;
  });

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
    focusPick.current = true;
    setIsCleared(true);
    setMediaAssetId(undefined);
    setLegacyUrl(undefined);
    setAlt('');
  };

  return (
    <AdminFieldset legend={<>تصویر شاخص مقاله (اختیاری)</>}>
      {hasImage ? (
        <Card variant="muted">
          <HStack gap={3} vAlign="center" wrap="wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt={alt || 'تصویر شاخص'} className={styles.galleryPreview} />
            <VStack gap={1} className={styles.galleryFields}>
              <Input
                label="متن جایگزین (Alt) تصویر شاخص"
                name="featuredImageAlt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                required
                maxLength={240}
                placeholder="توضیح تصویر شاخص برای سئو و دسترس‌پذیری…"
              />
              <Text as="span" type="supporting" color="secondary">
                {mediaAssetId ? 'رسانه انتخاب‌شده از کتابخانه ترنج' : <>آدرس قدیمی: <span dir="ltr">{legacyUrl}</span></>}
              </Text>
              {mediaAssetId ? (
                <input type="hidden" name="featuredImageMediaAssetId" value={mediaAssetId} />
              ) : (
                <input type="hidden" name="featuredImageUrl" value={legacyUrl ?? ''} />
              )}
            </VStack>
            <HStack gap={2} wrap="wrap" className={styles.galleryControls}>
              <Button type="button" variant="secondary" onClick={() => setIsPickerOpen(true)}>تغییر تصویر</Button>
              <Button type="button" variant="danger" onClick={handleClear}>حذف تصویر شاخص</Button>
            </HStack>
          </HStack>
        </Card>
      ) : (
        <Card variant="muted">
          <VStack gap={3} hAlign="start">
            <Text as="p" color="secondary" role="status">
              {initialImage && isCleared
                ? 'تصویر شاخص حذف شد (پس از ذخیره اعمال می‌شود).'
                : 'هنوز تصویر شاخصی برای این مقاله انتخاب نشده است.'}
            </Text>
            <Button id="featured-image-pick" type="button" variant="secondary" onClick={() => setIsPickerOpen(true)}>+ انتخاب تصویر از کتابخانه</Button>
            {initialImage && isCleared ? <input type="hidden" name="featuredImageClear" value="on" /> : null}
          </VStack>
        </Card>
      )}

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
    </AdminFieldset>
  );
}
