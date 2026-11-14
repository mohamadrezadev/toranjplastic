import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminContentError, archiveArticleAction, getArticle, publishArticleAction, updateArticleAction } from "@/features/admin-content/article";
import { listMedia } from "@/features/admin-media";
import { ArticleFields } from "../ArticleFields";
import { AdminForm, AdminFormAlert, AdminPage, AdminStatusActions, ContentStatusBadge } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "ویرایش مقاله", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  CONTENT_VERSION_CONFLICT: "تداخل نسخه: این مقاله پیش از ذخیره شما توسط کاربر دیگری ویرایش شده است. برای مشاهده آخرین اطلاعات، صفحه را تازه‌سازی کنید.",
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
  const mediaPage = await listMedia({ pageSize: 50, status: 'READY' });

  const updateAction = updateArticleAction.bind(null, id);
  const publishAction = publishArticleAction.bind(null, id);
  const archiveAction = archiveArticleAction.bind(null, id);

  return (
    <AdminPage title="ویرایش مقاله" badge={<ContentStatusBadge status={article.status} />}>
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} refreshHref={error === "CONTENT_VERSION_CONFLICT" ? `/admin/articles/${id}` : undefined} /> : null}
      <AdminStatusActions status={article.status} publishAction={publishAction} archiveAction={archiveAction} />

      <AdminForm action={updateAction} submitLabel="ذخیره تغییرات">
        <ArticleFields article={article} mediaAssets={mediaPage.items} />
      </AdminForm>
    </AdminPage>
  );
}
