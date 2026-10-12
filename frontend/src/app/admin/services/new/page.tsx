import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { createInjectionServiceAction } from "@/features/admin-content/service";
import { ServiceFields } from "../ServiceFields";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "خدمت جدید", robots: { index: false, follow: false } };

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد خدمت با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewServicePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>خدمت جدید</h1>
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}
          <form action={createInjectionServiceAction} className={styles.form}>
            <ServiceFields />
            <div className={styles.formActions}>
              <Button type="submit">ایجاد خدمت</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
