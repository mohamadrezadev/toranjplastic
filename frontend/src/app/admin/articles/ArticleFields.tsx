import { Checkbox, Input, Textarea } from "@/components/ui";
import type { AdminArticle } from "@/features/admin-content/article";
import { MediaPicker, mediaAssetIdFromPublicUrl, type AdminMediaAsset } from "@/features/admin-media";
import styles from "../Admin.module.css";

export function ArticleFields({ article, mediaAssets = [] }: { article?: AdminArticle; mediaAssets?: AdminMediaAsset[] }) {
  return (
    <>
      {article ? <input type="hidden" name="expectedVersion" value={article.contentVersion} /> : null}
      <div className={styles.row}>
        <Input label="عنوان" name="title" defaultValue={article?.title} required maxLength={200} />
        <Input label="اسلاگ" name="slug" dir="ltr" defaultValue={article?.slug} required maxLength={160} helpText="فقط حروف کوچک لاتین، عدد و خط تیره" />
      </div>
      <Textarea label="خلاصه (اختیاری)" name="summary" defaultValue={article?.summary ?? ""} maxLength={500} rows={2} />
      <Textarea label="متن مقاله" name="body" defaultValue={article?.body} required rows={12} />

      <fieldset className={styles.fieldset}>
        <legend>تصویر شاخص (اختیاری)</legend>
        <div className={styles.row}>
          <MediaPicker name="featuredImageMediaAssetId" label="انتخاب از کتابخانه" assets={mediaAssets} defaultValue={mediaAssetIdFromPublicUrl(article?.featuredImage?.url)} />
          <Input label="آدرس تصویر" name="featuredImageUrl" dir="ltr" defaultValue={article?.featuredImage?.url ?? ""} maxLength={2048} />
          <Input label="متن جایگزین" name="featuredImageAlt" defaultValue={article?.featuredImage?.alt ?? ""} maxLength={240} />
          {article?.featuredImage ? <Checkbox label="حذف تصویر شاخص" name="featuredImageClear" /> : null}
        </div>
      </fieldset>

      <div className={styles.row}>
        <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={article?.metaTitle ?? ""} maxLength={160} />
        <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={article?.metaDescription ?? ""} maxLength={320} />
      </div>
    </>
  );
}
