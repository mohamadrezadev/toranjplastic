import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { ContentCard, ContentGrid, ContentPageHeading, ContentTag, Pagination, contentStyles } from "@/components/content";
import { listArticles, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "مقاله‌ها و یادداشت‌های منتشرشده ترنج پلاستیک.";
export const metadata = publicCollectionMetadata("مقالات", description);
const formatDate = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const result = await listArticles(parsePageNumber((await searchParams).page));
  return <main className={contentStyles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "مقالات" }]} /><section className={`${contentStyles.section} content-container`}><ContentPageHeading eyebrow="دانشنامه" title="مقالات" description={description} />{result.items.length ? <><ContentGrid>{result.items.map((item) => <ContentCard key={item.id} title={item.title} summary={item.summary} href={`/articles/${item.slug}`} image={item.featuredImage} meta={<ContentTag>{formatDate(item.publishedAt)}</ContentTag>} />)}</ContentGrid><Pagination pageInfo={result.pageInfo} basePath="/articles" /></> : <div className={contentStyles.section}><EmptyState title="مقاله منتشرشده‌ای وجود ندارد" description="مقاله‌ها پس از بازبینی و انتشار رسمی در این بخش قرار می‌گیرند." /></div>}</section></main>;
}
