import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { BalancedGrid, DetailHero, ImageGallery, contentStyles } from "@/components/content";
import { Button, DirectionalData } from "@/components/ui";
import { getManagedPage, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";
import { contactPageJsonLd, serializeJsonLd } from "@/lib/jsonld";
import styles from "../institutional-pages.module.css";

type ContactChannel = {
  title: string;
  description: ReactNode;
  values: ReadonlyArray<{ href: string; label: string }>;
};

/*
 * The verified official channels. Phone numbers and the email address are
 * standalone actions with an isolated LTR value; nothing here may be added
 * without approved content.
 */
const contactChannels: ReadonlyArray<ContactChannel> = [
  {
    title: "واحد فروش محصولات و سفارش‌های عمده",
    description: "جهت استعلام محصولات کاتالوگ ترنج، پیگیری تیراژ و هماهنگی خرید عمده با کارشناسان فروش در تماس باشید.",
    values: [
      { href: "tel:+989132075925", label: "۰۹۱۳۲۰۷۵۹۲۵" },
      { href: "tel:+989122009515", label: "۰۹۱۲۲۰۰۹۵۱۵" },
    ],
  },
  {
    title: "پشتیبانی فنی وب‌سایت",
    description: "راهنمایی کاربری، رفع مشکلات فنی در ثبت استعلام آنلاین و ورود به حساب کاربری سایت.",
    values: [{ href: "tel:+989104500086", label: "۰۹۱۰۴۵۰۰۰۸۶" }],
  },
  {
    title: "واحد تأمین مواد اولیه پلیمری و مکاتبات",
    description: (
      <>
        استعلام انواع گریدهای پلیمری (<DirectionalData>PP, PE</DirectionalData>)، ارسال مشخصات فنی سفارش و مکاتبات رسمی از طریق ایمیل کارخانه.
      </>
    ),
    values: [{ href: "mailto:info@toranjplastic.com", label: "info@toranjplastic.com" }],
  },
];

/* The verified business hours, as label and value pairs. */
const businessHours: ReadonlyArray<{ days: string; hours: string }> = [
  { days: "شنبه تا چهارشنبه:", hours: "۸:۰۰ الی ۱۷:۰۰" },
  { days: "پنج‌شنبه‌ها:", hours: "۸:۰۰ الی ۱۳:۰۰" },
  { days: "جمعه‌ها و تعطیلات رسمی:", hours: "تعطیل" },
];

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getManagedPage("contact");
    return publicContentMetadata({
      title: page.title,
      path: "/contact",
      summary: page.summary,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      images: page.images,
    });
  } catch (error) {
    if (isNotFoundError(error)) return { title: "تماس با ما | ترنج پلاستیک", robots: { index: false, follow: false } };
    throw error;
  }
}

/*
 * Contact (OpenSpec change rebuild-ui-with-astryx, task 5.3). The record is an
 * Astryx VStack rendered as <article> (the shared frame convention). The three
 * channel cards use the shared BalancedGrid steps, so the third card never
 * sits beside an empty track. Actions use the Button adapter's wrapLabel; only
 * the closing call-to-action row becomes full width on mobile.
 */
export default async function ContactPage() {
  let page;
  try {
    page = await getManagedPage("contact");
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }

  return (
    <main className={contentStyles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(contactPageJsonLd(page)) }}
      />
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: page.title }]} />
      <VStack as="article" gap={0} className={`${contentStyles.section} content-container`}>
        <DetailHero
          eyebrow="تماس با ما"
          title={page.title}
          summary={page.summary}
          image={page.images[0]}
          action={<Button href="/inquiry" wrapLabel>ثبت آنلاین استعلام قیمت</Button>}
          note="کارشناسان ترنج پلاستیک در ساعات کاری رسمی آماده پاسخگویی به استعلام‌ها و مشاوره‌های مهندسی هستند."
        />

        <VStack gap={0} className={contentStyles.detailContent}>
          <VStack as="section" gap={5} aria-labelledby="contact-channels-title" className={styles.section}>
            <Heading level={2} id="contact-channels-title" color="inherit" className={styles.title}>کانال‌های ارتباط مستقیم با کارخانه</Heading>
            <BalancedGrid>
              {contactChannels.map((channel) => (
                <Card key={channel.title} elevation="low" className={styles.card}>
                  <VStack gap={3}>
                    <Heading level={3} color="inherit" className={styles.title}>{channel.title}</Heading>
                    <Text as="p" type="supporting">{channel.description}</Text>
                    <VStack gap={1} hAlign="start">
                      {channel.values.map((value) => (
                        <Link key={value.href} href={value.href} size="lg" weight="bold" className={styles.channelLink}>
                          <DirectionalData>{value.label}</DirectionalData>
                        </Link>
                      ))}
                    </VStack>
                  </VStack>
                </Card>
              ))}
            </BalancedGrid>

            <Grid columns={{ minWidth: 280, max: 2 }} gap={5}>
              <Card className={styles.card}>
                <VStack gap={3}>
                  <Heading level={3} color="inherit" className={styles.title}>ساعات کاری و پذیرش</Heading>
                  <MetadataList label={{ position: "start", width: "minmax(7rem, 50%)" }}>
                    {businessHours.map((entry) => (
                      <MetadataListItem key={entry.days} label={entry.days}>{entry.hours}</MetadataListItem>
                    ))}
                  </MetadataList>
                </VStack>
              </Card>

              <Card className={styles.card}>
                <VStack gap={3}>
                  <Heading level={3} color="inherit" className={styles.title}>نشانی کارخانه و انبار مرکزی</Heading>
                  <Text as="p">تهران، کهریزک، مجتمع تولیدی صنایع پلاستیک ترنج</Text>
                </VStack>
              </Card>
            </Grid>
          </VStack>

          <ImageGallery images={page.images} />

          <section aria-labelledby="fast-inquiry-box-title" className={styles.section}>
            <Card variant="muted" className={styles.callout}>
              <VStack gap={4}>
                <Heading level={2} id="fast-inquiry-box-title" color="inherit" className={styles.title}>سریع‌ترین مسیر: ثبت استعلام در سامانه آنلاین</Heading>
                <Text as="p" color="secondary">
                  برای بررسی دقیق ابعاد فنی پروژه، آپلود مدارک و صدور پیش‌فاکتور مکتوب، سامانه استعلام آنلاین ترنج پلاستیک در دسترس شماست. کارشناسان ما اطلاعات را بررسی کرده و پاسخ رسمی را در کارتابل سازمانی شما بارگذاری می‌کنند.
                </Text>
                <HStack gap={3} wrap="wrap">
                  <Button href="/inquiry" wrapLabel className={styles.calloutAction}>ورود به فرم استعلام و ثبت مشخصات قطعه</Button>
                </HStack>
              </VStack>
            </Card>
          </section>
        </VStack>
      </VStack>
    </main>
  );
}
