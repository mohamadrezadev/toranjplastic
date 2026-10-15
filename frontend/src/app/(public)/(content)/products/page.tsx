import Link from "next/link";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { CatalogLandingHero, CatalogSectionHeading, ContentCard, ContentGrid, ContentTag, Pagination, contentStyles } from "@/components/content";
import { listProducts, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "فهرست محصولات منتشرشده ترنج پلاستیک؛ جزئیات هر محصول بدون نمایش قیمت یا موجودی تأییدنشده.";
export const metadata = publicCollectionMetadata("محصولات", description, "/products");

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = parsePageNumber((await searchParams).page);
  const result = await listProducts(page);
  return <main className={contentStyles.main}>
    <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "محصولات" }]} />
    <div className={`${contentStyles.section} content-container`}>
      <CatalogLandingHero eyebrow="محصولات ترنج پلاستیک" title="محصولات را دقیق‌تر ببینید." description="محصولات منتشرشده را مرور کنید، جزئیات تأییدشده هر مورد را بخوانید و در صورت نیاز درخواست استعلام ثبت کنید." imageSrc="/branding/banners/products.png" mobileImageSrc={result.items[0]?.images[0]?.url} imageAlt="محصولات پلاستیکی ترنج در فضای آشپزخانه" imagePosition="center bottom" actions={<><Link className={contentStyles.primaryLink} href="#product-catalog">مشاهده محصولات</Link><Link className={contentStyles.secondaryLink} href="/inquiry/product">ثبت استعلام محصول</Link></>} />
      <section id="product-catalog" className={contentStyles.catalogSection}>
        <CatalogSectionHeading eyebrow="کاتالوگ منتشرشده" title="محصولات" description={description} />
        {result.items.length ? <><ContentGrid featured={result.items.length === 1}>{result.items.map((product) => <ContentCard key={product.id} title={product.name} summary={product.summary} href={`/products/${product.slug}`} image={product.images[0]} meta={<>{product.category ? <ContentTag>{product.category.name}</ContentTag> : null}{product.featured ? <ContentTag>منتخب</ContentTag> : null}</>} />)}</ContentGrid><Pagination pageInfo={result.pageInfo} basePath="/products" /></> : <div className={contentStyles.section}><EmptyState title="محصول منتشرشده‌ای وجود ندارد" description="پس از تأیید و انتشار اطلاعات محصول، فهرست این بخش نمایش داده می‌شود." /></div>}
      </section>
    </div>
  </main>;
}
