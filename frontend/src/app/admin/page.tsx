import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAccess, hasCapability } from "@/lib/auth";
import styles from "./Admin.module.css";

export const metadata: Metadata = { title: "پنل مدیریت", robots: { index: false, follow: false } };
export const instant = false;
const contentLinks = [
  ["/admin/categories", "دسته‌بندی‌ها", "ساختار دسته‌بندی محصولات را مدیریت کنید."],
  ["/admin/products", "محصولات", "محصولات کاتالوگ را ایجاد، ویرایش و منتشر کنید."],
  ["/admin/services", "خدمات تزریق", "محتوای خدمات تزریق پلاستیک را مدیریت کنید."],
  ["/admin/materials", "مواد اولیه", "اطلاعات مواد اولیه قابل استعلام را مدیریت کنید."],
  ["/admin/articles", "مقالات", "مقالات سایت را آماده و منتشر کنید."],
  ["/admin/pages", "صفحات ثابت", "صفحات محتوایی ثابت سایت را مدیریت کنید."],
] as const;

export default async function AdminPage() {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (!access.account) return null;
  const inquiry = hasCapability(access.account, "INQUIRY_OPERATIONS");
  const content = hasCapability(access.account, "CONTENT_MANAGEMENT");
  const staff = hasCapability(access.account, "STAFF_MANAGEMENT");
  return <main className={styles.main}><div className={styles.shell}>
    <section className={styles.heroCard}><p className={styles.eyebrow}>فضای کاری ترنج پلاستیک</p><h1>پنل مدیریت</h1><p className={styles.heroLead}>فقط بخش‌هایی که متناسب با سطح دسترسی شماست در این صفحه نمایش داده می‌شود.</p></section>
    {inquiry ? <><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>عملیات</p><h2>رسیدگی به درخواست‌ها</h2></div></div><section className={styles.cardGrid}><Link href="/admin/inquiries" className={`${styles.navCard} ${styles.primaryNavCard}`}><span className={styles.cardMarker} aria-hidden="true">≋</span><h2>کارتابل استعلام‌ها</h2><p>مشاهده، تخصیص مسئول، ثبت یادداشت داخلی و تغییر وضعیت مجاز.</p></Link></section></> : null}
    {content ? <><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>محتوا</p><h2>مدیریت سایت</h2></div></div><section className={styles.cardGrid}>{contentLinks.map(([href, title, copy]) => <Link href={href} className={styles.navCard} key={href}><h2>{title}</h2><p>{copy}</p></Link>)}</section></> : null}
    {staff ? <><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>دسترسی</p><h2>کاربران سازمانی</h2></div></div><section className={styles.cardGrid}><Link href="/admin/staff" className={styles.navCard}><h2>مدیریت کارکنان</h2><p>ایجاد حساب، تغییر نقش و فعال یا غیرفعال‌کردن دسترسی کارکنان.</p></Link></section></> : null}
  </div></main>;
}
