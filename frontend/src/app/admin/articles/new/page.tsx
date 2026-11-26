import type { Metadata } from "next";
import { createArticleAction } from "@/features/admin-content/article";
import { listMedia } from "@/features/admin-media";
import { ArticleFields } from "../ArticleFields";
import { AdminForm, AdminFormAlert, AdminPage } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "مقاله جدید", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد مقاله با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewArticlePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const mediaPage = await listMedia({ pageSize: 50, status: 'READY' });

  return (
    <AdminPage title="مقاله جدید">
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminForm action={createArticleAction} submitLabel="ایجاد مقاله">
        <ArticleFields mediaAssets={mediaPage.items} />
      </AdminForm>
    </AdminPage>
  );
}
