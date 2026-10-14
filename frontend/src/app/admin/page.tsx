import type { Metadata } from "next";
import Link from "next/link";
import styles from "./Admin.module.css";

export const metadata: Metadata = { title: "پنل مدیریت", robots: { index: false, follow: false } };

export default async function AdminPage() {
  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.heroCard}>
          <p className={styles.eyebrow}>فضای کاری ترنج پلاستیک</p>
          <h1>پنل مدیریت</h1>
          <p className={styles.heroLead}>رسیدگی به استعلام‌ها و مدیریت محتوای سایت از یک فضای یکپارچه، امن و سازگار با موبایل.</p>
        </section>

        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>عملیات</p><h2>رسیدگی به درخواست‌ها</h2></div></div>
        <section className={styles.cardGrid}>
          <Link href="/admin/inquiries" className={`${styles.navCard} ${styles.primaryNavCard}`}>
            <span className={styles.cardMarker} aria-hidden="true">≡</span>
            <h2>کارتابل استعلام‌ها</h2>
            <p>مشاهده، فیلتر، تخصیص مسئول، ثبت یادداشت داخلی و تغییر وضعیت مجاز.</p>
          </Link>
        </section>

        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>محتوا</p><h2>مدیریت سایت</h2></div></div>
        <section className={styles.cardGrid}>
          <Link href="/admin/categories" className={styles.navCard}>
            <h2>دسته‌بندی‌ها</h2>
            <p>ایجاد، ویرایش، انتشار و آرشیو دسته‌بندی محصولات.</p>
          </Link>
          <Link href="/admin/products" className={styles.navCard}>
            <h2>محصولات</h2>
            <p>ایجاد، ویرایش، انتشار و آرشیو محصولات کاتالوگ.</p>
          </Link>
          <Link href="/admin/services" className={styles.navCard}>
            <h2>خدمات تزریق</h2>
            <p>ایجاد، ویرایش، انتشار و آرشیو خدمات تزریق پلاستیک.</p>
          </Link>
          <Link href="/admin/materials" className={styles.navCard}>
            <h2>مواد اولیه</h2>
            <p>ایجاد، ویرایش، انتشار و آرشیو مواد اولیه.</p>
          </Link>
          <Link href="/admin/articles" className={styles.navCard}>
            <h2>مقالات</h2>
            <p>ایجاد، ویرایش، انتشار و آرشیو مقالات.</p>
          </Link>
          <Link href="/admin/pages" className={styles.navCard}>
            <h2>صفحات ثابت</h2>
            <p>ایجاد، ویرایش، انتشار و آرشیو صفحات ثابت سایت.</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
