import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { ContentTag, DetailHero, DetailInquiryCard, ImageGallery, PreservedText, Specifications, contentStyles } from "@/components/content";
import { getMaterial, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { try { const item = await getMaterial((await params).slug); return publicContentMetadata({ title: item.name, path: `/materials/${item.slug}`, summary: item.summary, metaTitle: item.metaTitle, metaDescription: item.metaDescription, images: item.images }); } catch (error) { if (isNotFoundError(error)) return { title: "ماده پیدا نشد", robots: { index: false, follow: false } }; throw error; } }
export default async function MaterialDetailPage({ params }: Props) {
  let item; try { item = await getMaterial((await params).slug); } catch (error) { if (isNotFoundError(error)) notFound(); throw error; }
  return <main className={contentStyles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "مواد اولیه", href: "/materials" }, { label: item.name }]} /><article className={`${contentStyles.section} content-container`}><DetailHero eyebrow="ماده اولیه" title={item.name} summary={item.summary} image={item.images[0]} meta={<>{item.family ? <ContentTag>{item.family}</ContentTag> : null}{item.grade ? <ContentTag ltr>{item.grade}</ContentTag> : null}{item.manufacturer ? <ContentTag>{item.manufacturer}</ContentTag> : null}</>} action={item.inquiryAvailable ? <Link className={contentStyles.primaryLink} href={`/inquiry/material?slug=${encodeURIComponent(item.slug)}`}>ثبت استعلام ماده</Link> : undefined} /><div className={contentStyles.detailContent}><PreservedText body={item.description} /><Specifications items={item.specifications} /><ImageGallery images={item.images} /><DetailInquiryCard eyebrow="تأمین رسمی پلیمر" title="نیاز به تأمین تناژ یا فرمولاسیون این گرید دارید؟" description="ترنج پلاستیک انواع گریدهای مهندسی و تجاری پلیمر را همراه با برگه آنالیز معتبر (CoA) تأمین کرده و پیش‌فاکتور رسمی صادر می‌نماید." actionHref={`/inquiry/material?slug=${encodeURIComponent(item.slug)}`} actionLabel="ثبت استعلام مستقیم این ماده" trustPoints={["ارائه برگه فنی و دیتاشیت مهندسی معتبر", "تضمین یکنواختی MFI و شاخص‌های فیزیکی", "صدور پیش‌فاکتور رسمی متناسب با تناژ درخواستی"]} /></div></article></main>;
}
