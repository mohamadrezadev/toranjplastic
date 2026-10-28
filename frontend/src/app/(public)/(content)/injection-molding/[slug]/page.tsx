import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { DetailHero, DetailInquiryCard, ImageGallery, PreservedText, Specifications, contentStyles } from "@/components/content";
import { getService, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { try { const item = await getService((await params).slug); return publicContentMetadata({ title: item.name, path: `/injection-molding/${item.slug}`, summary: item.summary, metaTitle: item.metaTitle, metaDescription: item.metaDescription, images: item.images }); } catch (error) { if (isNotFoundError(error)) return { title: "خدمت پیدا نشد", robots: { index: false, follow: false } }; throw error; } }
function safeCta(href: string | null) { return href && (/^https?:\/\//.test(href) || href.startsWith("/")) ? href : null; }
export default async function ServiceDetailPage({ params }: Props) {
  let item; try { item = await getService((await params).slug); } catch (error) { if (isNotFoundError(error)) notFound(); throw error; }
  const ctaHref = safeCta(item.ctaHref);
  return <main className={contentStyles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "تزریق پلاستیک", href: "/injection-molding" }, { label: item.name }]} /><article className={`${contentStyles.section} content-container`}><DetailHero eyebrow="خدمت تزریق" title={item.name} summary={item.summary} image={item.images[0]} action={ctaHref && item.ctaLabel ? <Link className={contentStyles.primaryLink} href={ctaHref}>{item.ctaLabel}</Link> : <Link className={contentStyles.primaryLink} href={`/inquiry/injection?slug=${encodeURIComponent(item.slug)}`}>ثبت درخواست بررسی</Link>} /><div className={contentStyles.detailContent}><PreservedText body={item.description} /><Specifications items={item.specifications} /><ImageGallery images={item.images} />        <DetailInquiryCard
          eyebrow="استعلام تزریق کارمزدی (تولید با قالب شما)"
          title="نیاز به تولید قطعه با قالب اختصاصی خود دارید؟"
          description="ترنج پلاستیک با ناوگان دستگاه‌های تزریق ۸۰ تا ۴۵۰ تن در کهریزک، آماده پذیرش قالب و تولید کارمزدی قطعات شما با متریال ارسالی یا متریال تأمینی است."
          actionHref={`/inquiry/injection?slug=${encodeURIComponent(item.slug)}`}
          actionLabel="ثبت استعلام تزریق با قالب مشتری"
          trustPoints={[
            "پذیرش قالب و انجام تزریق کارمزدی (اجرت تزریق)",
            "امکان تزریق با مواد ارسالی شما یا تأمین توسط ترنج",
            "دستگاه‌های تزریق متنوع در بازه ۸۰ تا ۴۵۰ تن در کهریزک",
            "صدور پیش‌فاکتور رسمی بر اساس تیراژ و سیکل تولید",
          ]}
        /></div></article></main>;
}
