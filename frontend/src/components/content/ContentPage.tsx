import Link from "next/link";
import type { ReactNode } from "react";
import type { PageInfo, PublicImage, PublicSpecification } from "@/lib/public-content";
import styles from "./Content.module.css";

/* eslint-disable @next/next/no-img-element -- CMS media hosts are not approved yet; native images preserve the safe normalized URL boundary. */

export function ContentPageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className={styles.heading}><span className={styles.eyebrow}>{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>;
}

export function ContentGrid({ children }: { children: ReactNode }) { return <div className={styles.grid}>{children}</div>; }

export function ContentCard({ title, summary, href, image, meta }: { title: string; summary?: string | null; href: string; image?: PublicImage | null; meta?: ReactNode }) {
  return <article className={styles.card}>
    {image ? <img className={styles.cardMedia} src={image.url} alt={image.alt} width={image.width} height={image.height} loading="lazy" /> : <div className={styles.cardPlaceholder} aria-hidden="true">تصویر ثبت نشده</div>}
    <div className={styles.cardBody}><h2>{title}</h2>{meta ? <div className={styles.meta}>{meta}</div> : null}{summary ? <p>{summary}</p> : null}<Link className={styles.cardLink} href={href}>مشاهده جزئیات</Link></div>
  </article>;
}

export function ContentTag({ children, ltr = false }: { children: ReactNode; ltr?: boolean }) {
  return <span className={styles.tag} dir={ltr ? "ltr" : undefined}>{children}</span>;
}

export function Pagination({ pageInfo, basePath }: { pageInfo: PageInfo; basePath: string }) {
  if (pageInfo.totalPages <= 1) return null;
  return <nav className={styles.pagination} aria-label="صفحه‌بندی">
    {pageInfo.page > 1 ? <Link className={styles.pageLink} href={`${basePath}?page=${pageInfo.page - 1}`} rel="prev">صفحه قبل</Link> : null}
    <span className={styles.pageStatus}>صفحه {pageInfo.page.toLocaleString("fa-IR")} از {pageInfo.totalPages.toLocaleString("fa-IR")}</span>
    {pageInfo.page < pageInfo.totalPages ? <Link className={styles.pageLink} href={`${basePath}?page=${pageInfo.page + 1}`} rel="next">صفحه بعد</Link> : null}
  </nav>;
}

export function DetailHero({ eyebrow, title, summary, image, meta, action }: { eyebrow: string; title: string; summary?: string | null; image?: PublicImage | null; meta?: ReactNode; action?: ReactNode }) {
  return <div className={styles.detailHero}><div className={styles.detailCopy}><span className={styles.eyebrow}>{eyebrow}</span><h1 className={styles.detailTitle}>{title}</h1>{meta ? <div className={styles.detailMeta}>{meta}</div> : null}{summary ? <p className={styles.summary}>{summary}</p> : null}{action}</div>{image ? <img className={styles.heroMedia} src={image.url} alt={image.alt} width={image.width} height={image.height} /> : null}</div>;
}

export function PreservedText({ title = "توضیحات", body }: { title?: string; body?: string | null }) {
  if (!body?.trim()) return null;
  return <section className={styles.contentBody}>{title ? <h2>{title}</h2> : null}{body.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</section>;
}

export function ImageGallery({ images }: { images: PublicImage[] }) {
  if (images.length <= 1) return null;
  return <section className={styles.gallery} aria-label="تصاویر محتوا">{images.slice(1).map((image) => <img key={image.url} src={image.url} alt={image.alt} width={image.width} height={image.height} loading="lazy" />)}</section>;
}

export function Specifications({ items }: { items: PublicSpecification[] }) {
  if (!items.length) return null;
  return <section className={styles.specifications}><h2>مشخصات تأییدشده</h2><dl>{items.map((item) => <div key={`${item.label}-${item.value}`} style={{ display: "contents" }}><dt>{item.label}</dt><dd dir={/^[\x00-\x7F]/.test(item.value) ? "ltr" : undefined}>{item.value}</dd></div>)}</dl></section>;
}

export const contentStyles = { main: styles.main, section: styles.section, managed: styles.managed, primaryLink: styles.primaryLink };
