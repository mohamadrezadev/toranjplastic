import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { createMaterialAction } from "@/features/admin-content/material";
import { MaterialFields } from "../MaterialFields";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "ماده جدید", robots: { index: false, follow: false } };

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد ماده با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewMaterialPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>ماده جدید</h1>
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}
          <form action={createMaterialAction} className={styles.form}>
            <MaterialFields />
            <div className={styles.formActions}>
              <Button type="submit">ایجاد ماده</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
