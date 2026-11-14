'use client';

import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { useEffect, useRef, useState } from 'react';
import { AdminFieldset, AdminFormRow } from '@/components/admin/AdminContent';
import { Button, Input, StatusBadge } from '@/components/ui';
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

const controlId = (itemId: string, action: 'up' | 'down' | 'remove') => `gallery-${itemId}-${action}`;
const ADD_BUTTON_ID = 'gallery-add-from-library';

/*
 * Product gallery editor (OpenSpec change rebuild-ui-with-astryx, task 8.3).
 * Same data contract as before (hidden `imageNMediaAssetId` / `imageNUrl` and
 * `imageNAlt` fields, slot 1 is the cover, at most six images). The list is an
 * ordered list of Astryx cards; reordering by drag still works, and the
 * move/remove buttons are the keyboard path: after each action focus moves to
 * a control that still exists and the change is announced in a live region.
 */
export function ProductGalleryEditor({ initialImages = [], mediaAssets = [] }: ProductGalleryEditorProps) {
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
  const [announcement, setAnnouncement] = useState('');
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  const handleAddMedia = (asset: AdminMediaAsset) => {
    if (items.length >= MAX_IMAGES) return;
    setItems((prev) => [...prev, { id: `asset-${asset.id}-${Date.now()}`, mediaAssetId: asset.id, alt: asset.defaultAlt ?? '' }]);
    setAnnouncement(`تصویر به جایگاه ${(items.length + 1).toLocaleString('fa-IR')} گالری افزوده شد.`);
  };

  const handleAddLegacy = () => {
    if (items.length >= MAX_IMAGES) return;
    const url = legacyUrl.trim();
    if (!url) return;
    setItems((prev) => [...prev, { id: `legacy-${Date.now()}`, url, alt: legacyAlt.trim() }]);
    setAnnouncement(`تصویر به جایگاه ${(items.length + 1).toLocaleString('fa-IR')} گالری افزوده شد.`);
    setLegacyUrl('');
    setLegacyAlt('');
    setShowLegacyForm(false);
  };

  const handleRemove = (index: number) => {
    const neighbour = items[index + 1] ?? items[index - 1];
    pendingFocus.current = neighbour ? controlId(neighbour.id, 'remove') : ADD_BUTTON_ID;
    setItems((prev) => prev.filter((_, i) => i !== index));
    setAnnouncement(`تصویر ${(index + 1).toLocaleString('fa-IR')} از گالری حذف شد.`);
  };

  const handleAltChange = (index: number, alt: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, alt } : item)));
  };

  const move = (index: number, target: number) => {
    if (target < 0 || target >= items.length) return;
    const movedId = items[index].id;
    // Keep focus on a move button that is still enabled at the new position.
    const stillEnabled = target === 0 ? 'down' : target === items.length - 1 ? 'up' : target < index ? 'up' : 'down';
    pendingFocus.current = controlId(movedId, stillEnabled);
    setItems((prev) => {
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    setAnnouncement(`تصویر ${(index + 1).toLocaleString('fa-IR')} به جایگاه ${(target + 1).toLocaleString('fa-IR')} منتقل شد${target === 0 ? ' و اکنون کاور است' : ''}.`);
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

  const atLimit = items.length >= MAX_IMAGES;

  return (
    <VStack gap={0} className={styles.galleryEditor}>
      <AdminFieldset legend={<>گالری تصاویر محصول (حداکثر {MAX_IMAGES} تصویر — موقعیت اول به عنوان کاور استفاده می‌شود)</>}>
        {items.length === 0 ? (
          <Text as="p" color="secondary" className={styles.emptyNote}>
            هنوز تصویری به گالری اضافه نشده است. برای شروع، تصویری از کتابخانه رسانه انتخاب کنید.
          </Text>
        ) : (
          <ol className={styles.galleryList} aria-label="تصاویر گالری به ترتیب نمایش">
            {items.map((item, index) => {
              const isCover = index === 0;
              const previewSrc = item.mediaAssetId
                ? `/api/admin-media/${encodeURIComponent(item.mediaAssetId)}/preview?variant=thumb`
                : item.url;

              return (
                <li
                  key={item.id}
                  className={styles.galleryItem}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  <Card variant={isCover ? 'default' : 'muted'} className={isCover ? styles.coverCard : undefined}>
                    <HStack gap={3} vAlign="center" wrap="wrap">
                      <StatusBadge label={isCover ? 'کاور / تصویر اصلی' : `تصویر ${index + 1}`} tone={isCover ? 'info' : 'neutral'} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewSrc} alt={item.alt || `پیش‌نمایش تصویر ${index + 1}`} className={styles.galleryPreview} />

                      <VStack gap={1} className={styles.galleryFields}>
                        <Input
                          label={`متن جایگزین (Alt) تصویر ${index + 1}`}
                          name={`image${index + 1}Alt`}
                          value={item.alt}
                          onChange={(e) => handleAltChange(index, e.target.value)}
                          required
                          maxLength={240}
                          placeholder="متن توصیفی برای موتورهای جست‌وجو و صفحه‌خوان…"
                        />
                        <Text as="span" type="supporting" color="secondary">
                          {item.mediaAssetId ? 'رسانه مدیریت‌شده ترنج' : <>آدرس قدیمی: <span dir="ltr">{item.url}</span></>}
                        </Text>
                        {item.mediaAssetId ? (
                          <input type="hidden" name={`image${index + 1}MediaAssetId`} value={item.mediaAssetId} />
                        ) : (
                          <input type="hidden" name={`image${index + 1}Url`} value={item.url ?? ''} />
                        )}
                      </VStack>

                      <HStack gap={2} wrap="wrap" className={styles.galleryControls}>
                        <Button id={controlId(item.id, 'up')} type="button" variant="secondary" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`انتقال تصویر ${index + 1} به بالا`} title="انتقال به بالا (موقعیت قبل)">
                          ▲ بالا
                        </Button>
                        <Button id={controlId(item.id, 'down')} type="button" variant="secondary" disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={`انتقال تصویر ${index + 1} به پایین`} title="انتقال به پایین (موقعیت بعد)">
                          ▼ پایین
                        </Button>
                        <Button id={controlId(item.id, 'remove')} type="button" variant="danger" onClick={() => handleRemove(index)} aria-label={`حذف تصویر ${index + 1} از گالری`} title="حذف از گالری">
                          ✕ حذف
                        </Button>
                      </HStack>
                    </HStack>
                  </Card>
                </li>
              );
            })}
          </ol>
        )}

        <HStack gap={3} vAlign="center" wrap="wrap">
          <Button id={ADD_BUTTON_ID} type="button" variant="secondary" disabled={atLimit} onClick={() => setIsPickerOpen(true)}>
            + افزودن تصویر از کتابخانه
          </Button>
          <Button type="button" variant="secondary" disabled={atLimit} onClick={() => setShowLegacyForm(!showLegacyForm)} aria-expanded={showLegacyForm}>
            {showLegacyForm ? 'بستن فرم آدرس قدیمی' : '+ افزودن آدرس اینترنتی (قدیمی)'}
          </Button>
          <Text as="span" type="supporting" color="secondary">تعداد تصاویر: {items.length} از {MAX_IMAGES}</Text>
        </HStack>
        {atLimit ? <Text as="p" type="supporting" color="secondary">به سقف {MAX_IMAGES} تصویر رسیده‌اید؛ برای افزودن تصویر تازه، یکی را حذف کنید.</Text> : null}

        {showLegacyForm ? (
          <Card variant="muted">
            <VStack gap={3}>
              <AdminFormRow>
                <Input
                  label="آدرس کامل اینترنتی تصویر (URL)"
                  name="legacy-url"
                  value={legacyUrl}
                  onChange={(e) => setLegacyUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLegacy(); } }}
                  dir="ltr"
                  placeholder="https://..."
                />
                <Input
                  label="متن جایگزین (Alt)"
                  name="legacy-alt"
                  value={legacyAlt}
                  onChange={(e) => setLegacyAlt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLegacy(); } }}
                  placeholder="توضیح تصویر…"
                />
              </AdminFormRow>
              <HStack gap={2} wrap="wrap">
                <Button type="button" onClick={handleAddLegacy} disabled={!legacyUrl.trim()}>افزودن به گالری</Button>
                <Button type="button" variant="secondary" onClick={() => setShowLegacyForm(false)}>انصراف</Button>
              </HStack>
            </VStack>
          </Card>
        ) : null}
      </AdminFieldset>

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

      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</div>
    </VStack>
  );
}
