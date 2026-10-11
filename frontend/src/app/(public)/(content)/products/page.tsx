import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { ContentCard, ContentGrid, ContentPageHeading, ContentTag, Pagination, contentStyles } from "@/components/content";
import { listProducts, parsePageNumber } from "@/lib/public-content";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "فهرست محصولات منتشرشده ترنج پلاستیک؛ جزئیات هر محصول بدون نمایش قیمت یا موجودی تأییدنشده.";
export const metadata = publicCollectionMetadata("محصولات", description, "/products");

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = parsePageNumber((await searchParams).page);
  const result = await listProducts(page);
  return <main className={contentStyles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "محصولات" }]} /><section className={`${contentStyles.section} content-container`}><ContentPageHeading eyebrow="کاتالوگ محصولات" title="محصولات" description={description} />{result.items.length ? <><ContentGrid>{result.items.map((product) => <ContentCard key={product.id} title={product.name} summary={product.summary} href={`/products/${product.slug}`} image={product.images[0]} meta={<>{product.category ? <ContentTag>{product.category.name}</ContentTag> : null}{product.featured ? <ContentTag>منتخب</ContentTag> : null}</>} />)}</ContentGrid><Pagination pageInfo={result.pageInfo} basePath="/products" /></> : <div className={contentStyles.section}><EmptyState title="محصول منتشرشده‌ای وجود ندارد" description="پس از تأیید و انتشار اطلاعات محصول، فهرست این بخش نمایش داده می‌شود." /></div>}</section></main>;
}
