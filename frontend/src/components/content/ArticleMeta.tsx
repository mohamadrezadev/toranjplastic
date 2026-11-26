import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { ContentTag } from "./ContentPage";
import styles from "./Content.module.css";

export type ArticleCategoryRef = Readonly<{ name: string; slug: string }>;

const articleDateFormat = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "UTC" });

/**
 * Persian long date, read in UTC so the server-rendered text is stable.
 * Returns null for a CMS value that is not a valid date, so a malformed
 * `publishedAt` drops the date instead of failing the whole route.
 */
export function formatArticleDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return articleDateFormat.format(date);
  } catch {
    return null;
  }
}

/**
 * Card and hero metadata of one article, shared by the home band, the
 * article collections and the article detail page.
 *
 * - The category is a read-only tag, or with `categoryLink` an Astryx Link to
 *   its article collection. The link keeps a 44 by 44 pixel target and draws
 *   its label as a bordered, underlined pill, a link cue that does not depend
 *   on hover and never reads as the plain tag.
 * - The publication date is supporting text with a machine-readable <time>,
 *   not a badge. It is omitted when the CMS value is not a date.
 */
export function ArticleMeta({ category, publishedAt, categoryLink = false }: { category: ArticleCategoryRef | null; publishedAt: string; categoryLink?: boolean }) {
  const date = formatArticleDate(publishedAt);
  return (
    <>
      {category ? (categoryLink ? (
        <Link href={`/articles/category/${category.slug}`} color="inherit" type="inherit" className={styles.tagLink}>
          <span className={styles.tagLinkLabel}>{category.name}</span>
        </Link>
      ) : (
        <ContentTag>{category.name}</ContentTag>
      )) : null}
      {date ? <Text type="supporting" color="secondary"><time dateTime={publishedAt}>{date}</time></Text> : null}
    </>
  );
}
