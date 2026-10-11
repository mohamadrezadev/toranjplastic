import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { getAdminAccess } from "@/lib/auth";
import { logoutAction } from "../auth/actions";
import styles from "./Admin.module.css";

export const metadata: Metadata = { title: "پنل مدیریت", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const access = await getAdminAccess();
  const name = access.account?.displayName ?? "";

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1>پنل مدیریت</h1>
              <p className={styles.subtitle}>خوش آمدید، {name}.</p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary">خروج امن</Button>
            </form>
          </div>
        </section>

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
