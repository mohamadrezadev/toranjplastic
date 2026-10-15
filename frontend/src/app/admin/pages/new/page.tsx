import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { createManagedPageAction } from "@/features/admin-content/managed-page";
import { ManagedPageFields } from "../ManagedPageFields";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "صفحه جدید", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد صفحه با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewManagedPagePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>صفحه جدید</h1>
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}
          <form action={createManagedPageAction} className={styles.form}>
            <ManagedPageFields />
            <div className={styles.formActions}>
              <Button type="submit">ایجاد صفحه</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
