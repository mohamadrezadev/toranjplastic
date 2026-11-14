import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Input, Textarea } from "@/components/ui";
import { AdminContentError, archiveCategoryAction, getCategory, publishCategoryAction, updateCategoryAction } from "@/features/admin-content/category";
import { AdminFieldset, AdminForm, AdminFormAlert, AdminFormRow, AdminPage, AdminStatusActions, ContentStatusBadge } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "ویرایش دسته‌بندی", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "عملیات با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function EditCategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;

  let category;
  try {
    category = await getCategory(id);
  } catch (caught) {
    if (caught instanceof AdminContentError && caught.kind === "not_found") notFound();
    throw caught;
  }

  const updateAction = updateCategoryAction.bind(null, id);
  const publishAction = publishCategoryAction.bind(null, id);
  const archiveAction = archiveCategoryAction.bind(null, id);

  return (
    <AdminPage title="ویرایش دسته‌بندی" badge={<ContentStatusBadge status={category.status} />}>
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminStatusActions status={category.status} publishAction={publishAction} archiveAction={archiveAction} />

      <AdminForm action={updateAction} submitLabel="ذخیره تغییرات">
        <AdminFormRow>
          <Input label="نام" name="name" defaultValue={category.name} required maxLength={160} />
          <Input label="اسلاگ" name="slug" dir="ltr" defaultValue={category.slug} required maxLength={160} />
        </AdminFormRow>
        <Textarea label="توضیحات (اختیاری)" name="description" defaultValue={category.description ?? ""} maxLength={2000} rows={4} />
        <AdminFieldset legend={<>تصویر (اختیاری)</>}>
          <AdminFormRow>
            <Input label="آدرس تصویر" name="imageUrl" dir="ltr" defaultValue={category.image?.url ?? ""} maxLength={2048} />
            <Input label="متن جایگزین" name="imageAlt" defaultValue={category.image?.alt ?? ""} maxLength={240} />
          </AdminFormRow>
        </AdminFieldset>
        <AdminFormRow>
          <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={category.metaTitle ?? ""} maxLength={160} />
          <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={category.metaDescription ?? ""} maxLength={320} />
        </AdminFormRow>
      </AdminForm>
    </AdminPage>
  );
}
