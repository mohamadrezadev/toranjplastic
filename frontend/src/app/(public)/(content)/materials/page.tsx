import { Center } from "@astryxdesign/core/Center";
import { VStack } from "@astryxdesign/core/VStack";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { CampaignBanner, ContentCard, ContentGrid, ContentPageHeading, ContentTag, Pagination, contentStyles } from "@/components/content";
import { listMaterials, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "مواد اولیه پلیمری منتشرشده برای بررسی و استعلام؛ حضور در فهرست به معنی تضمین موجودی، قیمت یا زمان تحویل نیست.";
export const metadata = publicCollectionMetadata("مواد اولیه", description, "/materials");

/*
 * Materials collection (OpenSpec change rebuild-ui-with-astryx, task 5.3).
 * Astryx VStack carries the page frame and Center the honest empty state; the
 * retained Toranj campaign banner keeps its approved artwork and inquiry link.
 * An unavailable API is not an empty catalog: it reaches the route error
 * boundary (error.tsx) with its retry action.
 */
export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const result = await listMaterials(parsePageNumber((await searchParams).page));
  return (
    <main className={contentStyles.main}>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "مواد اولیه" }]} />
      <VStack as="section" gap={0} className={`${contentStyles.section} content-container`}>
        <CampaignBanner src="/branding/banners/materials.png" alt="معرفی تأمین مواد اولیه ترنج پلاستیک" href="/inquiry/material" actionLabel="ثبت استعلام مواد اولیه" testId="materials-campaign" />
        <ContentPageHeading eyebrow="تأمین مواد" title="مواد اولیه" description={description} />
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
      </VStack>
    </main>
  );
}
