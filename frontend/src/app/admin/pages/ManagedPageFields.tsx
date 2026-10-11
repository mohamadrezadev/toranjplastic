import { Input, Textarea } from "@/components/ui";
import type { AdminManagedPage } from "@/lib/admin-content";
import styles from "../Admin.module.css";

const IMAGE_ROWS = 6;

export function ManagedPageFields({ page }: { page?: AdminManagedPage }) {
  const images = page?.images ?? [];

  return (
    <>
      <div className={styles.row}>
        <Input label="عنوان" name="title" defaultValue={page?.title} required maxLength={200} />
        <Input label="اسلاگ" name="slug" dir="ltr" defaultValue={page?.slug} required maxLength={160} helpText="فقط حروف کوچک لاتین، عدد و خط تیره" />
      </div>
      <Textarea label="خلاصه (اختیاری)" name="summary" defaultValue={page?.summary ?? ""} maxLength={500} rows={2} />
      <Textarea label="متن صفحه" name="body" defaultValue={page?.body} required rows={12} />

      <fieldset className={styles.fieldset}>
        <legend>تصاویر (حداکثر {IMAGE_ROWS} مورد، ردیف‌های خالی نادیده گرفته می‌شوند)</legend>
        {Array.from({ length: IMAGE_ROWS }, (_, index) => {
          const image = images[index];
          return (
            <div className={styles.row} key={`image-${index}`}>
              <Input label={`آدرس تصویر ${index + 1}`} name={`image${index + 1}Url`} dir="ltr" defaultValue={image?.url ?? ""} maxLength={2048} />
              <Input label={`متن جایگزین تصویر ${index + 1}`} name={`image${index + 1}Alt`} defaultValue={image?.alt ?? ""} maxLength={240} />
            </div>
          );
        })}
      </fieldset>

      <div className={styles.row}>
        <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={page?.metaTitle ?? ""} maxLength={160} />
        <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={page?.metaDescription ?? ""} maxLength={320} />
      </div>
    </>
  );
}
