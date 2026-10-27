import { Input, Textarea } from "@/components/ui";
import type { AdminArticle } from "@/features/admin-content/article";
import { ArticleFeaturedImageEditor, type AdminMediaAsset } from "@/features/admin-media";
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

      <ArticleFeaturedImageEditor initialImage={article?.featuredImage} mediaAssets={mediaAssets} />

      <div className={styles.row}>
        <Input label="عنوان متا (اختیاری)" name="metaTitle" defaultValue={article?.metaTitle ?? ""} maxLength={160} />
        <Input label="توضیح متا (اختیاری)" name="metaDescription" defaultValue={article?.metaDescription ?? ""} maxLength={320} />
      </div>
    </>
  );
}
