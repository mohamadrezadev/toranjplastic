import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { BalancedGrid, DetailHero, ImageGallery, contentStyles } from "@/components/content";
import { Button, DirectionalData } from "@/components/ui";
import { getManagedPage, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";
import { aboutPageJsonLd, serializeJsonLd } from "@/lib/jsonld";
import styles from "../institutional-pages.module.css";

/* The three approved activity lines; Latin grade and certificate codes keep an isolated LTR run. */
const activityLines: ReadonlyArray<{ title: string; description: ReactNode }> = [
  {
    title: "۱. تولید محصولات اختصاصی ترنج",
    description: "تولید و عرضه مستقیم انواع قطعات و ظروف پلاستیکی با قالب‌های اختصاصی موجود کارخانه؛ آماده سفارش تیراژ و خرید عمده بدون نیاز به ساخت قالب.",
  },
  {
    title: "۲. خدمات تزریق پلاستیک کارمزدی",
    description: "پذیرش قالب از تولیدکنندگان و شرکت‌ها و انجام تزریق کارمزدی با دستگاه‌های ۸۰ تا ۴۵۰ تن با مواد ارسالی شما یا مواد تأمینی ترنج (عدم فعالیت در ساخت قالب).",
  },
  {
    title: "۳. تأمین مواد اولیه پلیمری",
    description: (
      <>
        تأمین و توزیع مستقیم انواع گریدهای پلیمری (<DirectionalData>PP, PE</DirectionalData> و...) و مشاوره انتخاب گرید متناسب با قطعه.
      </>
    ),
  },
];

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getManagedPage("about");
    return publicContentMetadata({
      title: page.title,
      path: "/about",
      summary: page.summary,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      images: page.images,
    });
  } catch (error) {
    if (isNotFoundError(error)) return { title: "درباره ما | ترنج پلاستیک", robots: { index: false, follow: false } };
    throw error;
  }
}

/*
 * About (OpenSpec change rebuild-ui-with-astryx, task 5.3). The record is an
 * Astryx VStack rendered as <article> (the shared frame convention). The three
 * activity lines use the shared BalancedGrid steps, so the third card never
 * sits beside an empty track. Actions use the Button adapter's wrapLabel; only
 * the closing call-to-action row becomes full width on mobile.
 */
export default async function AboutPage() {
  let page;
  try {
    page = await getManagedPage("about");
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }

  const paragraphs = page.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className={contentStyles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(aboutPageJsonLd(page)) }}
      />
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: page.title }]} />
      <VStack as="article" gap={0} className={`${contentStyles.section} content-container`}>
        <DetailHero
          eyebrow="درباره ما"
          title={page.title}
          summary={page.summary}
          image={page.images[0]}
          action={<Button href="/inquiry" wrapLabel>ثبت استعلام مستقیم پروژه</Button>}
          note="کارخانه و خطوط تولید: تهران، کهریزک."
        />

        <VStack gap={0} className={contentStyles.detailContent}>
          {/* The approved managed-page body, as plain text paragraphs at a readable measure. */}
          <VStack as="section" gap={4} aria-labelledby="about-overview-title" className={styles.section}>
            <Heading level={2} id="about-overview-title" color="inherit" className={styles.title}>معرفی کارخانه و خطوط تولید</Heading>
            <VStack gap={4} maxWidth="48rem">
              {paragraphs.map((paragraph, index) => (
                <Text as="p" key={index}>{paragraph}</Text>
              ))}
            </VStack>
          </VStack>

          <VStack as="section" gap={5} aria-labelledby="fleet-capabilities-title" className={styles.section}>
            <Heading level={2} id="fleet-capabilities-title" color="inherit" className={styles.title}>سه محور اصلی فعالیت صنایع پلاستیک ترنج</Heading>
            <BalancedGrid>
              {activityLines.map((line) => (
                <Card key={line.title} elevation="low" className={styles.card}>
                  <VStack gap={3}>
                    <Heading level={3} color="inherit" className={styles.title}>{line.title}</Heading>
                    <Text as="p" type="supporting">{line.description}</Text>
                  </VStack>
                </Card>
              ))}
            </BalancedGrid>
          </VStack>

          <ImageGallery images={page.images} />

          <section aria-labelledby="about-contact-cta-title" className={styles.section}>
            <Card variant="muted" className={styles.callout}>
              <VStack gap={4}>
                <Heading level={2} id="about-contact-cta-title" color="inherit" className={styles.title}>آماده همکاری و پاسخگویی به پروژه‌های صنعتی شما</Heading>
                <Text as="p" color="secondary">
                  اگر نیاز به تولید قطعه، استعلام تیراژ محصولات آماده یا مشاوره فنی در زمینه خدمات تزریق پلاستیک دارید، کارشناسان ما آماده بررسی مشخصات و صدور پیش‌فاکتور رسمی هستند.
                </Text>
                <HStack gap={3} wrap="wrap">
                  <Button href="/inquiry" wrapLabel className={styles.calloutAction}>ثبت استعلام آنلاین</Button>
                  <Button href="/contact" variant="secondary" wrapLabel className={styles.calloutAction}>راه‌های تماس با کارخانه</Button>
                </HStack>
              </VStack>
            </Card>
          </section>
        </VStack>
      </VStack>
    </main>
  );
}
