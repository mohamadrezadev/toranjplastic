'use client';

import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/HStack';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/feedback';
import { Button, Input, StatusBadge, type StatusBadgeTone } from '@/components/ui';
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
  const [rejections, setRejections] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadsCount = useRef(0);

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  const addFilesToQueue = useCallback(
    (files: FileList | File[]) => {
      const newItems: UploadQueueItem[] = [];
      const rejected: string[] = [];

      Array.from(files).forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          const message = `فایل ${file.name} رد شد: فقط فرمت‌های JPEG، PNG و WebP مجاز هستند.`;
          rejected.push(message);
          return;
        }

        if (file.size > maxSizeBytes) {
          const message = `فایل ${file.name} رد شد: حجم فایل بیش از ۱۰ مگابایت است.`;
          rejected.push(message);
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

      setRejections(rejected);
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

  const statusLabel: Record<UploadQueueItem['status'], string> = {
    ready: 'آماده',
    failed: 'ناموفق',
    uploading: 'در حال بارگذاری و پردازش…',
    pending: 'در صف',
  };
  const statusTone: Record<UploadQueueItem['status'], StatusBadgeTone> = {
    ready: 'success',
    failed: 'error',
    uploading: 'info',
    pending: 'neutral',
  };

  return (
    <VStack gap={3}>
      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          multiple
          hidden
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            if (e.target.files) addFilesToQueue(e.target.files);
            e.target.value = '';
          }}
        />
        <Text as="p" weight="bold" color="inherit">تصویر را به اینجا بکشید یا برای انتخاب کلیک کنید</Text>
        <Text as="p" type="supporting" color="secondary">فرمت‌های مجاز: JPEG, PNG, WebP (حداکثر ۱۰ مگابایت)</Text>
        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} aria-label="بارگذاری تصویر: انتخاب فایل از دستگاه">
          انتخاب تصویر از دستگاه
        </Button>
      </div>

      {rejections.map((message) => <Alert key={message} variant="warning" title={message} />)}

      {queue.length > 0 ? (
        <VStack gap={3} role="list" aria-label="فهرست فایل‌های صف بارگذاری">
          {queue.map((item) => (
            <Card key={item.id} variant="muted" role="listitem">
              <VStack gap={2}>
                <HStack gap={2} hAlign="between" vAlign="center" wrap="wrap">
                  <Text as="span" weight="bold" color="inherit" className={styles.queueFileName}>{item.file.name}</Text>
                  <StatusBadge label={statusLabel[item.status]} tone={statusTone[item.status]} />
                </HStack>

                {item.status !== 'ready' ? (
                  <Input
                    label="متن جایگزین (Alt)"
                    name={`alt-${item.id}`}
                    value={item.defaultAlt}
                    onChange={(e) => handleAltChange(item.id, e.target.value)}
                    disabled={item.status === 'uploading'}
                    maxLength={300}
                  />
                ) : null}

                {item.status === 'uploading' ? (
                  <ProgressBar label={`بارگذاری ${item.file.name}`} isLabelHidden isIndeterminate />
                ) : null}

                {item.error ? <Text as="p" type="supporting" color="inherit" className={styles.queueError} role="alert">{item.error}</Text> : null}

                {item.status === 'failed' ? (
                  <div>
                    <Button type="button" variant="secondary" onClick={() => handleRetry(item.id)}>تلاش مجدد</Button>
                  </div>
                ) : null}
              </VStack>
            </Card>
          ))}
        </VStack>
      ) : null}

      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">{announcement}</div>
    </VStack>
  );
}
