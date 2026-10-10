import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { getPublicRouteBySlug, publicRoutes } from "@/design-system/routes";
import styles from "../shell-page.module.css";

export function generateStaticParams() { return publicRoutes.filter((route) => route.slug).map((route) => ({ slug: route.slug })); }

type PreparingPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PreparingPageProps): Promise<Metadata> {
  const route = getPublicRouteBySlug((await params).slug);
  return { title: route ? `${route.label} | ترنج پلاستیک` : "صفحه پیدا نشد", robots: { index: false, follow: false } };
}

export default async function PreparingPage({ params }: PreparingPageProps) {
  const route = getPublicRouteBySlug((await params).slug);
  if (!route) notFound();
  return <main className={styles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: route.label }]} /><div className={`${styles.shell} content-container`}><EmptyState title={`${route.label} در حال آماده‌سازی است`} description="این بخش پس از تأیید محتوای رسمی و اطلاعات معتبر منتشر می‌شود." /></div></main>;
}
