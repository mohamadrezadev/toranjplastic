import { Input, Textarea } from "@/components/ui";
import type { AdminInjectionService } from "@/lib/admin-content";
import styles from "../Admin.module.css";

const IMAGE_ROWS = 6;
const SPECIFICATION_ROWS = 10;

export function ServiceFields({ service }: { service?: AdminInjectionService }) {
  const images = service?.images ?? [];
  const specifications = service?.specifications ?? [];

  return (
    <>
      <div className={styles.row}>
        <Input label="نام" name="name" defaultValue={service?.name} required maxLength={160} />
        <Input label="اسلاگ" name="slug" dir="ltr" defaultValue={service?.slug} required maxLength={160} helpText="فقط حروف کوچک لاتین، عدد و خط تیره" />
      </div>
      <Textarea label="خلاصه (اختیاری)" name="summary" defaultValue={service?.summary ?? ""} maxLength={500} rows={2} />
      <Textarea label="توضیحات (اختیاری)" name="description" defaultValue={service?.description ?? ""} maxLength={4000} rows={5} />
      <div className={styles.row}>
        <Input label="متن دکمه فراخوان (اختیاری)" name="ctaLabel" defaultValue={service?.ctaLabel ?? ""} maxLength={80} />
        <Input label="آدرس دکمه فراخوان (اختیاری)" name="ctaHref" dir="ltr" defaultValue={service?.ctaHref ?? ""} maxLength={2048} helpText="فقط یک مسیر داخلی مانند /contact" />
      </div>

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

      <fieldset className={styles.fieldset}>
        <legend>مشخصات فنی (حداکثر {SPECIFICATION_ROWS} مورد، ردیف‌های خالی نادیده گرفته می‌شوند)</legend>
        {Array.from({ length: SPECIFICATION_ROWS }, (_, index) => {
          const specification = specifications[index];
          return (
            <div className={styles.row} key={`spec-${index}`}>
              <Input label={`عنوان مشخصه ${index + 1}`} name={`spec${index + 1}Label`} defaultValue={specification?.label ?? ""} maxLength={120} />
              <Input label={`مقدار مشخصه ${index + 1}`} name={`spec${index + 1}Value`} defaultValue={specification?.value ?? ""} maxLength={240} />
            </div>
          );
        })}
      </fieldset>

      <div className={styles.row}>
        <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={service?.metaTitle ?? ""} maxLength={160} />
        <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={service?.metaDescription ?? ""} maxLength={320} />
      </div>
    </>
  );
}
