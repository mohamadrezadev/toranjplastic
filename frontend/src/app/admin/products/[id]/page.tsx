import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { AdminContentError, archiveProductAction, getProduct, publishProductAction, updateProductAction } from "@/features/admin-content/product";
import { listCategories } from "@/features/admin-content/category";
import { listMedia } from "@/features/admin-media";
import { ProductFields } from "../ProductFields";
import { StatusBadge } from "../../content/StatusBadge";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "ویرایش محصول", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "عملیات با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;

  let product;
  try {
    product = await getProduct(id);
  } catch (caught) {
    if (caught instanceof AdminContentError && caught.kind === "not_found") notFound();
    throw caught;
  }
  const [categoryPage, mediaPage] = await Promise.all([
    listCategories({ pageSize: 50 }),
    listMedia({ pageSize: 50, status: 'READY' }),
  ]);

  const updateAction = updateProductAction.bind(null, id);
  const publishAction = publishProductAction.bind(null, id);
  const archiveAction = archiveProductAction.bind(null, id);

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>ویرایش محصول</h1>
            <StatusBadge status={product.status} />
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}

          <div className={styles.statusActions}>
            {product.status === "PUBLISHED" ? (
              <span className={styles.statusLabel}>منتشرشده</span>
            ) : (
              <form action={publishAction}><Button type="submit">انتشار</Button></form>
            )}
            {product.status === "ARCHIVED" ? (
              <span className={styles.statusLabel}>آرشیوشده</span>
            ) : (
              <form action={archiveAction}><Button type="submit" variant="danger">آرشیو</Button></form>
            )}
          </div>

          <form action={updateAction} className={styles.form}>
            <ProductFields product={product} categories={categoryPage.items} mediaAssets={mediaPage.items} />
            <div className={styles.formActions}>
              <Button type="submit">ذخیره تغییرات</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
