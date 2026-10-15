import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { AdminContentError, archiveArticleAction, getArticle, publishArticleAction, updateArticleAction } from "@/features/admin-content/article";
import { ArticleFields } from "../ArticleFields";
import { StatusBadge } from "../../content/StatusBadge";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "ویرایش مقاله", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "عملیات با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function EditArticlePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;

  let article;
  try {
    article = await getArticle(id);
  } catch (caught) {
    if (caught instanceof AdminContentError && caught.kind === "not_found") notFound();
    throw caught;
  }

  const updateAction = updateArticleAction.bind(null, id);
  const publishAction = publishArticleAction.bind(null, id);
  const archiveAction = archiveArticleAction.bind(null, id);

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>ویرایش مقاله</h1>
            <StatusBadge status={article.status} />
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}

          <div className={styles.statusActions}>
            {article.status === "PUBLISHED" ? (
              <span className={styles.statusLabel}>منتشرشده</span>
            ) : (
              <form action={publishAction}><Button type="submit">انتشار</Button></form>
            )}
            {article.status === "ARCHIVED" ? (
              <span className={styles.statusLabel}>آرشیوشده</span>
            ) : (
              <form action={archiveAction}><Button type="submit" variant="danger">آرشیو</Button></form>
            )}
          </div>

          <form action={updateAction} className={styles.form}>
            <ArticleFields article={article} />
            <div className={styles.formActions}>
              <Button type="submit">ذخیره تغییرات</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
