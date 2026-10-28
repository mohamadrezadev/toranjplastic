import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { ContentTag, DetailHero, DetailInquiryCard, ImageGallery, PreservedText, Specifications, contentStyles } from "@/components/content";
import { getProduct, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";
import { productJsonLd, serializeJsonLd } from "@/lib/product-jsonld";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { try { const product = await getProduct((await params).slug); return publicContentMetadata({ title: product.name, path: `/products/${product.slug}`, summary: product.summary, metaTitle: product.metaTitle, metaDescription: product.metaDescription, images: product.images }); } catch (error) { if (isNotFoundError(error)) return { title: "محصول پیدا نشد", robots: { index: false, follow: false } }; throw error; } }

export default async function ProductDetailPage({ params }: Props) {
  let product; try { product = await getProduct((await params).slug); } catch (error) { if (isNotFoundError(error)) notFound(); throw error; }
  return <main className={contentStyles.main}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd(product)) }} /><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "محصولات", href: "/products" }, { label: product.name }]} /><article className={`${contentStyles.section} content-container`}><DetailHero eyebrow="محصول منتشرشده" title={product.name} summary={product.summary} image={product.images[0]} meta={<>{product.category ? <ContentTag>{product.category.name}</ContentTag> : null}{product.featured ? <ContentTag>محصول منتخب</ContentTag> : null}</>} action={<Link className={contentStyles.primaryLink} href={`/inquiry/product?slug=${encodeURIComponent(product.slug)}`}>ثبت استعلام محصول</Link>} note="ثبت استعلام به معنی تأیید قیمت یا موجودی نیست." /><div className={contentStyles.detailContent}><PreservedText body={product.description} /><Specifications items={product.specifications} /><ImageGallery images={product.images} />        <DetailInquiryCard
          eyebrow="استعلام سفارش عمده و تیراژ"
          title="سفارش مستقیم و تیراژ تولید این محصول"
          description="این محصول تولید مستقیم خطوط ترنج پلاستیک است (قالب آماده). تیراژ مورد نیاز و مشخصات درخواستی را ثبت کنید تا پیش‌فاکتور رسمی و برنامه تحویل بار برای شما صادر شود."
          actionHref={`/inquiry/product?slug=${encodeURIComponent(product.slug)}`}
          actionLabel="ثبت استعلام مستقیم این محصول"
          trustPoints={[
            "تولید با قالب اختصاصی ترنج پلاستیک (بدون نیاز به ساخت قالب)",
            "امکان سفارشی‌سازی رنگ، مستربچ و گرید متریال",
            "صدور پیش‌فاکتور رسمی ظرف ۲۴ الی ۴۸ ساعت کاری",
            "تحویل مستقیم از کارخانه با نظارت و کنترل کیفیت",
          ]}
        /></div></article></main>;
}
