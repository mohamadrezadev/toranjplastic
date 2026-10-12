import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { AdminContentError, archiveManagedPageAction, getManagedPage, publishManagedPageAction, updateManagedPageAction } from "@/features/admin-content/managed-page";
import { ManagedPageFields } from "../ManagedPageFields";
import { StatusBadge } from "../../content/StatusBadge";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "ویرایش صفحه", robots: { index: false, follow: false } };

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "عملیات با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function EditManagedPagePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;

  let page;
  try {
    page = await getManagedPage(id);
  } catch (caught) {
    if (caught instanceof AdminContentError && caught.kind === "not_found") notFound();
    throw caught;
  }

  const updateAction = updateManagedPageAction.bind(null, id);
  const publishAction = publishManagedPageAction.bind(null, id);
  const archiveAction = archiveManagedPageAction.bind(null, id);

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>ویرایش صفحه</h1>
            <StatusBadge status={page.status} />
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}

          <div className={styles.statusActions}>
            {page.status === "PUBLISHED" ? (
              <span className={styles.statusLabel}>منتشرشده</span>
            ) : (
              <form action={publishAction}><Button type="submit">انتشار</Button></form>
            )}
            {page.status === "ARCHIVED" ? (
              <span className={styles.statusLabel}>آرشیوشده</span>
            ) : (
              <form action={archiveAction}><Button type="submit" variant="danger">آرشیو</Button></form>
            )}
          </div>

          <form action={updateAction} className={styles.form}>
            <ManagedPageFields page={page} />
            <div className={styles.formActions}>
              <Button type="submit">ذخیره تغییرات</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
