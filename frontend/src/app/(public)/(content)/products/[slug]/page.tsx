import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { ContentTag, DetailHero, ImageGallery, PreservedText, Specifications, contentStyles } from "@/components/content";
import { getProduct, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";
import { productJsonLd, serializeJsonLd } from "@/lib/product-jsonld";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { try { const product = await getProduct((await params).slug); return publicContentMetadata({ title: product.name, path: `/products/${product.slug}`, summary: product.summary, metaTitle: product.metaTitle, metaDescription: product.metaDescription, images: product.images }); } catch (error) { if (isNotFoundError(error)) return { title: "محصول پیدا نشد", robots: { index: false, follow: false } }; throw error; } }

export default async function ProductDetailPage({ params }: Props) {
  let product; try { product = await getProduct((await params).slug); } catch (error) { if (isNotFoundError(error)) notFound(); throw error; }
  return <main className={contentStyles.main}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd(product)) }} /><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "محصولات", href: "/products" }, { label: product.name }]} /><article className={`${contentStyles.section} content-container`}><DetailHero eyebrow="محصول" title={product.name} summary={product.summary} image={product.images[0]} meta={<>{product.category ? <ContentTag>{product.category.name}</ContentTag> : null}{product.featured ? <ContentTag>محصول منتخب</ContentTag> : null}</>} action={<Link className={contentStyles.primaryLink} href="/inquiry">ثبت استعلام</Link>} /><PreservedText body={product.description} /><ImageGallery images={product.images} /><Specifications items={product.specifications} /></article></main>;
}
