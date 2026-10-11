import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";
import { AdminContentError, getCategory } from "@/lib/admin-content";
import { archiveCategoryAction, publishCategoryAction, updateCategoryAction } from "../../content/actions";
import { StatusBadge } from "../../content/StatusBadge";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "ویرایش دسته‌بندی", robots: { index: false, follow: false } };

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
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>ویرایش دسته‌بندی</h1>
            <StatusBadge status={category.status} />
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}

          <div className={styles.statusActions}>
            {category.status === "PUBLISHED" ? (
              <span className={styles.statusLabel}>منتشرشده</span>
            ) : (
              <form action={publishAction}><Button type="submit">انتشار</Button></form>
            )}
            {category.status === "ARCHIVED" ? (
              <span className={styles.statusLabel}>آرشیوشده</span>
            ) : (
              <form action={archiveAction}><Button type="submit" variant="danger">آرشیو</Button></form>
            )}
          </div>

          <form action={updateAction} className={styles.form}>
            <div className={styles.row}>
              <Input label="نام" name="name" defaultValue={category.name} required maxLength={160} />
              <Input label="اسلاگ" name="slug" dir="ltr" defaultValue={category.slug} required maxLength={160} />
            </div>
            <Textarea label="توضیحات (اختیاری)" name="description" defaultValue={category.description ?? ""} maxLength={2000} rows={4} />
            <fieldset className={styles.fieldset}>
              <legend>تصویر (اختیاری)</legend>
              <div className={styles.row}>
                <Input label="آدرس تصویر" name="imageUrl" dir="ltr" defaultValue={category.image?.url ?? ""} maxLength={2048} />
                <Input label="متن جایگزین" name="imageAlt" defaultValue={category.image?.alt ?? ""} maxLength={240} />
              </div>
            </fieldset>
            <div className={styles.row}>
              <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={category.metaTitle ?? ""} maxLength={160} />
              <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={category.metaDescription ?? ""} maxLength={320} />
            </div>
            <div className={styles.formActions}>
              <Button type="submit">ذخیره تغییرات</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
