import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { DetailHero, ImageGallery, PreservedText, contentStyles } from "@/components/content";
import { getManagedPage, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";
import { contactPageJsonLd, serializeJsonLd } from "@/lib/jsonld";

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
      <article className={`${contentStyles.section} content-container`}>
        <DetailHero
          eyebrow="تماس با ما"
          title={page.title}
          summary={page.summary}
          image={page.images[0]}
          action={
            <Link className={contentStyles.primaryLink} href="/inquiry">
              ثبت آنلاین استعلام قیمت
            </Link>
          }
          note="کارشناسان ترنج پلاستیک در ساعات کاری رسمی آماده پاسخگویی به استعلام‌ها و مشاوره‌های مهندسی هستند."
        />

        <div className={contentStyles.detailContent}>
          <section className={contentStyles.institutionalSection} aria-labelledby="contact-channels-title">
            <h2 id="contact-channels-title">کانال‌های ارتباط مستقیم با کارخانه</h2>
            <div className={contentStyles.institutionalGrid}>
              <div className={contentStyles.institutionalCard}>
                <h3>واحد فروش محصولات و سفارش‌های عمده</h3>
                <p>
                  جهت استعلام محصولات کاتالوگ ترنج، پیگیری تیراژ و هماهنگی خرید عمده با کارشناسان فروش در تماس باشید.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <a className={contentStyles.contactChannelValue} href="tel:+989132075925">
                    ۰۹۱۳۲۰۷۵۹۲۵
                  </a>
                  <a className={contentStyles.contactChannelValue} href="tel:+989122009515">
                    ۰۹۱۲۲۰۰۹۵۱۵
                  </a>
                </div>
              </div>

              <div className={contentStyles.institutionalCard}>
                <h3>واحد خدمات تزریق کارمزدی (پذیرش قالب)</h3>
                <p>
                  هماهنگی ظرفیت دستگاه‌های تزریق ۸۰ تا ۴۵۰ تن در کهریزک، ارسال قالب مشتری و برآورد اجرت تزریق.
                </p>
                <a className={contentStyles.contactChannelValue} href="tel:+989104500086">
                  ۰۹۱۰۴۵۰۰۰۸۶
                </a>
              </div>

              <div className={contentStyles.institutionalCard}>
                <h3>واحد تأمین مواد اولیه پلیمری و مکاتبات</h3>
                <p>
                  استعلام انواع گریدهای پلیمری (PP, PE)، ارسال مشخصات فنی سفارش و مکاتبات رسمی از طریق ایمیل کارخانه.
                </p>
                <a className={contentStyles.contactChannelValue} href="mailto:info@toranjplastic.com">
                  info@toranjplastic.com
                </a>
              </div>
            </div>

            <div className={contentStyles.contactMetaGrid}>
              <div className={contentStyles.contactMetaCard}>
                <h3>ساعات کاری و پذیرش</h3>
                <ul>
                  <li><strong>شنبه تا چهارشنبه:</strong> ۸:۰۰ الی ۱۷:۰۰</li>
                  <li><strong>پنج‌شنبه‌ها:</strong> ۸:۰۰ الی ۱۳:۰۰</li>
                  <li><strong>جمعه‌ها و تعطیلات رسمی:</strong> تعطیل</li>
                </ul>
              </div>

              <div className={contentStyles.contactMetaCard}>
                <h3>نشانی کارخانه و انبار مرکزی</h3>
                <p>
                  تهران، کهریزک، مجتمع تولیدی صنایع پلاستیک ترنج
                </p>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem" }}>
                  دسترسی مستقیم ناوگان حمل‌ونقل و باربری‌های صنعتی جهت بارگیری و ارسال ایمن به سراسر کشور.
                </p>
              </div>
            </div>
          </section>

          <ImageGallery images={page.images} />

          <section className={contentStyles.institutionalSection} aria-labelledby="fast-inquiry-box-title">
            <h2 id="fast-inquiry-box-title">سریع‌ترین مسیر: ثبت استعلام در سامانه آنلاین</h2>
            <div className={contentStyles.institutionalCard} style={{ gap: "1.25rem", padding: "2rem" }}>
              <p style={{ fontSize: "var(--font-size-body)", lineHeight: "1.9" }}>
                برای بررسی دقیق ابعاد فنی پروژه، آپلود مدارک و صدور پیش‌فاکتور مکتوب، سامانه استعلام آنلاین ترنج پلاستیک در دسترس شماست. کارشناسان ما اطلاعات را بررسی کرده و پاسخ رسمی را ظرف ۲۴ الی ۴۸ ساعت در کارتابل سازمانی شما بارگذاری می‌کنند.
              </p>
              <div>
                <Link className={contentStyles.primaryLink} href="/inquiry">
                  ورود به فرم استعلام و ثبت مشخصات قطعه
                </Link>
              </div>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
