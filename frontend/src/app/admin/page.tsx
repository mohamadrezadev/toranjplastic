import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui";
import { getAdminAccess } from "@/lib/auth";
import { logoutAction } from "../auth/actions";
import styles from "../auth/Auth.module.css";

export const metadata: Metadata = { title: "پنل مدیریت", robots: { index: false, follow: false } };

async function AdminGate() {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (access.status === 403) return <section className={styles.card}><h1>دسترسی مجاز نیست</h1><p>این حساب مجوز ورود به پنل مدیریت را ندارد.</p><form action={logoutAction}><Button type="submit" variant="secondary">خروج</Button></form></section>;
  if (!access.account) return <section className={styles.card}><h1>پنل موقتاً در دسترس نیست</h1><p>لطفاً کمی بعد دوباره تلاش کنید.</p></section>;
  return <section className={styles.card}><h1>پنل مدیریت</h1><p>خوش آمدید، {access.account.displayName}. زیرساخت دسترسی امن فعال است؛ عملیات CMS در برش بعد اضافه می‌شود.</p><form action={logoutAction}><Button type="submit" variant="secondary">خروج امن</Button></form></section>;
}

export default function AdminPage() { return <main className={styles.main}><Suspense fallback={<p role="status">در حال بررسی دسترسی…</p>}><AdminGate /></Suspense></main>; }
