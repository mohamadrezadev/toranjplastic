'use client';

import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { HStack } from '@astryxdesign/core/HStack';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { Button, Input } from '@/components/ui';
import { listMediaAction } from './actions';
import { MediaUploader } from './MediaUploader';
import type { AdminMediaAsset, AdminMediaPage } from './types';
import styles from './MediaComponents.module.css';

export function mediaAssetIdFromPublicUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const pathname = url.startsWith('/') ? url : new URL(url).pathname;
    const match = pathname.match(/\/api\/v1\/media\/public\/([^/]+)\/(?:thumb|card|detail)$/);
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

export interface MediaPickerProps {
  name?: string;
  label?: string;
  assets?: AdminMediaAsset[];
  defaultValue?: string;
  onSelect?: (asset: AdminMediaAsset) => void;
  isOpen?: boolean;
  onClose?: () => void;
  triggerButtonText?: string;
}

type LoadState = 'idle' | 'done' | 'error';

const noopSubscribe = () => () => undefined;

/*
 * Media picker dialog (OpenSpec change rebuild-ui-with-astryx, task 8.3).
 * The overlay is the Astryx Dialog (native modal <dialog>: focus is trapped,
 * Escape and the close button dismiss it, focus returns to the control that
 * opened it). It is mounted only while open and rendered in a portal on document.body because it is used
 * inside the product and article forms: inside the form, Enter in the search
 * field or an alt field would submit the whole content form and the dialog's
 * fields would be posted with it. Library, search, pagination and upload keep
 * their previous behaviour; a failed library read now shows an error with a
 * retry instead of an empty library.
 */
export function MediaPicker({
  name,
  label = 'تصویر',
  assets: initialAssets = [],
  defaultValue,
  onSelect,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  triggerButtonText = 'انتخاب از کتابخانه رسانه',
}: MediaPickerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(defaultValue);
  const [assets, setAssets] = useState<AdminMediaAsset[]>(initialAssets);
  const [pageInfo, setPageInfo] = useState<Omit<AdminMediaPage, 'items'>>({
    page: 1,
    pageSize: 20,
    total: initialAssets.length,
    totalPages: Math.ceil(initialAssets.length / 20) || 1,
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState<LoadState>('idle');
  const [loadFailed, setLoadFailed] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const canPortal = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const isControlled = controlledIsOpen !== undefined;
  const isModalOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const closeModal = useCallback(() => {
    if (controlledOnClose) controlledOnClose();
    else setInternalIsOpen(false);
  }, [controlledOnClose]);

  const applyPage = (data: AdminMediaPage) => {
    setAssets(data.items);
    setPageInfo({ page: data.page, pageSize: data.pageSize, total: data.total, totalPages: data.totalPages });
  };

  const fetchLibrary = useCallback(async (page = 1, searchQuery = '') => {
    setIsLoading(true);
    setLoadFailed(false);
    try {
      const res = await listMediaAction({ page, pageSize: 20, status: 'READY', search: searchQuery.trim() || undefined });
      if (res.ok) {
        setAssets(res.data.items);
        setPageInfo({ page: res.data.page, pageSize: res.data.pageSize, total: res.data.total, totalPages: res.data.totalPages });
      } else {
        setLoadFailed(true);
      }
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // The first time the dialog opens without any asset, read the library once.
  useEffect(() => {
    let active = true;
    if (isModalOpen && assets.length === 0 && initialLoad === 'idle') {
      listMediaAction({ page: 1, pageSize: 20, status: 'READY' })
        .then((res) => {
          if (!active) return;
          if (res.ok) applyPage(res.data);
          setInitialLoad(res.ok ? 'done' : 'error');
        })
        .catch(() => {
          if (active) setInitialLoad('error');
        });
    }
    return () => {
      active = false;
    };
  }, [isModalOpen, assets.length, initialLoad]);

  const handleSelectAsset = (asset: AdminMediaAsset) => {
    setSelectedAssetId(asset.id);
    setAnnouncement(`تصویر ${asset.defaultAlt ?? asset.id} انتخاب شد.`);
    onSelect?.(asset);
    closeModal();
  };

  const handleUploadedAsset = (asset: AdminMediaAsset) => {
    setAssets((prev) => [asset, ...prev]);
    handleSelectAsset(asset);
  };

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const showLoading = isLoading || (isModalOpen && assets.length === 0 && initialLoad === 'idle');
  const showError = !showLoading && (loadFailed || (initialLoad === 'error' && assets.length === 0));
  const retry = () => {
    setInitialLoad('idle');
    void fetchLibrary(pageInfo.page, search);
  };
  const title = `${label} - انتخاب تصویر`;

  const dialog = (
    <Dialog isOpen={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }} purpose="info" width={832} maxHeight="90dvh" padding={0}>
      <VStack gap={0} className={styles.dialogFrame}>
        <DialogHeader title={title} onOpenChange={(open) => { if (!open) closeModal(); }} />
        <div className={styles.tabsBar}>
          <TabList role="tablist" value={activeTab} onChange={(value) => setActiveTab(value as 'library' | 'upload')} size="sm" aria-label="بخش‌های انتخاب تصویر">
            <Tab value="library" label="کتابخانه رسانه" panelId="media-picker-library" />
            <Tab value="upload" label="بارگذاری تصویر جدید" panelId="media-picker-upload" />
          </TabList>
        </div>

        <div className={styles.dialogBody}>
          {activeTab === 'library' ? (
            <VStack gap={4} id="media-picker-library" role="tabpanel" aria-label="کتابخانه رسانه">
              <HStack gap={2} vAlign="end" wrap="wrap" className={styles.searchBar}>
                <Input
                  label="جست‌وجو در رسانه‌ها"
                  name="picker-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void fetchLibrary(1, search);
                    }
                  }}
                  placeholder="متن جایگزین را وارد کنید…"
                />
                <Button type="button" variant="secondary" onClick={() => void fetchLibrary(1, search)}>جست‌وجو</Button>
              </HStack>

              {showLoading ? (
                <LoadingState label="در حال بارگذاری رسانه‌ها…" />
              ) : showError ? (
                <ErrorState title="کتابخانه رسانه در دسترس نیست" message="دریافت رسانه‌ها انجام نشد. دوباره تلاش کنید." onRetry={retry} />
              ) : assets.length === 0 ? (
                <EmptyState title="هیچ رسانه‌ای یافت نشد" description="می‌توانید از زبانه بارگذاری، تصویر جدید اضافه کنید." />
              ) : (
                <ul className={styles.grid} aria-label="فهرست تصاویر">
                  {assets.map((asset) => {
                    const isSelected = asset.id === selectedAssetId;
                    const altText = asset.defaultAlt || 'بدون متن جایگزین';
                    return (
                      <li key={asset.id} className={styles.gridCell}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          className={`${styles.gridItem} ${isSelected ? styles.gridItemSelected : ''}`}
                          onClick={() => handleSelectAsset(asset)}
                        >
                          <span className={styles.thumbWrap}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/api/admin-media/${encodeURIComponent(asset.id)}/preview?variant=thumb`}
                              alt=""
                              className={styles.thumbImg}
                              loading="lazy"
                            />
                          </span>
                          <span className={styles.gridItemInfo}>
                            <Text as="span" weight="bold" color="inherit" className={styles.gridItemAlt}>{altText}</Text>
                            {asset.sourceWidth && asset.sourceHeight ? (
                              <Text as="span" type="supporting" color="secondary" dir="ltr">{`${asset.sourceWidth}×${asset.sourceHeight}`}</Text>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {pageInfo.totalPages > 1 ? (
                <HStack gap={2} hAlign="center" vAlign="center" wrap="wrap">
                  <Button type="button" variant="secondary" disabled={pageInfo.page <= 1 || isLoading} onClick={() => void fetchLibrary(pageInfo.page - 1, search)}>قبلی</Button>
                  <Text as="span" type="supporting" color="secondary">صفحه {pageInfo.page.toLocaleString('fa-IR')} از {pageInfo.totalPages.toLocaleString('fa-IR')}</Text>
                  <Button type="button" variant="secondary" disabled={pageInfo.page >= pageInfo.totalPages || isLoading} onClick={() => void fetchLibrary(pageInfo.page + 1, search)}>بعدی</Button>
                </HStack>
              ) : null}
            </VStack>
          ) : (
            <div id="media-picker-upload" role="tabpanel" aria-label="بارگذاری تصویر جدید">
              <MediaUploader onUploadComplete={handleUploadedAsset} />
            </div>
          )}
        </div>

        <HStack gap={2} hAlign="end" className={styles.dialogFooter}>
          <Button type="button" variant="secondary" onClick={closeModal}>انصراف</Button>
        </HStack>
      </VStack>
    </Dialog>
  );

  return (
    <div>
      {name ? <input type="hidden" name={name} value={selectedAssetId ?? ''} /> : null}

      {!isControlled ? (
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Button type="button" variant="secondary" onClick={() => setInternalIsOpen(true)} aria-haspopup="dialog">
            {triggerButtonText}
          </Button>
          {selectedAsset ? (
            <Text as="span" type="supporting" color="secondary">انتخاب‌شده: {selectedAsset.defaultAlt ?? selectedAsset.id}</Text>
          ) : null}
        </HStack>
      ) : null}

      {canPortal && isModalOpen ? createPortal(dialog, document.body) : null}

      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</div>
    </div>
  );
}
