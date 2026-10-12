import type { Metadata } from "next";
import { Button, Input, Textarea } from "@/components/ui";
import { createCategoryAction } from "@/features/admin-content/category";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "دسته جدید", robots: { index: false, follow: false } };

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد دسته‌بندی با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewCategoryPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>دسته جدید</h1>
          </div>
          {error ? <p className={styles.feedback} role="alert">{errorMessages[error] ?? errorMessages.failed}</p> : null}
          <form action={createCategoryAction} className={styles.form}>
            <div className={styles.row}>
              <Input label="نام" name="name" required maxLength={160} />
              <Input label="اسلاگ" name="slug" dir="ltr" required maxLength={160} helpText="فقط حروف کوچک لاتین، عدد و خط تیره" />
            </div>
            <Textarea label="توضیحات (اختیاری)" name="description" maxLength={2000} rows={4} />
            <fieldset className={styles.fieldset}>
              <legend>تصویر (اختیاری)</legend>
              <div className={styles.row}>
                <Input label="آدرس تصویر" name="imageUrl" dir="ltr" maxLength={2048} />
                <Input label="متن جایگزین" name="imageAlt" maxLength={240} />
              </div>
            </fieldset>
            <div className={styles.row}>
              <Input label="عنوان متا (اختیاری)" name="metaTitle" maxLength={160} />
              <Input label="توضیح متا (اختیاری)" name="metaDescription" maxLength={320} />
            </div>
            <div className={styles.formActions}>
              <Button type="submit">ایجاد دسته‌بندی</Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
