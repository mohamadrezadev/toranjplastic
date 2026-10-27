import { Checkbox, Input, Select, Textarea } from "@/components/ui";
import type { AdminCategory } from "@/features/admin-content/category";
import type { AdminProduct } from "@/features/admin-content/product";
import { ProductGalleryEditor, type AdminMediaAsset } from "@/features/admin-media";
import styles from "../Admin.module.css";

const SPECIFICATION_ROWS = 10;

export function ProductFields({ product, categories, mediaAssets = [] }: { product?: AdminProduct; categories: AdminCategory[]; mediaAssets?: AdminMediaAsset[] }) {
  const images = product?.images ?? [];
  const specifications = product?.specifications ?? [];

  return (
    <>
      {product ? <input type="hidden" name="expectedVersion" value={product.contentVersion} /> : null}
      <div className={styles.row}>
        <Input label="نام" name="name" defaultValue={product?.name} required maxLength={160} />
        <Input label="اسلاگ" name="slug" dir="ltr" defaultValue={product?.slug} required maxLength={160} helpText="فقط حروف کوچک لاتین، عدد و خط تیره" />
      </div>
      <Textarea label="خلاصه (اختیاری)" name="summary" defaultValue={product?.summary ?? ""} maxLength={500} rows={2} />
      <Textarea label="توضیحات (اختیاری)" name="description" defaultValue={product?.description ?? ""} maxLength={4000} rows={5} />
      <div className={styles.row}>
        <Select label="دسته‌بندی (اختیاری)" name="categoryId" defaultValue={product?.categoryId ?? ""}>
          <option value="">بدون دسته‌بندی</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>
        <Checkbox label="محصول ویژه" name="featured" defaultChecked={product?.featured ?? false} />
      </div>

      <ProductGalleryEditor initialImages={images} mediaAssets={mediaAssets} />

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
        <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={product?.metaTitle ?? ""} maxLength={160} />
        <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={product?.metaDescription ?? ""} maxLength={320} />
      </div>
    </>
  );
}
