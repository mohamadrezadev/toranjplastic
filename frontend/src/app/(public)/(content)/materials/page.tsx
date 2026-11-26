import { Center } from "@astryxdesign/core/Center";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { VStack } from "@astryxdesign/core/VStack";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { CatalogLandingHero, CatalogSectionHeading, ContentCard, ContentGrid, ContentTag, Pagination, contentStyles } from "@/components/content";
import { Button } from "@/components/ui";
import { listMaterials, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "مواد اولیه پلیمری منتشرشده برای بررسی و استعلام؛ حضور در فهرست به معنی تضمین موجودی، قیمت یا زمان تحویل نیست.";
export const metadata = publicCollectionMetadata("مواد اولیه", description, "/materials");

/*
 * Materials collection (OpenSpec change rebuild-ui-with-astryx, task 5.3).
 * Astryx VStack carries the page frame and Center the honest empty state. The
 * landing is the same structured hero as /products (owner decision OD-2): the
 * approved artwork, an in-page action to the catalog (a native anchor, see
 * /products) and the existing inquiry route, without a decorative stamp.
 * An unavailable API is not an empty catalog: it reaches the route error
 * boundary (error.tsx) with its retry action.
 */
export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const result = await listMaterials(parsePageNumber((await searchParams).page));
  return (
    <main className={contentStyles.main}>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "مواد اولیه" }]} />
      <VStack as="section" gap={0} className={`${contentStyles.section} content-container`}>
        <CatalogLandingHero
          eyebrow="تأمین مواد"
          title="مواد اولیه"
          description="مواد اولیه پلیمری منتشرشده را مرور کنید، مشخصات تأییدشده هر مورد را بخوانید و در صورت نیاز درخواست استعلام ثبت کنید."
          imageSrc="/branding/banners/materials.png"
          mobileImageSrc={result.items[0]?.images[0]?.url}
          imageAlt="معرفی تأمین مواد اولیه ترنج پلاستیک"
          stamp={null}
          actions={<>
            <LinkProvider component="a">
              <Button href="#material-catalog" variant="primary">مشاهده مواد اولیه</Button>
            </LinkProvider>
            <Button href="/inquiry/material" variant="secondary">ثبت استعلام مواد اولیه</Button>
          </>}
        />
        <Section id="material-catalog" tabIndex={-1} variant="transparent" padding={0} className={contentStyles.catalogSection}>
          <CatalogSectionHeading eyebrow="کاتالوگ منتشرشده" title="مواد اولیه" description={description} />
        {result.items.length ? (
          <>
            <ContentGrid>
              {result.items.map((item) => (
                <ContentCard
                  key={item.id}
                  title={item.name}
                  summary={item.summary}
                  href={`/materials/${item.slug}`}
                  image={item.images[0]}
                  titleLevel={3}
                  // Grades are LTR codes; tags render only when the API supplies them.
                  meta={item.family || item.grade ? <>
                    {item.family ? <ContentTag>{item.family}</ContentTag> : null}
                    {item.grade ? <ContentTag ltr>{item.grade}</ContentTag> : null}
                  </> : undefined}
                />
              ))}
            </ContentGrid>
            <Pagination pageInfo={result.pageInfo} basePath="/materials" />
          </>
        ) : (
          <Center className={contentStyles.section}>
            <EmptyState title="ماده منتشرشده‌ای وجود ندارد" description="فهرست مواد پس از تأیید اطلاعات و انتشار رسمی در این بخش نمایش داده می‌شود." />
          </Center>
        )}
        </Section>
      </VStack>
    </main>
  );
}
