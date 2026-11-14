import type { Metadata } from 'next';
import { TableCell, TableRow } from '@astryxdesign/core/Table';
import { AdminFieldset, AdminListPage } from '@/components/admin/AdminContent';
import { AdminSubmitButton } from '@/components/admin/AdminSubmitButton';
import { Alert } from '@/components/feedback';
import { Input, Select, StatusBadge, type StatusBadgeTone } from '@/components/ui';
import { deleteMediaAction, listMedia, uploadMediaAction, type MediaAssetStatus } from '@/features/admin-media';

export const metadata: Metadata = { title: 'کتابخانه رسانه', robots: { index: false, follow: false } };
export const instant = false;

const allowedStatuses: MediaAssetStatus[] = ['PROCESSING', 'READY', 'FAILED', 'DELETION_PENDING'];
const statusLabels: Record<MediaAssetStatus, string> = {
  PROCESSING: 'در حال پردازش', READY: 'آماده', FAILED: 'ناموفق',
  DELETION_PENDING: 'در حال حذف', DELETED: 'حذف‌شده',
};
const statusTones: Record<MediaAssetStatus, StatusBadgeTone> = {
  PROCESSING: 'info', READY: 'success', FAILED: 'error', DELETION_PENDING: 'warning', DELETED: 'neutral',
};
const errors: Record<string, string> = {
  MEDIA_IN_USE: 'این رسانه در محتوا استفاده شده و قابل حذف نیست.',
  MEDIA_INVALID_FILE: 'فایل انتخاب‌شده تصویر معتبر نیست.',
  MEDIA_UPLOAD_TOO_LARGE: 'اندازه فایل یا ابعاد تصویر بیش از حد مجاز است.',
  MEDIA_STORAGE_UNAVAILABLE: 'فضای ذخیره‌سازی موقتاً در دسترس نیست.',
  validation: 'اطلاعات رسانه معتبر نیست.', forbidden: 'دسترسی مجاز نیست.',
  conflict: 'رسانه قابل حذف نیست.', failed: 'عملیات رسانه انجام نشد.',
};

/*
 * Media library (OpenSpec change rebuild-ui-with-astryx, task 8.3): the shared
 * admin list pattern with an upload form, the status badges of the lifecycle,
 * the deletion-blocked and failure notices, and per-row delete forms. Data
 * loading, server actions and the redirect-based result codes are unchanged.
 */
export default async function AdminMediaPage({ searchParams }: {
  searchParams: Promise<{ page?: string; status?: string; search?: string; error?: string; uploaded?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? '1') || 1);
  const status = allowedStatuses.includes(params.status as MediaAssetStatus) ? params.status as MediaAssetStatus : undefined;
  const search = params.search?.trim() || undefined;
  const result = await listMedia({ page, status, search });
  const query = `${status ? `&status=${status}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

  return (
    <AdminListPage
      title="کتابخانه رسانه"
      total={result.total}
      countLabel="فایل"
      emptyTitle="رسانه‌ای با این فیلتر یافت نشد."
      notice={<>
        {params.error ? <Alert variant={params.error === 'MEDIA_IN_USE' ? 'warning' : 'danger'} title={errors[params.error] ?? errors.failed} /> : null}
        {params.uploaded ? <Alert variant="success" title="رسانه با موفقیت بارگذاری و پردازش شد." /> : null}
        {params.deleted ? <Alert variant="success" title="رسانه حذف شد." /> : null}
      </>}
      intro={
        <form action={uploadMediaAction} aria-label="بارگذاری تصویر">
          <AdminFieldset legend={<>بارگذاری تصویر</>}>
            <Input label="فایل JPEG، PNG یا WebP" name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
            <Input label="متن جایگزین پیش‌فرض" name="defaultAlt" required maxLength={300} />
            <div><AdminSubmitButton pendingText="در حال بارگذاری و پردازش…">بارگذاری</AdminSubmitButton></div>
          </AdminFieldset>
        </form>
      }
      filters={<>
        <Input label="جست‌وجوی متن جایگزین" name="search" defaultValue={search ?? ''} maxLength={100} />
        <Select label="وضعیت" name="status" defaultValue={status ?? ''}>
          <option value="">همه</option>
          {allowedStatuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
        </Select>
      </>}
      headers={['متن جایگزین', 'وضعیت', 'ابعاد', 'استفاده', 'عملیات']}
      rows={result.items.map((asset) => (
        <TableRow key={asset.id}>
          <TableCell>{asset.defaultAlt ?? '—'}</TableCell>
          <TableCell><StatusBadge label={statusLabels[asset.status]} tone={statusTones[asset.status]} /></TableCell>
          <TableCell><span dir="ltr">{asset.sourceWidth && asset.sourceHeight ? `${asset.sourceWidth} × ${asset.sourceHeight}` : '—'}</span></TableCell>
          <TableCell>{asset.referenceCount.toLocaleString('fa-IR')} مورد</TableCell>
          <TableCell>
            {asset.referenceCount > 0 ? (
              <StatusBadge label="در حال استفاده؛ قابل حذف نیست" tone="info" />
            ) : (
              <form action={deleteMediaAction.bind(null, asset.id)}>
                <AdminSubmitButton variant="danger" pendingText="در حال حذف…">حذف</AdminSubmitButton>
              </form>
            )}
          </TableCell>
        </TableRow>
      ))}
      pagination={{ basePath: '/admin/media', page, totalPages: result.totalPages, query }}
    />
  );
}
