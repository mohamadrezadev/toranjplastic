import { Suspense } from "react";
import NextLink from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { publicContentMetadata } from "@/lib/content-metadata";
import { organizationJsonLd, serializeJsonLd } from "@/lib/jsonld";
import { siteOrigin } from "@/lib/site";
import { listStrapiArticles, type StrapiArticle } from "@/lib/strapi";
import { ArticleMeta, ContentCard, ContentGrid, Eyebrow, SectionTitle } from "@/components/content";
import { Button } from "@/components/ui";
import styles from "./page.module.css";

/*
 * Public home composition on public Astryx components (OpenSpec change
 * rebuild-ui-with-astryx, task 5.2). Astryx owns the page regions (Section),
 * the campaign and capability surfaces (Card), the bounded media frames
 * (AspectRatio), layout (VStack, HStack), type (Heading, Text) and links;
 * actions use the shared Button adapter, and the eyebrows, region headings
 * and article teasers come from the shared content layer. page.module.css
 * only places them in the Toranj layout and documents the responsive
 * contract. The route stays a Server Component: only serializable props reach
 * the Astryx client components.
 */

const homeDescription = "تولید محصولات پلاستیکی با قالب اختصاصی، خدمات تزریق کارمزدی در کهریزک و تأمین مواد اولیه پلیمری در صنایع پلاستیک ترنج.";
export const metadata: Metadata = publicContentMetadata({ title: "ترنج پلاستیک", path: "/", summary: homeDescription });

const capabilities = [
  {
    number: "۰۱",
    title: "خدمات تزریق پلاستیک",
    description: "پذیرش قالب و انجام تزریق کارمزدی با دستگاه‌های ۸۰ تا ۴۵۰ تن در کهریزک، با متریال ارسالی مشتری یا متریال تأمینی ترنج.",
    href: "/injection-molding",
    accent: "injection",
    image: { url: "/branding/banners/injection-services.webp", alt: "خدمات تزریق پلاستیک کارمزدی در کهریزک", position: "center bottom" },
  },
  {
    number: "۰۲",
    title: "محصولات کاتالوگ",
    description: "مجموعه محصولات آماده و کاربردی تولیدشده با قالب‌های اختصاصی ترنج؛ آماده سفارش عمده و در تیراژهای گوناگون.",
    href: "/products",
    accent: "products",
    image: { url: "/catalog/spice-dispenser.webp", alt: "نمک‌پاش و ادویه‌پاش ترنج، از محصولات کاتالوگ", position: "center" },
  },
  {
    number: "۰۳",
    title: "مواد اولیه و پلیمرها",
    description: "تأمین انواع گریدهای پلیمری صنعتی (PP, PE و...) متناسب با نیاز تولیدکنندگان و کارگاه‌ها.",
    href: "/materials",
    accent: "materials",
    image: { url: "/branding/banners/materials.webp", alt: "تأمین انواع مواد اولیه پلیمری صنعتی", position: "center bottom" },
  },
] as const;

const inquirySteps = [
  {
    step: "۱",
    title: "ارسال مشخصات یا نمونه",
    description: "ثبت مشخصات قطعه، ابعاد قالب، نوع متریال و تیراژ درخواستی در سامانه استعلام.",
  },
  {
    step: "۲",
    title: "بررسی مهندسی و امکان‌سنجی",
    description: "انطباق ابعاد قالب ارسالی با تناژ دستگاه تزریق (۸۰ تا ۴۵۰ تن)، تعیین گرید پلیمر و سیکل تولید.",
  },
  {
    step: "۳",
    title: "صدور پیش‌فاکتور رسمی",
    description: "ارائه پیش‌فاکتور رسمی و شفاف شامل برآورد زمان تحویل بار و شرایط اجرایی ظرف ۲۴ الی ۴۸ ساعت کاری.",
  },
] as const;

export async function LatestArticlesSection() {
  try {
    await connection();
  } catch {
    // Allows execution outside a Next.js request scope (e.g., during unit tests)
  }
  let latestArticles: StrapiArticle[] = [];

  try {
    const result = await listStrapiArticles({ pageSize: 3 });
    latestArticles = result.items;
  } catch {
    // Graceful degradation when CMS is offline or during cold start
    latestArticles = [];
  }

  if (latestArticles.length === 0) {
    return null;
  }

  return (
    <section className={`${styles.articles} content-container`} aria-labelledby="articles-title">
      <HStack gap={4} justify="between" vAlign="end" wrap="wrap">
        <VStack gap={2} hAlign="start" className={styles.headerCopy}>
          <Eyebrow>۰۳ / دانشنامه و راهنماهای فنی</Eyebrow>
          <SectionTitle id="articles-title">آخرین مقالات و یادداشت‌های تخصصی</SectionTitle>
        </VStack>
        <Link href="/articles" weight="bold" className={styles.allArticlesLink}>
          مشاهده همه مقالات <span aria-hidden="true">←</span>
        </Link>
      </HStack>

      {/* Card titles are level three under the band's own level-two heading. */}
      <ContentGrid>
        {latestArticles.map((article) => (
          <ContentCard
            key={article.id}
            title={article.title}
            summary={article.summary}
            href={`/articles/${article.slug}`}
            image={article.featuredImage}
            titleLevel={3}
            meta={<ArticleMeta category={article.category} publishedAt={article.publishedAt} />}
          />
        ))}
      </ContentGrid>
    </section>
  );
}

export default function Home() {
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        url: siteOrigin,
        name: "ترنج پلاستیک",
        description: homeDescription,
        inLanguage: "fa-IR",
        publisher: {
          "@id": `${siteOrigin}/#organization`,
        },
      },
    ],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeJsonLd) }}
      />

      {/* Campaign: the only heading, lead and action pair; the artwork is supporting media. */}
      <section aria-labelledby="home-title" data-testid="home-campaign">
        <Section variant="muted" padding={0} paddingBlock={6} dividers={["bottom"]}>
          <Card padding={0} elevation="med" className={`${styles.campaignFrame} content-container`}>
            <VStack gap={4} hAlign="start" vAlign="center" className={styles.campaignCopy}>
              <Eyebrow>ترنج پلاستیک / تولید و تأمین محصولات پلاستیکی</Eyebrow>
              <Heading level={1} id="home-title" color="inherit" textWrap="balance" className={styles.title}>
                محصولات و خدمات ترنج پلاستیک
              </Heading>
              <Text as="p" size="lg" color="secondary" className={styles.campaignLead}>
                محصولات، خدمات تزریق پلاستیک و مواد اولیه را مرور کنید یا درخواست استعلام خود را ثبت کنید.
              </Text>
              <HStack gap={3} wrap="wrap" className={styles.campaignActions}>
                <Button href="/products" variant="primary">مشاهده محصولات</Button>
                <Button href="/inquiry" variant="secondary">ثبت استعلام</Button>
              </HStack>
            </VStack>
            <AspectRatio ratio={6 / 5} fit="cover" className={styles.campaignMedia}>
              <Image
                className={styles.campaignImage}
                src="/branding/banners/home-hero.webp"
                alt="نمونه محصولات پلاستیکی ترنج"
                width={1916}
                height={821}
                sizes="(max-width: 48rem) 100vw, 50vw"
                priority
              />
            </AspectRatio>
          </Card>
        </Section>
      </section>

      {/* Core B2B capabilities */}
      <HStack as="section" gap={4} justify="between" vAlign="end" wrap="wrap" className={`${styles.intro} content-container`} aria-labelledby="intro-title">
        <VStack gap={2} hAlign="start" className={styles.introHeading}>
          <Eyebrow>۰۱ / توانمندی‌ها</Eyebrow>
          <SectionTitle id="intro-title" className={styles.introTitle}>مسیر مورد نیازتان را انتخاب کنید.</SectionTitle>
        </VStack>
        <Text as="p" color="secondary" className={styles.introLead}>
          از کاتالوگ محصولات تا خدمات تزریق و تأمین مواد اولیه؛ هر بخش اطلاعات مخصوص خود را دارد و با انتشار محتوای تأییدشده تکمیل می‌شود.
        </Text>
      </HStack>

      {/* Each capability is one link: named by its title, described by its summary. */}
      <section className={`${styles.areas} content-container`} aria-label="حوزه‌های ترنج پلاستیک">
        {capabilities.map((area) => {
          const titleId = `home-capability-${area.accent}-title`;
          const descriptionId = `home-capability-${area.accent}-description`;
          return (
            <NextLink className={styles.area} key={area.href} href={area.href} aria-labelledby={titleId} aria-describedby={descriptionId}>
              <Card elevation="low" className={styles.areaCard}>
                <HStack gap={4} justify="between" vAlign="center" className={styles.areaTop}>
                  <Text type="supporting">{area.number} / حوزه فعالیت</Text>
                  <Text aria-hidden="true" className={styles.areaArrow}>↖</Text>
                </HStack>
                {/* A 2:1 product crop: the banners' rasterized headline and call-to-action pill stay out of the card. */}
                <AspectRatio ratio={2} fit="cover" className={styles.areaMedia} aria-hidden="true">
                  <Image
                    className={styles.areaPhoto}
                    src={area.image.url}
                    alt={area.image.alt}
                    width={1200}
                    height={1200}
                    sizes="(max-width: 40rem) 92vw, (max-width: 64rem) 46vw, 23rem"
                    style={{ objectPosition: area.image.position }}
                  />
                </AspectRatio>
                <VStack gap={3} className={styles.areaBody}>
                  <Heading level={3} id={titleId} color="inherit" className={`${styles.title} ${styles.areaTitle}`}>{area.title}</Heading>
                  <Text as="p" id={descriptionId} color="secondary">{area.description}</Text>
                  <HStack gap={2} justify="between" vAlign="center" className={styles.areaMore}>
                    <Text weight="bold" color="accent">مشاهده بخش</Text>
                    <Text aria-hidden="true" weight="bold" color="accent">←</Text>
                  </HStack>
                </VStack>
              </Card>
            </NextLink>
          );
        })}
      </section>

      {/* Industrial inquiry workflow: an ordered process, not a progress tracker. */}
      <section aria-labelledby="inquiry-strip-title">
        <Section variant="muted" padding={0} dividers={["top", "bottom"]}>
          <VStack gap={8} className={`${styles.band} content-container`}>
            <VStack gap={2} hAlign="start" className={styles.inquiryHeader}>
              <Eyebrow>۰۲ / فرایند استعلام صنعتی</Eyebrow>
              <SectionTitle id="inquiry-strip-title">مراحل استعلام و بررسی قطعات سفارشی</SectionTitle>
              <Text as="p" color="secondary">
                ثبت استعلام صنعتی در ترنج پلاستیک یک فرایند مهندسی، شفاف و همراه با ارزیابی دقیق فنی است.
              </Text>
            </VStack>

            {/* An explicit list role: Safari/VoiceOver drops implicit list semantics from a list without markers. */}
            <ol className={styles.steps} role="list">
              {inquirySteps.map((item) => (
                <VStack as="li" key={item.step} gap={3} hAlign="start" className={styles.step}>
                  <Text weight="bold" className={styles.stepBadge}>{item.step}</Text>
                  <Heading level={3} color="inherit" className={styles.title}>{item.title}</Heading>
                  <Text as="p" color="secondary">{item.description}</Text>
                </VStack>
              ))}
            </ol>

            <HStack>
              <Button href="/inquiry" variant="primary" wrapLabel className={styles.inquiryAction}>
                ورود به فرم استعلام و ثبت مشخصات قطعه <span aria-hidden="true">←</span>
              </Button>
            </HStack>
          </VStack>
        </Section>
      </section>

      {/* Latest technical articles from Strapi CMS */}
      <Suspense fallback={null}>
        <LatestArticlesSection />
      </Suspense>

      {/* Closing consultation and contact */}
      <section aria-labelledby="closing-title">
        <Section variant="muted" padding={0} dividers={["top"]}>
          <HStack gap={6} justify="between" vAlign="center" wrap="wrap" className={`${styles.band} content-container`}>
            <VStack gap={2} hAlign="start" className={styles.closingCopy}>
              <Eyebrow>۰۴ / ارتباط با واحد مهندسی</Eyebrow>
              <SectionTitle id="closing-title" className={styles.closingTitle}>جزئیات، مسیر تصمیم‌گیری را روشن‌تر می‌کنند.</SectionTitle>
              <Text as="p" color="secondary" className={styles.closingLead}>
                برای شناخت بیشتر، محتوای منتشرشده هر بخش را بخوانید یا از صفحه تماس به سراغ راه‌های ارتباط و مشاوره بروید.
              </Text>
            </VStack>
            <Button href="/contact" variant="primary">
              صفحه تماس <span aria-hidden="true">↖</span>
            </Button>
          </HStack>
        </Section>
      </section>
    </main>
  );
}
