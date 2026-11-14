import type { Metadata } from "next";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { ContentTag, DetailHero, DetailInquiryCard, ImageGallery, PreservedText, Specifications, contentStyles } from "@/components/content";
import { Button } from "@/components/ui";
import { getProduct, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";
import { productJsonLd, serializeJsonLd } from "@/lib/product-jsonld";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { try { const product = await getProduct((await params).slug); return publicContentMetadata({ title: product.name, path: `/products/${product.slug}`, summary: product.summary, metaTitle: product.metaTitle, metaDescription: product.metaDescription, images: product.images }); } catch (error) { if (isNotFoundError(error)) return { title: "محصول پیدا نشد", robots: { index: false, follow: false } }; throw error; } }

/*
 * Product detail (OpenSpec change rebuild-ui-with-astryx, task 5.3).
 * The record is an Astryx VStack rendered as <article>; the hero action is the
 * shared Astryx-backed Button, matching the inquiry card action below it.
 * JSON-LD (Product, no offers), breadcrumbs and metadata are unchanged.
 */
export default async function ProductDetailPage({ params }: Props) {
  let product; try { product = await getProduct((await params).slug); } catch (error) { if (isNotFoundError(error)) notFound(); throw error; }
  const inquiryHref = `/inquiry/product?slug=${encodeURIComponent(product.slug)}`;
  return (
    <main className={contentStyles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd(product)) }} />
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "محصولات", href: "/products" }, { label: product.name }]} />
      <VStack as="article" gap={0} className={`${contentStyles.section} content-container`}>
        <DetailHero
          eyebrow="محصول منتشرشده"
          title={product.name}
          summary={product.summary}
          image={product.images[0]}
          imagePlaceholder="تصویر محصول ثبت نشده است"
          meta={product.category || product.featured ? <>
            {product.category ? <ContentTag>{product.category.name}</ContentTag> : null}
            {product.featured ? <ContentTag>محصول منتخب</ContentTag> : null}
          </> : undefined}
          action={<Button href={inquiryHref} variant="primary">ثبت استعلام محصول</Button>}
          note="ثبت استعلام به معنی تأیید قیمت یا موجودی نیست."
        />
        <VStack gap={0} className={contentStyles.detailContent}>
          <PreservedText body={product.description} />
          <Specifications items={product.specifications} />
          <ImageGallery images={product.images} />
          <DetailInquiryCard
            eyebrow="استعلام سفارش عمده و تیراژ"
            title="سفارش مستقیم و تیراژ تولید این محصول"
            description="این محصول تولید مستقیم خطوط ترنج پلاستیک است (قالب آماده). تیراژ مورد نیاز و مشخصات درخواستی را ثبت کنید تا پیش‌فاکتور رسمی و برنامه تحویل بار برای شما صادر شود."
            actionHref={inquiryHref}
            actionLabel="ثبت استعلام مستقیم این محصول"
            trustPoints={[
              "تولید با قالب اختصاصی ترنج پلاستیک (بدون نیاز به ساخت قالب)",
              "امکان سفارشی‌سازی رنگ، مستربچ و گرید متریال",
              "صدور پیش‌فاکتور رسمی ظرف ۲۴ الی ۴۸ ساعت کاری",
              "تحویل مستقیم از کارخانه با نظارت و کنترل کیفیت",
            ]}
          />
        </VStack>
      </VStack>
    </main>
  );
}
