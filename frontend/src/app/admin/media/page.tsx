import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Input, Select } from '@/components/ui';
import { deleteMediaAction, listMedia, uploadMediaAction, type MediaAssetStatus } from '@/features/admin-media';
import styles from '../Admin.module.css';

export const metadata: Metadata = { title: 'کتابخانه رسانه', robots: { index: false, follow: false } };
export const instant = false;

const allowedStatuses: MediaAssetStatus[] = ['PROCESSING', 'READY', 'FAILED', 'DELETION_PENDING'];
const statusLabels: Record<MediaAssetStatus, string> = {
  PROCESSING: 'در حال پردازش', READY: 'آماده', FAILED: 'ناموفق',
  DELETION_PENDING: 'در حال حذف', DELETED: 'حذف‌شده',
};
const errors: Record<string, string> = {
  MEDIA_IN_USE: 'این رسانه در محتوا استفاده شده و قابل حذف نیست.',
  MEDIA_INVALID_FILE: 'فایل انتخاب‌شده تصویر معتبر نیست.',
  MEDIA_UPLOAD_TOO_LARGE: 'اندازه فایل یا ابعاد تصویر بیش از حد مجاز است.',
  MEDIA_STORAGE_UNAVAILABLE: 'فضای ذخیره‌سازی موقتاً در دسترس نیست.',
  validation: 'اطلاعات رسانه معتبر نیست.', forbidden: 'دسترسی مجاز نیست.',
  conflict: 'رسانه قابل حذف نیست.', failed: 'عملیات رسانه انجام نشد.',
};

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
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}><div><h1>کتابخانه رسانه</h1><p className={styles.subtitle}>{result.total} فایل</p></div></div>
          {params.error ? <p className={styles.feedback} role="alert">{errors[params.error] ?? errors.failed}</p> : null}
          {params.uploaded ? <p role="status">رسانه با موفقیت بارگذاری و پردازش شد.</p> : null}
          {params.deleted ? <p role="status">رسانه حذف شد.</p> : null}

          <form action={uploadMediaAction} className={styles.form}>
            <fieldset className={styles.fieldset}>
              <legend>بارگذاری تصویر</legend>
              <Input label="فایل JPEG، PNG یا WebP" name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
              <Input label="متن جایگزین پیش‌فرض" name="defaultAlt" required maxLength={300} />
              <div className={styles.formActions}><Button type="submit">بارگذاری</Button></div>
            </fieldset>
          </form>

          <div className={styles.toolbar}>
            <form>
              <Input label="جست‌وجوی متن جایگزین" name="search" defaultValue={search ?? ''} maxLength={100} />
              <Select label="وضعیت" name="status" defaultValue={status ?? ''}>
                <option value="">همه</option>
                {allowedStatuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
              </Select>
              <Button type="submit" variant="secondary">اعمال فیلتر</Button>
            </form>
          </div>

          {result.items.length === 0 ? <p className={styles.empty}>رسانه‌ای با این فیلتر یافت نشد.</p> : (
            <div className={styles.tableWrap}><table className={styles.table}>
              <thead><tr><th>متن جایگزین</th><th>وضعیت</th><th>ابعاد</th><th>استفاده</th><th>عملیات</th></tr></thead>
              <tbody>{result.items.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.defaultAlt ?? '—'}</td><td>{statusLabels[asset.status]}</td>
                  <td dir="ltr">{asset.sourceWidth && asset.sourceHeight ? `${asset.sourceWidth} × ${asset.sourceHeight}` : '—'}</td>
                  <td>{asset.referenceCount} مورد</td>
                  <td>{asset.referenceCount > 0 ? <span>در حال استفاده</span> : (
                    <form action={deleteMediaAction.bind(null, asset.id)}><Button type="submit" variant="danger">حذف</Button></form>
                  )}</td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
          {result.totalPages > 1 ? <nav className={styles.pagination}>
            {page > 1 ? <Link href={`/admin/media?page=${page - 1}${query}`}>قبلی</Link> : <span />}
            <span>صفحه {result.page} از {result.totalPages}</span>
            {page < result.totalPages ? <Link href={`/admin/media?page=${page + 1}${query}`}>بعدی</Link> : <span />}
          </nav> : null}
        </section>
      </div>
    </main>
  );
}
