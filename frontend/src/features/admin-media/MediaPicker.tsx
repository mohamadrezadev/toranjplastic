'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [announcement, setAnnouncement] = useState('');

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const triggerContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    // Restore focus to trigger
    setTimeout(() => {
      triggerContainerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }, 50);
  }, [controlledOnClose]);

  const openModal = () => {
    setInternalIsOpen(true);
  };

  // Fetch media from server action
  const fetchLibrary = useCallback(async (page = 1, searchQuery = '') => {
    setIsLoading(true);
    try {
      const res = await listMediaAction({
        page,
        pageSize: 20,
        status: 'READY',
        search: searchQuery.trim() || undefined,
      });
      if (res.ok) {
        setAssets(res.data.items);
        setPageInfo({
          page: res.data.page,
          pageSize: res.data.pageSize,
          total: res.data.total,
          totalPages: res.data.totalPages,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when modal opens if assets are empty
  useEffect(() => {
    let active = true;
    if (isModalOpen && assets.length === 0) {
      listMediaAction({
        page: 1,
        pageSize: 20,
        status: 'READY',
        search: search.trim() || undefined,
      }).then((res) => {
        if (!active) return;
        if (res.ok) {
          setAssets(res.data.items);
          setPageInfo({
            page: res.data.page,
            pageSize: res.data.pageSize,
            total: res.data.total,
            totalPages: res.data.totalPages,
          });
        }
      });
    }
    return () => {
      active = false;
    };
  }, [isModalOpen, assets.length, search]);

  // Focus trap inside modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

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

  return (
    <div>
      {name ? (
        <input type="hidden" name={name} value={selectedAssetId ?? ''} />
      ) : null}

      {controlledIsOpen === undefined && (
        <div ref={triggerContainerRef} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={openModal}
            aria-haspopup="dialog"
          >
            {triggerButtonText}
          </Button>
          {selectedAsset && (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              انتخاب‌شده: {selectedAsset.defaultAlt ?? selectedAsset.id}
            </span>
          )}
        </div>
      )}

      {isModalOpen && (
        <div
          className={styles.dialogBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-picker-title"
          >
            <div className={styles.dialogHeader}>
              <h2 id="media-picker-title">{label} - انتخاب تصویر</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="بستن پنجره"
              >
                ✕
              </button>
            </div>

            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'library'}
                className={`${styles.tab} ${activeTab === 'library' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('library')}
              >
                کتابخانه رسانه
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'upload'}
                className={`${styles.tab} ${activeTab === 'upload' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                بارگذاری تصویر جدید
              </button>
            </div>

            <div className={styles.dialogBody}>
              {activeTab === 'library' ? (
                <>
                  <div className={styles.searchBar}>
                    <Input
                      label="جست‌وجو در رسانه‌ها"
                      name="picker-search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="متن جایگزین را وارد کنید…"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fetchLibrary(1, search)}
                    >
                      جست‌وجو
                    </Button>
                  </div>

                  {isLoading ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>در حال بارگذاری رسانه‌ها…</p>
                  ) : assets.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                      هیچ رسانه‌ای یافت نشد. می‌توانید از زبانه بارگذاری، تصویر جدید اضافه کنید.
                    </p>
                  ) : (
                    <div className={styles.grid} role="listbox" aria-label="فهرست تصاویر">
                      {assets.map((asset) => {
                        const isSelected = asset.id === selectedAssetId;
                        return (
                          <button
                            key={asset.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`${styles.gridItem} ${isSelected ? styles.gridItemSelected : ''}`}
                            onClick={() => handleSelectAsset(asset)}
                          >
                            <div className={styles.thumbWrap}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/api/admin-media/${encodeURIComponent(asset.id)}/preview?variant=thumb`}
                                alt={asset.defaultAlt ?? ''}
                                className={styles.thumbImg}
                                loading="lazy"
                              />
                            </div>
                            <div className={styles.gridItemInfo}>
                              <span className={styles.gridItemAlt} title={asset.defaultAlt ?? asset.id}>
                                {asset.defaultAlt || 'بدون متن جایگزین'}
                              </span>
                              <span className={styles.gridItemMeta} dir="ltr">
                                {asset.sourceWidth && asset.sourceHeight
                                  ? `${asset.sourceWidth}×${asset.sourceHeight}`
                                  : ''}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {pageInfo.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={pageInfo.page <= 1 || isLoading}
                        onClick={() => fetchLibrary(pageInfo.page - 1, search)}
                      >
                        قبلی
                      </Button>
                      <span style={{ alignSelf: 'center', fontSize: '0.88rem' }}>
                        صفحه {pageInfo.page} از {pageInfo.totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={pageInfo.page >= pageInfo.totalPages || isLoading}
                        onClick={() => fetchLibrary(pageInfo.page + 1, search)}
                      >
                        بعدی
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <MediaUploader onUploadComplete={handleUploadedAsset} />
              )}
            </div>

            <div className={styles.dialogFooter}>
              <Button type="button" variant="secondary" onClick={closeModal}>
                انصراف
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  );
}
