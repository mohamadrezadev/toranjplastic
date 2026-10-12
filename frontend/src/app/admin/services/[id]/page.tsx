import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { AdminContentError, archiveInjectionServiceAction, getInjectionService, publishInjectionServiceAction, updateInjectionServiceAction } from "@/features/admin-content/service";
import { ServiceFields } from "../ServiceFields";
import { StatusBadge } from "../../content/StatusBadge";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "ویرایش خدمت", robots: { index: false, follow: false } };

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "عملیات با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function EditServicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;

  let service;
  try {
    service = await getInjectionService(id);
  } catch (caught) {
    if (caught instanceof AdminContentError && caught.kind === "not_found") notFound();
    throw caught;
  }

  const updateAction = updateInjectionServiceAction.bind(null, id);
  const publishAction = publishInjectionServiceAction.bind(null, id);
  const archiveAction = archiveInjectionServiceAction.bind(null, id);

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>ویرایش خدمت</h1>
            <StatusBadge status={service.status} />
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}

          <div className={styles.statusActions}>
            {service.status === "PUBLISHED" ? (
              <span className={styles.statusLabel}>منتشرشده</span>
            ) : (
              <form action={publishAction}><Button type="submit">انتشار</Button></form>
            )}
            {service.status === "ARCHIVED" ? (
              <span className={styles.statusLabel}>آرشیوشده</span>
            ) : (
              <form action={archiveAction}><Button type="submit" variant="danger">آرشیو</Button></form>
            )}
          </div>

          <form action={updateAction} className={styles.form}>
            <ServiceFields service={service} />
            <div className={styles.formActions}>
              <Button type="submit">ذخیره تغییرات</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
