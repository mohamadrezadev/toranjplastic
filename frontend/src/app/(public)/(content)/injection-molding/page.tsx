import { Center } from "@astryxdesign/core/Center";
import { VStack } from "@astryxdesign/core/VStack";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { CampaignBanner, ContentCard, ContentGrid, ContentPageHeading, Pagination, contentStyles } from "@/components/content";
import { listServices, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "خدمات تزریق پلاستیک منتشرشده بر پایه اطلاعات فنی تأییدشده؛ جزئیات ظرفیت تنها در صورت انتشار رسمی نمایش داده می‌شود.";
export const metadata = publicCollectionMetadata("خدمات تزریق پلاستیک", description, "/injection-molding");

/*
 * Injection-service collection (OpenSpec change rebuild-ui-with-astryx,
 * task 5.3). Astryx VStack carries the page frame and Center the honest empty
 * state; the retained Toranj campaign banner keeps its approved artwork and
 * inquiry link. No capacity or pricing is shown unless the API publishes it.
 */
export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const result = await listServices(parsePageNumber((await searchParams).page));
  return (
    <main className={contentStyles.main}>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "تزریق پلاستیک" }]} />
      <VStack as="section" gap={0} className={`${contentStyles.section} content-container`}>
        <CampaignBanner src="/branding/banners/injection-services.png" alt="معرفی خدمات تزریق پلاستیک ترنج" href="/inquiry/injection" actionLabel="ثبت درخواست خدمات تزریق پلاستیک" testId="injection-campaign" />
        <ContentPageHeading eyebrow="خدمات صنعتی" title="خدمات تزریق پلاستیک" description={description} />
        {result.items.length ? (
          <>
            <ContentGrid>
              {result.items.map((service) => (
                <ContentCard key={service.id} title={service.name} summary={service.summary} href={`/injection-molding/${service.slug}`} image={service.images[0]} />
              ))}
            </ContentGrid>
            <Pagination pageInfo={result.pageInfo} basePath="/injection-molding" />
          </>
        ) : (
          <Center className={contentStyles.section}>
            <EmptyState title="خدمت منتشرشده‌ای وجود ندارد" description="اطلاعات خدمات پس از بررسی فنی و انتشار رسمی در این بخش قرار می‌گیرد." />
          </Center>
        )}
      </VStack>
    </main>
  );
}
