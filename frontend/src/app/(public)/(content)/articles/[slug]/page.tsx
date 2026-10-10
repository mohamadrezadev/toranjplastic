import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { ContentTag, DetailHero, PreservedText, contentStyles } from "@/components/content";
import { getArticle, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";

type Props = { params: Promise<{ slug: string }> };
const formatDate = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
export async function generateMetadata({ params }: Props): Promise<Metadata> { try { const item = await getArticle((await params).slug); return publicContentMetadata({ title: item.title, summary: item.summary, metaTitle: item.metaTitle, metaDescription: item.metaDescription }); } catch (error) { if (isNotFoundError(error)) return { title: "مقاله پیدا نشد", robots: { index: false, follow: false } }; throw error; } }
export default async function ArticleDetailPage({ params }: Props) {
  let item; try { item = await getArticle((await params).slug); } catch (error) { if (isNotFoundError(error)) notFound(); throw error; }
  return <main className={contentStyles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "مقالات", href: "/articles" }, { label: item.title }]} /><article className={`${contentStyles.section} content-container ${contentStyles.managed}`}><DetailHero eyebrow="مقاله" title={item.title} summary={item.summary} image={item.featuredImage} meta={<ContentTag>{formatDate(item.publishedAt)}</ContentTag>} /><PreservedText title="متن مقاله" body={item.body} /></article></main>;
}
