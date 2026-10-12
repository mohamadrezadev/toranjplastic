import Link from "next/link";
import styles from "./Portal.module.css";

export const instant = false;

export default function AccountPage() {
  return <section className={styles.page}>
    <header className={styles.pageHeader}><div className={styles.pageHeaderCopy}><p className={styles.eyebrow}>پنل مشتری / نمای کلی</p><h1>مدیریت درخواست‌ها، ساده و شفاف</h1><p className={styles.lead}>از اینجا می‌توانید درخواست جدید ثبت کنید، وضعیت درخواست‌های قبلی را ببینید و تاریخچه هر مورد را دنبال کنید.</p></div></header>
    <section className={styles.hero} aria-labelledby="portal-start-title"><div className={styles.heroCopy}><p className={styles.heroKicker}>شروع سریع</p><h2 id="portal-start-title">برای محصول، خدمات تزریق یا مواد اولیه درخواست دارید؟</h2><p>نوع درخواست را انتخاب کنید و فقط اطلاعاتی را وارد کنید که از آن مطمئن هستید.</p></div><div className={styles.heroAction}><Link className={styles.primary} href="/inquiry">ثبت درخواست جدید</Link></div></section>
    <div className={styles.quickGrid}>
      <Link className={styles.quickCard} href="/account/inquiries"><span className={styles.quickCardTop}><span className={styles.quickIndex}>01</span><span className={styles.quickArrow} aria-hidden="true">←</span></span><span><h2>درخواست‌های من</h2><p>فهرست درخواست‌ها، وضعیت فعلی و تاریخچه بررسی را مشاهده کنید.</p></span></Link>
      <Link className={styles.quickCard} href="/inquiry"><span className={styles.quickCardTop}><span className={styles.quickIndex}>02</span><span className={styles.quickArrow} aria-hidden="true">←</span></span><span><h2>درخواست تازه</h2><p>از بین چهار مسیر مصوب، فرم مناسب نیاز خود را انتخاب کنید.</p></span></Link>
    </div>
    <p className={styles.privacyNote}><span className={styles.privacyDot} aria-hidden="true" />اطلاعات حساب و درخواست‌ها خصوصی است و فقط در نشست معتبر شما نمایش داده می‌شود.</p>
  </section>;
}
