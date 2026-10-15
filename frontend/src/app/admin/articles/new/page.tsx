import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { createArticleAction } from "@/features/admin-content/article";
import { ArticleFields } from "../ArticleFields";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "مقاله جدید", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد مقاله با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewArticlePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>مقاله جدید</h1>
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}
          <form action={createArticleAction} className={styles.form}>
            <ArticleFields />
            <div className={styles.formActions}>
              <Button type="submit">ایجاد مقاله</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
