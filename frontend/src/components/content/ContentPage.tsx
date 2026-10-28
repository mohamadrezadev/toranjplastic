import Link from "next/link";
import type { ReactNode } from "react";
import type { PageInfo, PublicImage, PublicSpecification } from "@/lib/public-content";
import styles from "./Content.module.css";

/* eslint-disable @next/next/no-img-element -- CMS media hosts are not approved yet; native images preserve the safe normalized URL boundary. */

export function ContentPageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className={styles.heading}><span className={styles.eyebrow}>{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>;
}

export function CatalogLandingHero({ eyebrow, title, description, imageSrc, mobileImageSrc, imageAlt, imagePosition = "center", actions }: { eyebrow: string; title: string; description: string; imageSrc: string; mobileImageSrc?: string; imageAlt: string; imagePosition?: string; actions: ReactNode }) {
  return <section className={styles.landingHero} aria-labelledby="catalog-landing-title">
    <div className={styles.landingCopy}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h1 id="catalog-landing-title">{title}</h1>
      <p>{description}</p>
      <div className={styles.landingActions}>{actions}</div>
    </div>
    <div className={styles.landingMedia}>
      <picture>
        {mobileImageSrc ? <source media="(max-width: 608px)" srcSet={mobileImageSrc} /> : null}
        <img src={imageSrc} alt={imageAlt} width={1122} height={1402} fetchPriority="high" style={{ objectPosition: imagePosition }} />
      </picture>
      <span className={styles.landingMediaLabel}>TORANJ / PRODUCT CATALOG</span>
    </div>
  </section>;
}

export function CatalogSectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className={styles.catalogHeading}><div><span className={styles.eyebrow}>{eyebrow}</span><h2>{title}</h2></div><p>{description}</p></header>;
}

export function ContentGrid({ children, featured = false }: { children: ReactNode; featured?: boolean }) {
  return <div className={`${styles.grid} ${featured ? styles.gridFeatured : ""}`} data-layout={featured ? "featured" : "grid"}>{children}</div>;
}

export function ContentCard({ title, summary, href, image, meta }: { title: string; summary?: string | null; href: string; image?: PublicImage | null; meta?: ReactNode }) {
  return <article className={styles.card}>
    <Link className={styles.cardMediaLink} href={href} tabIndex={-1} aria-hidden="true">
      {image ? <img className={styles.cardMedia} src={image.url} alt="" width={image.width} height={image.height} loading="lazy" /> : <span className={styles.cardPlaceholder}>تصویر ثبت نشده</span>}
    </Link>
    <div className={styles.cardBody}>{meta ? <div className={styles.meta}>{meta}</div> : null}<h2><Link href={href}>{title}</Link></h2>{summary ? <p>{summary}</p> : null}<Link className={styles.cardLink} href={href}>مشاهده جزئیات <span aria-hidden="true">←</span></Link></div>
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

export function DetailHero({ eyebrow, title, summary, image, meta, action, note }: { eyebrow: string; title: string; summary?: string | null; image?: PublicImage | null; meta?: ReactNode; action?: ReactNode; note?: string }) {
  return <div className={styles.detailHero}>
    <div className={styles.detailMedia}>{image ? <img className={styles.heroMedia} src={image.url} alt={image.alt} width={image.width} height={image.height} /> : <div className={styles.detailPlaceholder}>تصویر محصول ثبت نشده است</div>}</div>
    <div className={styles.detailCopy}><span className={styles.eyebrow}>{eyebrow}</span><h1 className={styles.detailTitle}>{title}</h1>{meta ? <div className={styles.detailMeta}>{meta}</div> : null}{summary ? <p className={styles.summary}>{summary}</p> : null}{action}{note ? <span className={styles.detailNote}>{note}</span> : null}</div>
  </div>;
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

export function DetailInquiryCard({
  eyebrow = "استعلام سفارش عمده و تیراژ",
  title = "سفارش مستقیم و تیراژ تولید این محصول",
  description = "این محصول تولید مستقیم خطوط ترنج پلاستیک است (قالب آماده). تیراژ مورد نیاز و مشخصات درخواستی را ثبت کنید تا پیش‌فاکتور رسمی و برنامه تحویل بار برای شما صادر شود.",
  actionHref,
  actionLabel = "ثبت استعلام مستقیم",
  trustPoints = [
    "تولید با قالب اختصاصی ترنج پلاستیک (بدون نیاز به ساخت قالب)",
    "امکان سفارشی‌سازی رنگ، مستربچ و گرید متریال",
    "صدور پیش‌فاکتور رسمی ظرف ۲۴ الی ۴۸ ساعت کاری",
    "تحویل مستقیم از کارخانه با نظارت و کنترل کیفیت",
  ],
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  actionHref: string;
  actionLabel?: string;
  trustPoints?: string[];
}) {
  return (
    <section className={styles.detailInquiryCard} aria-labelledby="inquiry-fast-track-title">
      <div className={styles.inquiryCardHeader}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 id="inquiry-fast-track-title">{title}</h2>
        <p>{description}</p>
      </div>
      <div className={styles.inquiryTrustGrid}>
        {trustPoints.map((point) => (
          <div key={point} className={styles.inquiryTrustItem}>
            <span className={styles.inquiryTrustDot} aria-hidden="true" />
            <span>{point}</span>
          </div>
        ))}
      </div>
      <div className={styles.inquiryActionRow}>
        <Link className={styles.primaryLink} href={actionHref}>
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}

export const contentStyles = {
  main: styles.main,
  section: styles.section,
  managed: styles.managed,
  primaryLink: styles.primaryLink,
  secondaryLink: styles.secondaryLink,
  catalogSection: styles.catalogSection,
  detailContent: styles.detailContent,
  institutionalSection: styles.institutionalSection,
  institutionalGrid: styles.institutionalGrid,
  institutionalCard: styles.institutionalCard,
  contactChannelValue: styles.contactChannelValue,
  contactMetaGrid: styles.contactMetaGrid,
  contactMetaCard: styles.contactMetaCard,
};
