import { Center } from "@astryxdesign/core/Center";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { VStack } from "@astryxdesign/core/VStack";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { CatalogLandingHero, CatalogSectionHeading, ContentCard, ContentGrid, Pagination, contentStyles } from "@/components/content";
import { Button } from "@/components/ui";
import { listServices, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "خدمات تزریق پلاستیک منتشرشده بر پایه اطلاعات فنی تأییدشده؛ جزئیات ظرفیت تنها در صورت انتشار رسمی نمایش داده می‌شود.";
export const metadata = publicCollectionMetadata("خدمات تزریق پلاستیک", description, "/injection-molding");

/*
 * Injection-service collection (OpenSpec change rebuild-ui-with-astryx,
 * task 5.3). Astryx VStack carries the page frame and Center the honest empty
 * state. The landing is the same structured hero as /products (owner decision
 * OD-2): the approved artwork, an in-page action to the catalog (a native
 * anchor, see /products) and the existing inquiry route, without a decorative
 * stamp. No capacity or pricing is shown unless the API publishes it.
 */
export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const result = await listServices(parsePageNumber((await searchParams).page));
  return (
    <main className={contentStyles.main}>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "تزریق پلاستیک" }]} />
      <VStack as="section" gap={0} className={`${contentStyles.section} content-container`}>
        <CatalogLandingHero
          eyebrow="خدمات صنعتی"
          title="خدمات تزریق پلاستیک"
          description="خدمات تزریق پلاستیک منتشرشده را مرور کنید، جزئیات فنی تأییدشده هر مورد را بخوانید و در صورت نیاز درخواست بررسی ثبت کنید."
          imageSrc="/branding/banners/injection-services.png"
          mobileImageSrc={result.items[0]?.images[0]?.url}
          imageAlt="معرفی خدمات تزریق پلاستیک ترنج"
          stamp={null}
          actions={<>
            <LinkProvider component="a">
              <Button href="#service-catalog" variant="primary">مشاهده خدمات</Button>
            </LinkProvider>
            <Button href="/inquiry/injection" variant="secondary">ثبت درخواست خدمات تزریق پلاستیک</Button>
          </>}
        />
        <Section id="service-catalog" tabIndex={-1} variant="transparent" padding={0} className={contentStyles.catalogSection}>
          <CatalogSectionHeading eyebrow="کاتالوگ منتشرشده" title="خدمات تزریق پلاستیک" description={description} />
        {result.items.length ? (
          <>
            <ContentGrid>
              {result.items.map((service) => (
                <ContentCard key={service.id} title={service.name} summary={service.summary} href={`/injection-molding/${service.slug}`} image={service.images[0]} titleLevel={3} />
              ))}
            </ContentGrid>
            <Pagination pageInfo={result.pageInfo} basePath="/injection-molding" />
          </>
        ) : (
          <Center className={contentStyles.section}>
            <EmptyState title="خدمت منتشرشده‌ای وجود ندارد" description="اطلاعات خدمات پس از بررسی فنی و انتشار رسمی در این بخش قرار می‌گیرد." />
          </Center>
        )}
        </Section>
      </VStack>
    </main>
  );
}
