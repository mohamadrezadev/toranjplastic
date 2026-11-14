import { Center } from "@astryxdesign/core/Center";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { VStack } from "@astryxdesign/core/VStack";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { CatalogLandingHero, CatalogSectionHeading, ContentCard, ContentGrid, ContentTag, Pagination, contentStyles } from "@/components/content";
import { Button } from "@/components/ui";
import { listProducts, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "فهرست محصولات منتشرشده ترنج پلاستیک؛ جزئیات هر محصول بدون نمایش قیمت یا موجودی تأییدنشده.";
export const metadata = publicCollectionMetadata("محصولات", description, "/products");

/*
 * Products collection (OpenSpec change rebuild-ui-with-astryx, task 5.3).
 * Astryx VStack carries the page frame, Section the catalog region and Center
 * the honest empty state; the landing actions use the shared Astryx-backed
 * Button. The page stays a Server Component: only strings cross into the
 * client Button, and the native <main> landmark and Toranj frame classes
 * (contentStyles) keep the public-shell rhythm shared with sibling routes.
 *
 * The in-page catalog action is a native anchor (a nested LinkProvider with
 * the plain "a" element): Next.js Link turns a fragment into a scroll that
 * leaves keyboard focus on the action, while the browser's own fragment
 * navigation moves focus to the catalog target (tabIndex -1), so the next Tab
 * continues inside the catalog. Catalog card titles are level three under the
 * catalog's own level-two heading.
 */
export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = parsePageNumber((await searchParams).page);
  const result = await listProducts(page);
  return (
    <main className={contentStyles.main}>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "محصولات" }]} />
      <VStack gap={0} className={`${contentStyles.section} content-container`}>
        <CatalogLandingHero
          eyebrow="محصولات ترنج پلاستیک"
          title="محصولات را دقیق‌تر ببینید."
          description="محصولات منتشرشده را مرور کنید، جزئیات تأییدشده هر مورد را بخوانید و در صورت نیاز درخواست استعلام ثبت کنید."
          imageSrc="/branding/banners/products.png"
          mobileImageSrc={result.items[0]?.images[0]?.url}
          imageAlt="محصولات پلاستیکی ترنج در فضای آشپزخانه"
          imagePosition="center bottom"
          actions={<>
            <LinkProvider component="a">
              <Button href="#product-catalog" variant="primary">مشاهده محصولات</Button>
            </LinkProvider>
            <Button href="/inquiry/product" variant="secondary">ثبت استعلام محصول</Button>
          </>}
        />
        <Section id="product-catalog" tabIndex={-1} variant="transparent" padding={0} className={contentStyles.catalogSection}>
          <CatalogSectionHeading eyebrow="کاتالوگ منتشرشده" title="محصولات" description={description} />
          {result.items.length ? (
            <>
              <ContentGrid featured={result.items.length === 1}>
                {result.items.map((product) => (
                  <ContentCard
                    key={product.id}
                    title={product.name}
                    summary={product.summary}
                    href={`/products/${product.slug}`}
                    image={product.images[0]}
                    titleLevel={3}
                    // Tags only when the API supplies them: an empty meta row would leave a gap in the card.
                    meta={product.category || product.featured ? <>
                      {product.category ? <ContentTag>{product.category.name}</ContentTag> : null}
                      {product.featured ? <ContentTag>منتخب</ContentTag> : null}
                    </> : undefined}
                  />
                ))}
              </ContentGrid>
              <Pagination pageInfo={result.pageInfo} basePath="/products" />
            </>
          ) : (
            <Center className={contentStyles.section}>
              <EmptyState title="محصول منتشرشده‌ای وجود ندارد" description="پس از تأیید و انتشار اطلاعات محصول، فهرست این بخش نمایش داده می‌شود." />
            </Center>
          )}
        </Section>
      </VStack>
    </main>
  );
}
