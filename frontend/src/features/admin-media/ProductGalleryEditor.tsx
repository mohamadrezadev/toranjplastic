'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { MediaPicker, mediaAssetIdFromPublicUrl } from './MediaPicker';
import type { AdminMediaAsset } from './types';
import type { PublicImage } from '@/lib/public-content';
import styles from './MediaComponents.module.css';

const MAX_IMAGES = 6;

export interface GalleryItem {
  id: string;
  mediaAssetId?: string;
  url?: string;
  alt: string;
}

export interface ProductGalleryEditorProps {
  initialImages?: PublicImage[];
  mediaAssets?: AdminMediaAsset[];
}

export function ProductGalleryEditor({
  initialImages = [],
  mediaAssets = [],
}: ProductGalleryEditorProps) {
  const [items, setItems] = useState<GalleryItem[]>(() =>
    initialImages.slice(0, MAX_IMAGES).map((img, idx) => {
      const assetId = mediaAssetIdFromPublicUrl(img.url);
      return {
        id: `initial-${idx}-${Date.now()}`,
        mediaAssetId: assetId,
        url: assetId ? undefined : img.url,
        alt: img.alt ?? '',
      };
    }),
  );

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showLegacyForm, setShowLegacyForm] = useState(false);
  const [legacyUrl, setLegacyUrl] = useState('');
  const [legacyAlt, setLegacyAlt] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddMedia = (asset: AdminMediaAsset) => {
    if (items.length >= MAX_IMAGES) return;
    setItems((prev) => [
      ...prev,
      {
        id: `asset-${asset.id}-${Date.now()}`,
        mediaAssetId: asset.id,
        alt: asset.defaultAlt ?? '',
      },
    ]);
  };

  const handleAddLegacy = () => {
    if (items.length >= MAX_IMAGES) return;
    const url = legacyUrl.trim();
    if (!url) return;
    setItems((prev) => [
      ...prev,
      {
        id: `legacy-${Date.now()}`,
        url,
        alt: legacyAlt.trim(),
      },
    ]);
    setLegacyUrl('');
    setLegacyAlt('');
    setShowLegacyForm(false);
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAltChange = (index: number, alt: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, alt } : item)));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setItems((prev) => {
      const copy = [...prev];
      const [draggedItem] = copy.splice(draggedIndex, 1);
      copy.splice(index, 0, draggedItem);
      return copy;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={styles.galleryEditor}>
      <fieldset className={styles.fieldset}>
        <legend>
          گالری تصاویر محصول (حداکثر {MAX_IMAGES} تصویر — موقعیت اول به عنوان کاور استفاده می‌شود)
        </legend>

        {items.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)' }}>
            هنوز تصویری به گالری اضافه نشده است. برای شروع، تصویری از کتابخانه رسانه انتخاب کنید.
          </p>
        ) : (
          <div className={styles.galleryList}>
            {items.map((item, index) => {
              const isCover = index === 0;
              const previewSrc = item.mediaAssetId
                ? `/api/admin-media/${encodeURIComponent(item.mediaAssetId)}/preview?variant=thumb`
                : item.url;

              return (
                <div
                  key={item.id}
                  className={`${styles.galleryCard} ${isCover ? styles.galleryCardCover : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Slot Indicator */}
                  <span className={`${styles.slotBadge} ${isCover ? styles.coverBadge : ''}`}>
                    {isCover ? 'کاور / تصویر اصلی' : `تصویر ${index + 1}`}
                  </span>

                  {/* Preview */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc}
                    alt={item.alt || `پیش‌نمایش تصویر ${index + 1}`}
                    className={styles.galleryPreview}
                  />

                  {/* Fields */}
                  <div className={styles.galleryFields}>
                    <Input
                      label={`متن جایگزین (Alt) تصویر ${index + 1}`}
                      name={`image${index + 1}Alt`}
                      value={item.alt}
                      onChange={(e) => handleAltChange(index, e.target.value)}
                      required
                      maxLength={240}
                      placeholder="متن توصیفی برای موتورهای جست‌وجو و صفحه‌خوان…"
                    />
                    <small style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                      {item.mediaAssetId ? 'رسانه مدیریت‌شده ترنج' : `آدرس قدیمی: ${item.url}`}
                    </small>

                    {/* Hidden Form Inputs for Backend Submission */}
                    {item.mediaAssetId ? (
                      <input type="hidden" name={`image${index + 1}MediaAssetId`} value={item.mediaAssetId} />
                    ) : (
                      <input type="hidden" name={`image${index + 1}Url`} value={item.url ?? ''} />
                    )}
                  </div>

                  {/* Actions / Reordering */}
                  <div className={styles.galleryControls}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      title="انتقال به بالا (موقعیت قبل)"
                      aria-label={`انتقال تصویر ${index + 1} به بالا`}
                    >
                      ▲ بالا
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      disabled={index === items.length - 1}
                      onClick={() => handleMoveDown(index)}
                      title="انتقال به پایین (موقعیت بعد)"
                      aria-label={`انتقال تصویر ${index + 1} به پایین`}
                    >
                      ▼ پایین
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.removeButton}`}
                      onClick={() => handleRemove(index)}
                      title="حذف از گالری"
                      aria-label={`حذف تصویر ${index + 1} از گالری`}
                    >
                      ✕ حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className={styles.galleryToolbar}>
          <Button
            type="button"
            variant="secondary"
            disabled={items.length >= MAX_IMAGES}
            onClick={() => setIsPickerOpen(true)}
          >
            + افزودن تصویر از کتابخانه
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={items.length >= MAX_IMAGES}
            onClick={() => setShowLegacyForm(!showLegacyForm)}
          >
            {showLegacyForm ? 'بستن فرم آدرس قدیمی' : '+ افزودن آدرس اینترنتی (قدیمی)'}
          </Button>

          <span className={styles.limitNotice}>
            تعداد تصاویر: {items.length} از {MAX_IMAGES}
          </span>
        </div>

        {/* Legacy Image Entry */}
        {showLegacyForm && (
          <div
            style={{
              padding: '1rem',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-subtle)',
              display: 'grid',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
              <Input
                label="آدرس کامل اینترنتی تصویر (URL)"
                name="legacy-url"
                value={legacyUrl}
                onChange={(e) => setLegacyUrl(e.target.value)}
                dir="ltr"
                placeholder="https://..."
              />
              <Input
                label="متن جایگزین (Alt)"
                name="legacy-alt"
                value={legacyAlt}
                onChange={(e) => setLegacyAlt(e.target.value)}
                placeholder="توضیح تصویر…"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button type="button" onClick={handleAddLegacy} disabled={!legacyUrl.trim()}>
                افزودن به گالری
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowLegacyForm(false)}>
                انصراف
              </Button>
            </div>
          </div>
        )}
      </fieldset>

      {/* Media Picker Modal */}
      <MediaPicker
        label="تصویر محصول"
        assets={mediaAssets}
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(asset) => {
          handleAddMedia(asset);
          setIsPickerOpen(false);
        }}
      />
    </div>
  );
}
