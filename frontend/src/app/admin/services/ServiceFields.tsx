import { Input, Textarea } from "@/components/ui";
import type { AdminInjectionService } from "@/features/admin-content/service";
import { AdminFieldset, AdminFormRow } from "@/components/admin/AdminContent";

const IMAGE_ROWS = 6;
const SPECIFICATION_ROWS = 10;

export function ServiceFields({ service }: { service?: AdminInjectionService }) {
  const images = service?.images ?? [];
  const specifications = service?.specifications ?? [];

  return (
    <>
      <AdminFormRow>
        <Input label="نام" name="name" defaultValue={service?.name} required maxLength={160} />
        <Input label="اسلاگ" name="slug" dir="ltr" defaultValue={service?.slug} required maxLength={160} helpText="فقط حروف کوچک لاتین، عدد و خط تیره" />
      </AdminFormRow>
      <Textarea label="خلاصه (اختیاری)" name="summary" defaultValue={service?.summary ?? ""} maxLength={500} rows={2} />
      <Textarea label="توضیحات (اختیاری)" name="description" defaultValue={service?.description ?? ""} maxLength={4000} rows={5} />
      <AdminFormRow>
        <Input label="متن دکمه فراخوان (اختیاری)" name="ctaLabel" defaultValue={service?.ctaLabel ?? ""} maxLength={80} />
        <Input label="آدرس دکمه فراخوان (اختیاری)" name="ctaHref" dir="ltr" defaultValue={service?.ctaHref ?? ""} maxLength={2048} helpText="فقط یک مسیر داخلی مانند /contact" />
      </AdminFormRow>

      <AdminFieldset legend={<>تصاویر (حداکثر {IMAGE_ROWS} مورد، ردیف‌های خالی نادیده گرفته می‌شوند)</>}>
        {Array.from({ length: IMAGE_ROWS }, (_, index) => {
          const image = images[index];
          return (
            <AdminFormRow key={`image-${index}`}>
              <Input label={`آدرس تصویر ${index + 1}`} name={`image${index + 1}Url`} dir="ltr" defaultValue={image?.url ?? ""} maxLength={2048} />
              <Input label={`متن جایگزین تصویر ${index + 1}`} name={`image${index + 1}Alt`} defaultValue={image?.alt ?? ""} maxLength={240} />
            </AdminFormRow>
          );
        })}
      </AdminFieldset>

      <AdminFieldset legend={<>مشخصات فنی (حداکثر {SPECIFICATION_ROWS} مورد، ردیف‌های خالی نادیده گرفته می‌شوند)</>}>
        {Array.from({ length: SPECIFICATION_ROWS }, (_, index) => {
          const specification = specifications[index];
          return (
            <AdminFormRow key={`spec-${index}`}>
              <Input label={`عنوان مشخصه ${index + 1}`} name={`spec${index + 1}Label`} defaultValue={specification?.label ?? ""} maxLength={120} />
              <Input label={`مقدار مشخصه ${index + 1}`} name={`spec${index + 1}Value`} defaultValue={specification?.value ?? ""} maxLength={240} />
            </AdminFormRow>
          );
        })}
      </AdminFieldset>

      <AdminFormRow>
        <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={service?.metaTitle ?? ""} maxLength={160} />
        <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={service?.metaDescription ?? ""} maxLength={320} />
      </AdminFormRow>
    </>
  );
}
