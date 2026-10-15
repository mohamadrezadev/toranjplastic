import Link from "next/link";
import Image from "next/image";
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
    <section className={styles.campaignHero} aria-labelledby="home-title" data-testid="home-campaign">
      <div className={`${styles.campaignFrame} content-container`}>
        <Image className={styles.campaignImage} src="/branding/banners/home-hero.png" alt="معرفی محصولات و خدمات ترنج پلاستیک" width={1916} height={821} sizes="100vw" priority />
        <div className={styles.campaignSummary}>
          <span className={styles.eyebrow}>ترنج پلاستیک / تولید و تأمین محصولات پلاستیکی</span>
          <h1 id="home-title">محصولات و خدمات ترنج پلاستیک</h1>
          <p>محصولات، خدمات تزریق پلاستیک و مواد اولیه را مرور کنید یا درخواست استعلام خود را ثبت کنید.</p>
        </div>
        <Link className={`${styles.campaignAction} ${styles.productAction}`} href="/products"><span>مشاهده محصولات</span></Link>
        <Link className={`${styles.campaignAction} ${styles.inquiryAction}`} href="/inquiry"><span>ثبت استعلام</span></Link>
      </div>
    </section>
    <section className={`${styles.intro} content-container`} aria-labelledby="intro-title">
      <div><span className={styles.sectionNumber}>01 / حوزه‌ها</span><h2 id="intro-title">مسیر مورد نیازتان را انتخاب کنید.</h2></div>
      <p>از کاتالوگ محصولات تا خدمات تزریق و تأمین مواد اولیه؛ هر بخش اطلاعات مخصوص خود را دارد و با انتشار محتوای تأییدشده تکمیل می‌شود.</p>
    </section>
    <section className={`${styles.areas} content-container`} aria-label="حوزه‌های ترنج پلاستیک">
      {areas.map((area) => <Link className={`${styles.area} ${styles[area.accent]}`} key={area.href} href={area.href}>
        <span className={styles.areaTop}><span>{area.number} / حوزه فعالیت</span><span className={styles.areaArrow} aria-hidden="true">↖</span></span>
        <span className={styles.areaGlyph} aria-hidden="true">{area.image ? <Image className={styles.areaPhoto} src={area.image.url} alt={area.image.alt} width={1200} height={1200} /> : <span />}</span>
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
