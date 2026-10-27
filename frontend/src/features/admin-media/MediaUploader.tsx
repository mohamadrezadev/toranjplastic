'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { uploadMediaItemAction } from './actions';
import type { AdminMediaAsset } from './types';
import styles from './MediaComponents.module.css';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CONCURRENCY_LIMIT = 2;

export interface UploadQueueItem {
  id: string;
  file: File;
  defaultAlt: string;
  status: 'pending' | 'uploading' | 'ready' | 'failed';
  progress: number;
  error?: string;
  asset?: AdminMediaAsset;
}

export interface MediaUploaderProps {
  onUploadComplete?: (asset: AdminMediaAsset) => void;
  allowedTypes?: string[];
  maxSizeBytes?: number;
}

export function MediaUploader({
  onUploadComplete,
  allowedTypes = ALLOWED_MIME_TYPES,
  maxSizeBytes = MAX_UPLOAD_BYTES,
}: MediaUploaderProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [announcement, setAnnouncement] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadsCount = useRef(0);

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  const addFilesToQueue = useCallback(
    (files: FileList | File[]) => {
      const newItems: UploadQueueItem[] = [];

      Array.from(files).forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          announce(`فایل ${file.name} رد شد: فقط فرمت‌های JPEG، PNG و WebP مجاز هستند.`);
          return;
        }

        if (file.size > maxSizeBytes) {
          announce(`فایل ${file.name} رد شد: حجم فایل بیش از ۱۰ مگابایت است.`);
          return;
        }

        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          defaultAlt: nameWithoutExt,
          status: 'pending',
          progress: 0,
        });
      });

      if (newItems.length > 0) {
        setQueue((prev) => [...prev, ...newItems]);
        announce(`${newItems.length} فایل به صف بارگذاری افزوده شد.`);
      }
    },
    [allowedTypes, maxSizeBytes, announce],
  );

  const processQueue = useCallback(async () => {
    if (activeUploadsCount.current >= CONCURRENCY_LIMIT) return;

    setQueue((currentQueue) => {
      const nextPendingIndex = currentQueue.findIndex((item) => item.status === 'pending');
      if (nextPendingIndex === -1) return currentQueue;

      const nextItem = currentQueue[nextPendingIndex];
      activeUploadsCount.current += 1;

      // Start upload asynchronously
      (async () => {
        announce(`در حال بارگذاری ${nextItem.file.name}…`);

        const form = new FormData();
        form.set('file', nextItem.file);
        form.set('defaultAlt', nextItem.defaultAlt.trim() || nextItem.file.name);

        // Update progress simulation
        setQueue((q) =>
          q.map((it) => (it.id === nextItem.id ? { ...it, status: 'uploading', progress: 50 } : it)),
        );

        try {
          const res = await uploadMediaItemAction(form);
          if (res.ok) {
            setQueue((q) =>
              q.map((it) =>
                it.id === nextItem.id
                  ? { ...it, status: 'ready', progress: 100, asset: res.asset }
                  : it,
              ),
            );
            announce(`فایل ${nextItem.file.name} با موفقیت بارگذاری و پردازش شد.`);
            onUploadComplete?.(res.asset);
          } else {
            const errorMsg =
              res.code === 'MEDIA_UPLOAD_TOO_LARGE'
                ? 'حجم فایل یا ابعاد تصویر بیش از حد مجاز است.'
                : res.code === 'MEDIA_INVALID_FILE'
                  ? 'فرمت فایل معتبر نیست.'
                  : 'خطا در بارگذاری و پردازش تصویر.';
            setQueue((q) =>
              q.map((it) =>
                it.id === nextItem.id ? { ...it, status: 'failed', progress: 0, error: errorMsg } : it,
              ),
            );
            announce(`بارگذاری فایل ${nextItem.file.name} ناموفق بود: ${errorMsg}`);
          }
        } catch {
          setQueue((q) =>
            q.map((it) =>
              it.id === nextItem.id
                ? { ...it, status: 'failed', progress: 0, error: 'خطای ارتباط با سرور' }
                : it,
            ),
          );
          announce(`بارگذاری فایل ${nextItem.file.name} به دلیل خطای شبکه انجام نشد.`);
        } finally {
          activeUploadsCount.current -= 1;
        }
      })();

      return currentQueue.map((it, idx) =>
        idx === nextPendingIndex ? { ...it, status: 'uploading', progress: 10 } : it,
      );
    });
  }, [announce, onUploadComplete]);

  useEffect(() => {
    const hasPending = queue.some((item) => item.status === 'pending');
    if (hasPending && activeUploadsCount.current < CONCURRENCY_LIMIT) {
      processQueue();
    }
  }, [queue, processQueue]);

  const handleRetry = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'pending', progress: 0, error: undefined } : item)),
    );
    announce('تلاش مجدد برای بارگذاری فایل ثبت شد.');
  };

  const handleAltChange = (id: string, defaultAlt: string) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, defaultAlt } : item)));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  return (
    <div className={styles.uploadQueue}>
      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="بارگذاری تصویر: فایل را بکشید یا برای انتخاب کلیک کنید"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) addFilesToQueue(e.target.files);
            e.target.value = '';
          }}
        />
        <span className={styles.dropzoneText}>تصویر را به اینجا بکشید یا برای انتخاب کلیک کنید</span>
        <span className={styles.dropzoneHint}>فرمت‌های مجاز: JPEG, PNG, WebP (حداکثر ۱۰ مگابایت)</span>
      </div>

      {queue.length > 0 ? (
        <div className={styles.uploadQueue} aria-label="فهرست فایل‌های صف بارگذاری">
          {queue.map((item) => (
            <div key={item.id} className={styles.queueItem}>
              <div className={styles.queueHeader}>
                <span className={styles.queueFileName} title={item.file.name}>
                  {item.file.name}
                </span>
                <span
                  className={`${styles.queueStatus} ${
                    item.status === 'ready'
                      ? styles.queueStatusReady
                      : item.status === 'failed'
                        ? styles.queueStatusFailed
                        : item.status === 'uploading'
                          ? styles.queueStatusUploading
                          : styles.queueStatusPending
                  }`}
                >
                  {item.status === 'ready' && 'آماده'}
                  {item.status === 'failed' && 'ناموفق'}
                  {item.status === 'uploading' && 'در حال بارگذاری و پردازش…'}
                  {item.status === 'pending' && 'در صف'}
                </span>
              </div>

              {item.status !== 'ready' && (
                <Input
                  label="متن جایگزین (Alt)"
                  name={`alt-${item.id}`}
                  value={item.defaultAlt}
                  onChange={(e) => handleAltChange(item.id, e.target.value)}
                  disabled={item.status === 'uploading'}
                  maxLength={300}
                />
              )}

              {item.status === 'uploading' && (
                <div className={styles.progressBar} role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                  <div className={styles.progressBarFill} style={{ width: `${item.progress}%` }} />
                </div>
              )}

              {item.error && <p className={styles.queueStatusFailed}>{item.error}</p>}

              {item.status === 'failed' && (
                <div className={styles.queueActions}>
                  <Button type="button" variant="secondary" onClick={() => handleRetry(item.id)}>
                    تلاش مجدد
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  );
}
