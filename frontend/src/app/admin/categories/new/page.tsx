import type { Metadata } from "next";
import { Input, Textarea } from "@/components/ui";
import { createCategoryAction } from "@/features/admin-content/category";
import { AdminFieldset, AdminForm, AdminFormAlert, AdminFormRow, AdminPage } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "دسته جدید", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد دسته‌بندی با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewCategoryPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <AdminPage title="دسته جدید">
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminForm action={createCategoryAction} submitLabel="ایجاد دسته‌بندی">
        <AdminFormRow>
          <Input label="نام" name="name" required maxLength={160} />
          <Input label="اسلاگ" name="slug" dir="ltr" required maxLength={160} helpText="فقط حروف کوچک لاتین، عدد و خط تیره" />
        </AdminFormRow>
        <Textarea label="توضیحات (اختیاری)" name="description" maxLength={2000} rows={4} />
        <AdminFieldset legend={<>تصویر (اختیاری)</>}>
          <AdminFormRow>
            <Input label="آدرس تصویر" name="imageUrl" dir="ltr" maxLength={2048} />
            <Input label="متن جایگزین" name="imageAlt" maxLength={240} />
          </AdminFormRow>
        </AdminFieldset>
        <AdminFormRow>
          <Input label="عنوان متا (اختیاری)" name="metaTitle" maxLength={160} />
          <Input label="توضیح متا (اختیاری)" name="metaDescription" maxLength={320} />
        </AdminFormRow>
      </AdminForm>
    </AdminPage>
  );
}
