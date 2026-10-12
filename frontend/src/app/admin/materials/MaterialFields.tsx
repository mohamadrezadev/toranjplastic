import { Checkbox, Input, Textarea } from "@/components/ui";
import type { AdminMaterial } from "@/features/admin-content/material";
import styles from "../Admin.module.css";

const IMAGE_ROWS = 6;
const SPECIFICATION_ROWS = 10;

export function MaterialFields({ material }: { material?: AdminMaterial }) {
  const images = material?.images ?? [];
  const specifications = material?.specifications ?? [];

  return (
    <>
      <div className={styles.row}>
        <Input label="نام" name="name" defaultValue={material?.name} required maxLength={160} />
        <Input label="اسلاگ" name="slug" dir="ltr" defaultValue={material?.slug} required maxLength={160} helpText="فقط حروف کوچک لاتین، عدد و خط تیره" />
      </div>
      <div className={styles.row}>
        <Input label="خانواده ماده (اختیاری)" name="family" defaultValue={material?.family ?? ""} maxLength={160} />
        <Input label="گرید (اختیاری)" name="grade" defaultValue={material?.grade ?? ""} maxLength={160} />
        <Input label="سازنده (اختیاری)" name="manufacturer" defaultValue={material?.manufacturer ?? ""} maxLength={160} />
      </div>
      <Textarea label="خلاصه (اختیاری)" name="summary" defaultValue={material?.summary ?? ""} maxLength={500} rows={2} />
      <Textarea label="توضیحات (اختیاری)" name="description" defaultValue={material?.description ?? ""} maxLength={4000} rows={5} />
      <Checkbox label="امکان استعلام برای این ماده فعال باشد" name="inquiryAvailable" defaultChecked={material?.inquiryAvailable ?? true} />

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
        <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={material?.metaTitle ?? ""} maxLength={160} />
        <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={material?.metaDescription ?? ""} maxLength={320} />
      </div>
    </>
  );
}
