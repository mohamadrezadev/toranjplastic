import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { publicContentMetadata } from "@/lib/content-metadata";
import { listStrapiArticles, type StrapiArticle } from "@/lib/strapi";
import { ContentCard, ContentGrid, ContentTag } from "@/components/content";
import styles from "./page.module.css";

const homeDescription = "تولید محصولات پلاستیکی، خدمات تخصصی تزریق پلاستیک صنعتی و تأمین مواد اولیه پلیمری در ترنج پلاستیک.";
export const metadata: Metadata = publicContentMetadata({ title: "ترنج پلاستیک", path: "/", summary: homeDescription });

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
  } catch {
    return "";
  }
};

const capabilities = [
  {
    number: "۰۱",
    title: "خدمات تزریق پلاستیک",
    description: "قالب‌گیری دقیق قطعات پلاستیکی صنعتی و تجاری در تناژهای گوناگون، با رعایت تلورانس‌های مهندسی و استانداردهای کیفی.",
    href: "/injection-molding",
    accent: "injection",
    image: null,
  },
  {
    number: "۰۲",
    title: "محصولات کاتالوگ",
    description: "مجموعه محصولات خانگی، آشپزخانه و نظافتی ترنج پلاستیک؛ تولیدشده با مواد اولیه بهداشتی و طراحی کاربردی.",
    href: "/products",
    accent: "products",
    image: { url: "/catalog/spice-dispenser.webp", alt: "نمک‌پاش و ادویه‌پاش ترنج، از محصولات کاتالوگ" },
  },
  {
    number: "۰۳",
    title: "مواد اولیه و پلیمرها",
    description: "بررسی مشخصات فنی و کاربردی گریدهای مختلف پلیمری (PP, PE, PS, ABS) جهت انتخاب مناسب‌ترین ماده برای کاربری نهایی.",
    href: "/materials",
    accent: "materials",
    image: null,
  },
] as const;

const inquirySteps = [
  {
    step: "۱",
    title: "ارسال مشخصات یا نمونه",
    description: "ثبت نقشه فنی، مدل سه‌بعدی یا مشخصات قطعه به همراه تیراژ و ابعاد مورد نیاز در فرم استعلام.",
  },
  {
    step: "۲",
    title: "بررسی مهندسی و امکان‌سنجی",
    description: "تحلیل فنی ساخت قالب، انتخاب نوع پلیمر، تناژ مورد نیاز دستگاه و شرایط بهینه تزریق توسط تیم فنی.",
  },
  {
    step: "۳",
    title: "صدور پیش‌فاکتور رسمی",
    description: "ارائه پیشنهاد رسمی شامل برآورد زمان ساخت، شرایط اجرایی و تأیید مشخصات فنی توسط واحد فروش و مهندسی.",
  },
] as const;

export async function LatestArticlesSection() {
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
    <section className={`${styles.articlesSection} content-container`} aria-labelledby="articles-title">
      <div className={styles.articlesHeader}>
        <div>
          <span className={styles.sectionNumber}>۰۳ / دانشنامه و راهنماهای فنی</span>
          <h2 id="articles-title">آخرین مقالات و یادداشت‌های تخصصی</h2>
        </div>
        <Link className={styles.allArticlesLink} href="/articles">
          مشاهده همه مقالات <span aria-hidden="true">←</span>
        </Link>
      </div>

      <ContentGrid>
        {latestArticles.map((article) => (
          <ContentCard
            key={article.id}
            title={article.title}
            summary={article.summary}
            href={`/articles/${article.slug}`}
            image={article.featuredImage}
            meta={
              <>
                {article.category ? (
                  <ContentTag>{article.category.name}</ContentTag>
                ) : null}
                <ContentTag>{formatDate(article.publishedAt)}</ContentTag>
              </>
            }
          />
        ))}
      </ContentGrid>
    </section>
  );
}

export default function Home() {
  return (
    <main className={styles.page}>
      {/* Hero Section */}
      <section className={styles.campaignHero} aria-labelledby="home-title" data-testid="home-campaign">
        <div className={`${styles.campaignFrame} content-container`}>
          <Image
            className={styles.campaignImage}
            src="/branding/banners/home-hero.png"
            alt="معرفی محصولات و خدمات ترنج پلاستیک"
            width={1916}
            height={821}
            sizes="100vw"
            priority
          />
          <div className={styles.campaignSummary}>
            <span className={styles.eyebrow}>ترنج پلاستیک / تولید و تأمین محصولات پلاستیکی</span>
            <h1 id="home-title">محصولات و خدمات ترنج پلاستیک</h1>
            <p>محصولات، خدمات تزریق پلاستیک و مواد اولیه را مرور کنید یا درخواست استعلام خود را ثبت کنید.</p>
          </div>
          <Link className={`${styles.campaignAction} ${styles.productAction}`} href="/products">
            <span>مشاهده محصولات</span>
          </Link>
          <Link className={`${styles.campaignAction} ${styles.inquiryAction}`} href="/inquiry">
            <span>ثبت استعلام</span>
          </Link>
        </div>
      </section>

      {/* Core B2B Capabilities */}
      <section className={`${styles.intro} content-container`} aria-labelledby="intro-title">
        <div>
          <span className={styles.sectionNumber}>۰۱ / توانمندی‌ها</span>
          <h2 id="intro-title">مسیر مورد نیازتان را انتخاب کنید.</h2>
        </div>
        <p>
          از کاتالوگ محصولات تا خدمات تزریق و تأمین مواد اولیه؛ هر بخش اطلاعات مخصوص خود را دارد و با انتشار محتوای تأییدشده تکمیل می‌شود.
        </p>
      </section>

      <section className={`${styles.areas} content-container`} aria-label="حوزه‌های ترنج پلاستیک">
        {capabilities.map((area) => (
          <Link className={`${styles.area} ${styles[area.accent]}`} key={area.href} href={area.href}>
            <span className={styles.areaTop}>
              <span>{area.number} / حوزه فعالیت</span>
              <span className={styles.areaArrow} aria-hidden="true">↖</span>
            </span>
            <span className={styles.areaGlyph} aria-hidden="true">
              {area.image ? (
                <Image className={styles.areaPhoto} src={area.image.url} alt={area.image.alt} width={1200} height={1200} />
              ) : (
                <span />
              )}
            </span>
            <span className={styles.areaBody}>
              <strong>{area.title}</strong>
              <span>{area.description}</span>
              <span className={styles.areaMore}>
                مشاهده بخش <span aria-hidden="true">←</span>
              </span>
            </span>
          </Link>
        ))}
      </section>

      {/* Industrial Inquiry Workflow Strip */}
      <section className={styles.inquirySection} aria-labelledby="inquiry-strip-title">
        <div className={`${styles.inquiryInner} content-container`}>
          <div className={styles.inquiryHeader}>
            <span className={styles.sectionNumber}>۰۲ / فرایند استعلام صنعتی</span>
            <h2 id="inquiry-strip-title">مراحل استعلام و بررسی قطعات سفارشی</h2>
            <p>
              ثبت استعلام صنعتی در ترنج پلاستیک یک فرایند مهندسی، شفاف و همراه با ارزیابی دقیق فنی است.
            </p>
          </div>

          <div className={styles.inquirySteps}>
            {inquirySteps.map((item) => (
              <div key={item.step} className={styles.stepCard}>
                <span className={styles.stepBadge}>{item.step}</span>
                <strong className={styles.stepTitle}>{item.title}</strong>
                <p className={styles.stepDescription}>{item.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.inquiryFooter}>
            <Link className={styles.inquiryMainAction} href="/inquiry">
              ورود به فرم استعلام و ثبت مشخصات قطعه
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Technical Articles from Strapi CMS */}
      <Suspense fallback={null}>
        <LatestArticlesSection />
      </Suspense>

      {/* Closing Consultation & Contact Section */}
      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={`${styles.closingInner} content-container`}>
          <span className={styles.sectionNumber}>۰۴ / ارتباط با واحد مهندسی</span>
          <div>
            <h2 id="closing-title">جزئیات، مسیر تصمیم‌گیری را روشن‌تر می‌کنند.</h2>
            <p>
              برای شناخت بیشتر، محتوای منتشرشده هر بخش را بخوانید یا از صفحه تماس به سراغ راه‌های ارتباط و مشاوره بروید.
            </p>
          </div>
          <Link className={styles.closingAction} href="/contact">
            صفحه تماس <span aria-hidden="true">↖</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
