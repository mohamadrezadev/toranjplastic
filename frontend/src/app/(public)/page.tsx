import Link from "next/link";
import type { Metadata } from "next";
import { publicContentMetadata } from "@/lib/content-metadata";
import styles from "./page.module.css";

const homeDescription = "محصولات آشپزخانه و نظافتی، خدمات تزریق پلاستیک و مواد اولیه ترنج پلاستیک را مرور کنید.";
export const metadata: Metadata = publicContentMetadata({ title: "ترنج پلاستیک", path: "/", summary: homeDescription });

const areas = [
  {
    number: "۰۱", title: "محصولات", description: "محصولات منتشرشده را ببینید و جزئیات هر مورد را بررسی کنید.", href: "/products", accent: "products",
    image: { url: "/catalog/spice-dispenser.webp", alt: "نمک‌پاش و ادویه‌پاش ترنج، از محصولات منتشرشده کاتالوگ" },
  },
  { number: "۰۲", title: "خدمات تزریق", description: "با حوزه خدمات تزریق پلاستیک و اطلاعات منتشرشده آن آشنا شوید.", href: "/injection-molding", accent: "injection", image: null },
  { number: "۰۳", title: "مواد اولیه", description: "مواد اولیه معرفی‌شده را بر اساس اطلاعات موجود مرور کنید.", href: "/materials", accent: "materials", image: null },
] as const;

export default function Home() {
  return <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={`${styles.heroInner} content-container`}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><span className={styles.eyebrowLine} /> ترنج پلاستیک / معرفی و استعلام</span>
          <h1 id="home-title">برای هر نیاز صنعتی، <em>یک نقطه شروع روشن.</em></h1>
          <p>محصولات، خدمات تزریق پلاستیک و مواد اولیه را در یک مسیر ساده مرور کنید. اطلاعات هر بخش بر اساس محتوای منتشرشده نمایش داده می‌شود.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/products">کاوش محصولات <span aria-hidden="true">↖</span></Link>
            <Link className={styles.textAction} href="/contact">راه‌های ارتباط <span aria-hidden="true">←</span></Link>
          </div>
        </div>
        <div className={styles.heroArtwork} aria-hidden="true">
          <div className={styles.artFrame}>
            {/* از کاتالوگ محصولات منتشرشده؛ منشأ در docs/catalog-media-provenance.md ثبت شده است. */}
            <img className={styles.artPhoto} src="/catalog/all-purpose-liquid-dispenser.webp" alt="" width={1200} height={1200} />
            <span className={styles.artScrim} />
            <span className={styles.artIndex}>TP / 01</span>
            <span className={styles.artCaption}>FORM · MATERIAL · FUNCTION</span>
          </div>
        </div>
      </div>
      <div className={`${styles.heroBottom} content-container`}><span>بستر معرفی و پیگیری نیاز شما</span><span dir="ltr">SCROLL TO EXPLORE&nbsp; ↓</span></div>
    </section>
    <section className={`${styles.intro} content-container`} aria-labelledby="intro-title">
      <div><span className={styles.sectionNumber}>01 / حوزه‌ها</span><h2 id="intro-title">مسیر مورد نیازتان را انتخاب کنید.</h2></div>
      <p>از کاتالوگ محصولات تا خدمات تزریق و تأمین مواد اولیه؛ هر بخش اطلاعات مخصوص خود را دارد و با انتشار محتوای تأییدشده تکمیل می‌شود.</p>
    </section>
    <section className={`${styles.areas} content-container`} aria-label="حوزه‌های ترنج پلاستیک">
      {areas.map((area) => <Link className={`${styles.area} ${styles[area.accent]}`} key={area.href} href={area.href}>
        <span className={styles.areaTop}><span>{area.number} / حوزه فعالیت</span><span className={styles.areaArrow} aria-hidden="true">↖</span></span>
        <span className={styles.areaGlyph} aria-hidden="true">{area.image ? <img className={styles.areaPhoto} src={area.image.url} alt={area.image.alt} width={1200} height={1200} loading="lazy" /> : <span />}</span>
        <span className={styles.areaBody}><strong>{area.title}</strong><span>{area.description}</span><span className={styles.areaMore}>مشاهده بخش <span aria-hidden="true">←</span></span></span>
      </Link>)}
    </section>
    <section className={styles.closing} aria-labelledby="closing-title">
      <div className={`${styles.closingInner} content-container`}>
        <span className={styles.sectionNumber}>02 / اطلاعات بیشتر</span>
        <div><h2 id="closing-title">جزئیات، مسیر تصمیم‌گیری را روشن‌تر می‌کنند.</h2><p>برای شناخت بیشتر، محتوای منتشرشده هر بخش را بخوانید یا از صفحه تماس به سراغ راه‌های ارتباط بروید.</p></div>
        <Link className={styles.closingAction} href="/contact">صفحه تماس <span aria-hidden="true">↖</span></Link>
      </div>
    </section>
  </main>;
}
