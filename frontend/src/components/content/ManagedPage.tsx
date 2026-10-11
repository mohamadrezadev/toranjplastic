import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { getManagedPage, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";
import { DetailHero, ImageGallery, PreservedText, contentStyles } from "./ContentPage";

export async function managedPageMetadata(slug: string, fallbackTitle: string): Promise<Metadata> {
  try {
    const page = await getManagedPage(slug);
    return publicContentMetadata({ title: page.title, path: `/${slug}`, summary: page.summary, metaTitle: page.metaTitle, metaDescription: page.metaDescription, images: page.images });
  } catch (error) {
    if (isNotFoundError(error)) return { title: `${fallbackTitle} | ترنج پلاستیک`, robots: { index: false, follow: false } };
    throw error;
  }
}

export async function ManagedPage({ slug }: { slug: string; fallbackTitle: string }) {
  let page;
  try { page = await getManagedPage(slug); } catch (error) { if (isNotFoundError(error)) notFound(); throw error; }
  return <main className={contentStyles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: page.title }]} /><div className={`${contentStyles.section} content-container ${contentStyles.managed}`}><DetailHero eyebrow="صفحه عمومی" title={page.title} summary={page.summary} image={page.images[0]} /><PreservedText title="" body={page.body} /><ImageGallery images={page.images} /></div></main>;
}
