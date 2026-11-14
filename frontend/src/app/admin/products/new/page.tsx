import type { Metadata } from "next";
import { listCategories } from "@/features/admin-content/category";
import { createProductAction } from "@/features/admin-content/product";
import { listMedia } from "@/features/admin-media";
import { ProductFields } from "../ProductFields";
import { AdminForm, AdminFormAlert, AdminPage } from "@/components/admin/AdminContent";

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
    listCategories({ pageSize: 50 }),
    listMedia({ pageSize: 50, status: 'READY' }),
  ]);

  return (
    <AdminPage title="محصول جدید">
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminForm action={createProductAction} submitLabel="ایجاد محصول">
        <ProductFields categories={categoryPage.items} mediaAssets={mediaPage.items} />
      </AdminForm>
    </AdminPage>
  );
}
