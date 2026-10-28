import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { DetailHero, ImageGallery, contentStyles } from "@/components/content";
import { getManagedPage, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";
import { aboutPageJsonLd, serializeJsonLd } from "@/lib/jsonld";

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
      <article className={`${contentStyles.section} content-container`}>
        <DetailHero
          eyebrow="درباره ما"
          title={page.title}
          summary={page.summary}
          image={page.images[0]}
          action={
            <Link className={contentStyles.primaryLink} href="/inquiry">
              ثبت استعلام مستقیم پروژه
            </Link>
          }
          note="کارخانه و خطوط تولید: تهران، کهریزک — مجهز به ناوگان ماشین‌آلات تزریق هیدرولیک و سروو."
        />

        <div className={contentStyles.detailContent}>
          <section className={contentStyles.institutionalSection} aria-labelledby="about-overview-title">
            <h2 id="about-overview-title">معرفی کارخانه و خطوط تولید</h2>
            <div className={contentStyles.institutionalCard} style={{ gap: "1rem" }}>
              {paragraphs.map((para, idx) => (
                <p key={idx} style={{ fontSize: "var(--font-size-body)", lineHeight: "2" }}>
                  {para}
                </p>
              ))}
            </div>
          </section>

          <section className={contentStyles.institutionalSection} aria-labelledby="fleet-capabilities-title">
            <h2 id="fleet-capabilities-title">سه محور اصلی فعالیت صنایع پلاستیک ترنج</h2>
            <div className={contentStyles.institutionalGrid}>
              <div className={contentStyles.institutionalCard}>
                <h3>۱. تولید محصولات اختصاصی ترنج</h3>
                <p>
                  تولید و عرضه مستقیم انواع قطعات و ظروف پلاستیکی با قالب‌های اختصاصی موجود کارخانه؛ آماده سفارش تیراژ و خرید عمده بدون نیاز به ساخت قالب.
                </p>
              </div>
              <div className={contentStyles.institutionalCard}>
                <h3>۲. خدمات تزریق پلاستیک کارمزدی</h3>
                <p>
                  پذیرش قالب از تولیدکنندگان و شرکت‌ها و انجام تزریق کارمزدی با دستگاه‌های ۸۰ تا ۴۵۰ تن با مواد ارسالی شما یا مواد تأمینی ترنج (عدم فعالیت در ساخت قالب).
                </p>
              </div>
              <div className={contentStyles.institutionalCard}>
                <h3>۳. تأمین مواد اولیه پلیمری</h3>
                <p>
                  تأمین و توزیع مستقیم انواع گریدهای پلیمری (PP, PE و...) همراه با برگه معتبر آنالیز پتروشیمی (CoA) و مشاوره انتخاب گرید متناسب با قطعه.
                </p>
              </div>
            </div>
          </section>

          <ImageGallery images={page.images} />

          <section className={contentStyles.institutionalSection} aria-labelledby="about-contact-cta-title">
            <h2 id="about-contact-cta-title">آماده همکاری و پاسخگویی به پروژه‌های صنعتی شما</h2>
            <div className={contentStyles.institutionalCard} style={{ gap: "1.25rem", padding: "2rem" }}>
              <p style={{ fontSize: "var(--font-size-body)", lineHeight: "1.9" }}>
                اگر نیاز به تولید قطعه، استعلام تیراژ محصولات آماده یا مشاوره فنی در زمینه خدمات تزریق پلاستیک دارید، کارشناسان ما آماده بررسی مشخصات و صدور پیش‌فاکتور رسمی هستند.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link className={contentStyles.primaryLink} href="/inquiry">
                  ثبت استعلام آنلاین
                </Link>
                <Link className={contentStyles.secondaryLink} href="/contact">
                  راه‌های تماس با کارخانه
                </Link>
              </div>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
