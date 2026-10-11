import { Input, Textarea } from "@/components/ui";
import type { AdminArticle } from "@/lib/admin-content";
import styles from "../Admin.module.css";

export function ArticleFields({ article }: { article?: AdminArticle }) {
  return (
    <>
      <div className={styles.row}>
        <Input label="عنوان" name="title" defaultValue={article?.title} required maxLength={200} />
        <Input label="اسلاگ" name="slug" dir="ltr" defaultValue={article?.slug} required maxLength={160} helpText="فقط حروف کوچک لاتین، عدد و خط تیره" />
      </div>
      <Textarea label="خلاصه (اختیاری)" name="summary" defaultValue={article?.summary ?? ""} maxLength={500} rows={2} />
      <Textarea label="متن مقاله" name="body" defaultValue={article?.body} required rows={12} />

      <fieldset className={styles.fieldset}>
        <legend>تصویر شاخص (اختیاری)</legend>
        <div className={styles.row}>
          <Input label="آدرس تصویر" name="featuredImageUrl" dir="ltr" defaultValue={article?.featuredImage?.url ?? ""} maxLength={2048} />
          <Input label="متن جایگزین" name="featuredImageAlt" defaultValue={article?.featuredImage?.alt ?? ""} maxLength={240} />
        </div>
      </fieldset>

      <div className={styles.row}>
        <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={article?.metaTitle ?? ""} maxLength={160} />
        <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={article?.metaDescription ?? ""} maxLength={320} />
      </div>
    </>
  );
}
