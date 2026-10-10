import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { ContentCard, ContentGrid, ContentPageHeading, Pagination, contentStyles } from "@/components/content";
import { listServices, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "خدمات تزریق پلاستیک منتشرشده بر پایه اطلاعات فنی تأییدشده؛ جزئیات ظرفیت تنها در صورت انتشار رسمی نمایش داده می‌شود.";
export const metadata = publicCollectionMetadata("خدمات تزریق پلاستیک", description);

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const result = await listServices(parsePageNumber((await searchParams).page));
  return <main className={contentStyles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "تزریق پلاستیک" }]} /><section className={`${contentStyles.section} content-container`}><ContentPageHeading eyebrow="خدمات صنعتی" title="خدمات تزریق پلاستیک" description={description} />{result.items.length ? <><ContentGrid>{result.items.map((service) => <ContentCard key={service.id} title={service.name} summary={service.summary} href={`/injection-molding/${service.slug}`} image={service.images[0]} />)}</ContentGrid><Pagination pageInfo={result.pageInfo} basePath="/injection-molding" /></> : <div className={contentStyles.section}><EmptyState title="خدمت منتشرشده‌ای وجود ندارد" description="اطلاعات خدمات پس از بررسی فنی و انتشار رسمی در این بخش قرار می‌گیرد." /></div>}</section></main>;
}
