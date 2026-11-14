import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { Grid, type GridColumns } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { List, ListItem } from "@astryxdesign/core/List";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import NextLink from "next/link";
import { Children, type ReactNode } from "react";
import { Button, DirectionalData } from "@/components/ui";
import type { PageInfo, PublicImage, PublicSpecification } from "@/lib/public-content";
import styles from "./Content.module.css";

/* eslint-disable @next/next/no-img-element -- CMS media hosts are not approved yet; native images preserve the safe normalized URL boundary. */

/*
 * Shared public content presentation on public Astryx components (OpenSpec
 * change rebuild-ui-with-astryx, tasks 5.2-5.3). Astryx owns the surfaces
 * (Card), layout (Grid, VStack, HStack), type (Heading, Text), links, tags
 * (Badge), the specification list (MetadataList) and the inquiry checklist
 * (List). Content.module.css only composes the Toranj layouts around them.
 * The components stay server-renderable: only serializable props reach the
 * Astryx client components.
 */

/** Section label above a public heading: the one shared eyebrow type role. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text type="supporting" size="xsm" weight="bold" color="accent">{children}</Text>;
}

/*
 * A level-two region heading. Its type step (.sectionTitle) sits between the
 * level-one page title and the card titles below it, so the visual hierarchy
 * follows the h1 > h2 > h3 outline at every width.
 */
export function SectionTitle({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <Heading level={2} id={id} color="inherit" textWrap="balance" className={[styles.title, styles.sectionTitle, className].filter(Boolean).join(" ")}>
      {children}
    </Heading>
  );
}

export function ContentPageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <VStack as="header" gap={4} hAlign="start" className={styles.heading}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading level={1} color="inherit" textWrap="balance" className={styles.title}>{title}</Heading>
      {description ? <Text as="p" size="lg" color="secondary" className={styles.lead}>{description}</Text> : null}
    </VStack>
  );
}

export function CatalogLandingHero({ eyebrow, title, description, imageSrc, mobileImageSrc, imageAlt, imagePosition = "center", actions }: { eyebrow: string; title: string; description: string; imageSrc: string; mobileImageSrc?: string; imageAlt: string; imagePosition?: string; actions: ReactNode }) {
  return (
    <section aria-labelledby="catalog-landing-title">
      <Card padding={0} elevation="med" className={styles.landingHero}>
        <VStack gap={4} hAlign="start" vAlign="center" className={styles.landingCopy}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading level={1} id="catalog-landing-title" color="inherit" textWrap="balance" className={`${styles.title} ${styles.landingTitle}`}>{title}</Heading>
          <Text as="p" color="secondary" className={styles.landingLead}>{description}</Text>
          <HStack gap={3} wrap="wrap" vAlign="center" className={styles.landingActions}>{actions}</HStack>
        </VStack>
        {/* The artwork panel is an always-dark brand surface in both themes. */}
        <div className={styles.landingMedia} data-toranj-surface="inverse">
          <picture>
            {mobileImageSrc ? <source media="(max-width: 608px)" srcSet={mobileImageSrc} /> : null}
            <img src={imageSrc} alt={imageAlt} width={1122} height={1402} fetchPriority="high" style={{ objectPosition: imagePosition }} />
          </picture>
          {/* A decorative brand stamp: the image alt text and the h1 carry the meaning, so assistive technology skips it. */}
          <Text type="supporting" size="xsm" weight="bold" color="primary" aria-hidden="true" className={styles.landingMediaLabel}><DirectionalData>TORANJ / PRODUCT CATALOG</DirectionalData></Text>
        </div>
      </Card>
    </section>
  );
}

export function CatalogSectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className={styles.catalogHeading}>
      <VStack gap={2} hAlign="start">
        <Eyebrow>{eyebrow}</Eyebrow>
        <SectionTitle>{title}</SectionTitle>
      </VStack>
      <Text as="p" color="secondary">{description}</Text>
    </header>
  );
}

/*
 * A set of three or more cards in explicit steps: three columns above 64rem,
 * two from 40rem and one at or below 40rem, the same steps as the home
 * capability cards. In the two-column state an odd last item spans the row
 * instead of sitting beside an empty track (Content.module.css
 * .balancedGrid). Auto-fill Grid tracks cannot span only in that state, so
 * the Astryx Grid keeps its gap and semantics while the stylesheet steps its
 * column template.
 */
export function BalancedGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Grid columns={3} gap={5} className={[styles.balancedGrid, className].filter(Boolean).join(" ")} data-layout="balanced">
      {children}
    </Grid>
  );
}

type ContentGridLayout = "featured" | "single" | "pair" | "grid";

/*
 * Responsive Astryx Grid tracks for one and two cards. A 264px minimum gives
 * a pair one column on phones and a shared row from about 38rem; `max` caps
 * the column count, so two cards never leave an empty third track. Three or
 * more cards take the BalancedGrid steps (grid).
 */
const contentGridColumns: Record<Exclude<ContentGridLayout, "grid">, GridColumns> = {
  featured: 1,
  single: 1,
  pair: { minWidth: 264, max: 2 },
};

export function ContentGrid({ children, featured = false }: { children: ReactNode; featured?: boolean }) {
  const itemCount = Children.count(children);
  const layout: ContentGridLayout = featured ? "featured" : itemCount === 1 ? "single" : itemCount === 2 ? "pair" : "grid";
  if (layout === "grid") {
    return (
      <Grid columns={3} gap={5} className={`${styles.grid} ${styles.balancedGrid}`} data-layout={layout}>
        {children}
      </Grid>
    );
  }
  return (
    <Grid
      columns={contentGridColumns[layout]}
      gap={5}
      maxWidth={layout === "single" ? "42rem" : undefined}
      className={layout === "featured" ? `${styles.grid} ${styles.gridFeatured}` : styles.grid}
      data-layout={layout}
    >
      {children}
    </Grid>
  );
}

/*
 * `titleLevel` sets only the outline rank: a caller that already gives the
 * collection its own level-two heading passes 3. The title keeps one visual
 * size at either rank (cardTitle), so the card reads the same everywhere.
 */
export function ContentCard({ title, summary, href, image, meta, titleLevel = 2 }: { title: string; summary?: string | null; href: string; image?: PublicImage | null; meta?: ReactNode; titleLevel?: 2 | 3 }) {
  return (
    <Card role="article" padding={0} elevation="low" className={styles.card}>
      {/* A pointer shortcut only: the title and the detail action are the named links. */}
      <NextLink className={styles.cardMediaLink} href={href} tabIndex={-1} aria-hidden="true">
        {image ? <img className={styles.cardMedia} src={image.url} alt="" width={image.width} height={image.height} loading="lazy" decoding="async" /> : <Text className={styles.cardPlaceholder}>تصویر ثبت نشده</Text>}
      </NextLink>
      <VStack gap={3} hAlign="start" className={styles.cardBody}>
        {meta ? <HStack gap={2} wrap="wrap" vAlign="center" className={styles.meta}>{meta}</HStack> : null}
        <Heading level={titleLevel} color="inherit" className={`${styles.title} ${styles.cardTitle}`}><Link href={href} color="inherit" type="inherit">{title}</Link></Heading>
        {summary ? <Text as="p" color="secondary" maxLines={3} hasTruncateTooltip={false}>{summary}</Text> : null}
        <Link href={href} weight="bold" className={styles.cardLink}>مشاهده جزئیات <span aria-hidden="true">←</span></Link>
      </VStack>
    </Card>
  );
}

/*
 * A read-only category or state tag (Astryx Badge). Long CMS values wrap
 * onto more lines instead of ending in an ellipsis (.tag), so the whole value
 * stays visible. Dates and links are not tags: ArticleMeta renders those.
 */
export function ContentTag({ children, ltr = false }: { children: ReactNode; ltr?: boolean }) {
  return <Badge label={ltr ? <DirectionalData>{children}</DirectionalData> : children} className={styles.tag} />;
}

const persianNumber = (value: number) => value.toLocaleString("fa-IR");

/*
 * Astryx Pagination renders client-side buttons driven by an onChange
 * callback. Collection pages are server-rendered and must stay crawlable, so
 * this is a link-based composition with the same compact Astryx anatomy:
 * previous and next actions around a "page X of Y" readout.
 */
export function Pagination({ pageInfo, basePath }: { pageInfo: PageInfo; basePath: string }) {
  if (pageInfo.totalPages <= 1) return null;
  return (
    <HStack as="nav" aria-label="صفحه‌بندی" gap={3} justify="center" align="center" wrap="wrap" className={styles.pagination}>
      {pageInfo.page > 1 ? <Button variant="secondary" href={`${basePath}?page=${pageInfo.page - 1}`} rel="prev">صفحه قبل</Button> : null}
      <Text size="sm" color="secondary">صفحه {persianNumber(pageInfo.page)} از {persianNumber(pageInfo.totalPages)}</Text>
      {pageInfo.page < pageInfo.totalPages ? <Button variant="secondary" href={`${basePath}?page=${pageInfo.page + 1}`} rel="next">صفحه بعد</Button> : null}
    </HStack>
  );
}

/*
 * The media panel appears only for a published image, or for a placeholder
 * the caller names (`imagePlaceholder`). Without either, the copy takes the
 * whole card, as ManagedPage does with ContentPageHeading, instead of leaving
 * an empty frame. `data-media` exposes the variant to browser tests.
 */
export function DetailHero({ eyebrow, title, summary, image, imagePlaceholder, meta, action, note }: { eyebrow: string; title: string; summary?: string | null; image?: PublicImage | null; imagePlaceholder?: string; meta?: ReactNode; action?: ReactNode; note?: string }) {
  const media = image ? "image" : imagePlaceholder ? "placeholder" : "none";
  return (
    <Card padding={0} elevation="med" className={media === "none" ? `${styles.detailHero} ${styles.detailHeroTextOnly}` : styles.detailHero} data-media={media}>
      {media === "none" ? null : (
        <div className={styles.detailMedia}>
          {image ? <img className={styles.heroMedia} src={image.url} alt={image.alt} width={image.width} height={image.height} fetchPriority="high" /> : <Text color="secondary" className={styles.detailPlaceholder}>{imagePlaceholder}</Text>}
        </div>
      )}
      <VStack gap={4} hAlign="start" vAlign="center" className={styles.detailCopy}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading level={1} color="inherit" textWrap="balance" className={styles.title}>{title}</Heading>
        {meta ? <HStack gap={2} wrap="wrap" vAlign="center">{meta}</HStack> : null}
        {summary ? <Text as="p" size="lg" color="secondary" className={styles.lead}>{summary}</Text> : null}
        {action}
        {note ? <Text type="supporting" className={styles.detailNote}>{note}</Text> : null}
      </VStack>
    </Card>
  );
}

export function PreservedText({ title = "توضیحات", body }: { title?: string; body?: string | null }) {
  if (!body?.trim()) return null;
  return (
    <VStack as="section" gap={4} className={styles.contentBody}>
      {title ? <Heading level={2} color="inherit" className={styles.title}>{title}</Heading> : null}
      {body.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <Text as="p" key={`${index}-${paragraph.slice(0, 20)}`} className={styles.preserved}>{paragraph}</Text>)}
    </VStack>
  );
}

export function ImageGallery({ images }: { images: PublicImage[] }) {
  if (images.length <= 1) return null;
  return (
    <section className={styles.gallery} aria-label="تصاویر محتوا">
      <Grid columns={{ minWidth: 240, max: 2 }} gap={4} className={styles.galleryGrid}>
        {images.slice(1).map((image) => <img key={image.url} className={styles.galleryImage} src={image.url} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />)}
      </Grid>
    </section>
  );
}

/** Values that start with an ASCII character (codes, grades, sizes) keep a local LTR run. */
const isLtrValue = (value: string) => /^[\x00-\x7F]/.test(value);

/*
 * The approved engineered spec sheet: a framed panel with a header band,
 * ruled rows, shaded label cells and alternating row fills, drawn by
 * Content.module.css on the <dl>/<dt>/<dd> that Astryx MetadataList renders
 * (.specSheet). LTR values (codes, grades, units) use the monospaced code
 * face in their isolated LTR run.
 */
export function Specifications({ items }: { items: PublicSpecification[] }) {
  if (!items.length) return null;
  return (
    <VStack as="section" gap={0} className={styles.specifications}>
      <Heading level={2} color="inherit" className={`${styles.title} ${styles.specificationsTitle}`}>مشخصات تأییدشده</Heading>
      <MetadataList label={{ position: "start", width: "minmax(7rem, 40%)" }} className={styles.specSheet}>
        {items.map((item) => (
          <MetadataListItem key={`${item.label}-${item.value}`} label={item.label}>
            {isLtrValue(item.value) ? <DirectionalData className={styles.specValue}>{item.value}</DirectionalData> : item.value}
          </MetadataListItem>
        ))}
      </MetadataList>
    </VStack>
  );
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
    <section className={styles.inquirySection} aria-labelledby="inquiry-fast-track-title">
      <Card elevation="low" className={styles.inquiryCard}>
        <VStack gap={5}>
          <VStack gap={2} hAlign="start">
            <Eyebrow>{eyebrow}</Eyebrow>
            <Heading level={2} id="inquiry-fast-track-title" color="inherit" className={styles.title}>{title}</Heading>
            <Text as="p" color="secondary" className={styles.inquiryLead}>{description}</Text>
          </VStack>
          {/* Reassurance rows, not nested cards: one List inside the single Card. */}
          <List listStyle="disc" density="compact" edge="flush">
            {trustPoints.map((point) => <ListItem key={point} align="first-line" label={<Text>{point}</Text>} />)}
          </List>
          <HStack gap={3} wrap="wrap">
            <Button href={actionHref} variant="primary" wrapLabel className={styles.inquiryAction}>{actionLabel}</Button>
          </HStack>
        </VStack>
      </Card>
    </section>
  );
}

/* Route frames the page files compose. Actions use the shared Button adapter. */
export const contentStyles = {
  main: styles.main,
  section: styles.section,
  managed: styles.managed,
  catalogSection: styles.catalogSection,
  detailContent: styles.detailContent,
};
