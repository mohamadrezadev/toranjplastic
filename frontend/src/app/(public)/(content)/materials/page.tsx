import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { ContentCard, ContentGrid, ContentPageHeading, ContentTag, Pagination, contentStyles } from "@/components/content";
import { listMaterials, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "مواد اولیه پلیمری منتشرشده برای بررسی و استعلام؛ حضور در فهرست به معنی تضمین موجودی، قیمت یا زمان تحویل نیست.";
export const metadata = publicCollectionMetadata("مواد اولیه", description, "/materials");
export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const result = await listMaterials(parsePageNumber((await searchParams).page));
  return <main className={contentStyles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "مواد اولیه" }]} /><section className={`${contentStyles.section} content-container`}><ContentPageHeading eyebrow="تأمین مواد" title="مواد اولیه" description={description} />{result.items.length ? <><ContentGrid>{result.items.map((item) => <ContentCard key={item.id} title={item.name} summary={item.summary} href={`/materials/${item.slug}`} image={item.images[0]} meta={<>{item.family ? <ContentTag>{item.family}</ContentTag> : null}{item.grade ? <ContentTag ltr>{item.grade}</ContentTag> : null}</>} />)}</ContentGrid><Pagination pageInfo={result.pageInfo} basePath="/materials" /></> : <div className={contentStyles.section}><EmptyState title="ماده منتشرشده‌ای وجود ندارد" description="فهرست مواد پس از تأیید اطلاعات و انتشار رسمی در این بخش نمایش داده می‌شود." /></div>}</section></main>;
}
