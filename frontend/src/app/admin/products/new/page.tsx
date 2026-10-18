import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { listCategories } from "@/features/admin-content/category";
import { createProductAction } from "@/features/admin-content/product";
import { listMedia } from "@/features/admin-media";
import { ProductFields } from "../ProductFields";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "محصول جدید", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد محصول با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const [categoryPage, mediaPage] = await Promise.all([
    listCategories({ pageSize: 100 }),
    listMedia({ pageSize: 50, status: 'READY' }),
  ]);

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>محصول جدید</h1>
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}
          <form action={createProductAction} className={styles.form}>
            <ProductFields categories={categoryPage.items} mediaAssets={mediaPage.items} />
            <div className={styles.formActions}>
              <Button type="submit">ایجاد محصول</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
