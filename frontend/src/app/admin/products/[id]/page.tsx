import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminContentError, archiveProductAction, getProduct, publishProductAction, updateProductAction } from "@/features/admin-content/product";
import { listCategories } from "@/features/admin-content/category";
import { listMedia } from "@/features/admin-media";
import { ProductFields } from "../ProductFields";
import { AdminForm, AdminFormAlert, AdminPage, AdminStatusActions, ContentStatusBadge } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "ویرایش محصول", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  CONTENT_VERSION_CONFLICT: "تداخل نسخه: این محصول پیش از ذخیره شما توسط کاربر دیگری ویرایش شده است. برای مشاهده آخرین اطلاعات، صفحه را تازه‌سازی کنید.",
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
    <AdminPage title="ویرایش محصول" badge={<ContentStatusBadge status={product.status} />}>
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} refreshHref={error === "CONTENT_VERSION_CONFLICT" ? `/admin/products/${id}` : undefined} /> : null}
      <AdminStatusActions status={product.status} publishAction={publishAction} archiveAction={archiveAction} />

      <AdminForm action={updateAction} submitLabel="ذخیره تغییرات">
        <ProductFields product={product} categories={categoryPage.items} mediaAssets={mediaPage.items} />
      </AdminForm>
    </AdminPage>
  );
}
