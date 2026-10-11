import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { getAdminAccess } from "@/lib/auth";
import { logoutAction } from "../auth/actions";
import authStyles from "../auth/Auth.module.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function AdminGate({ children }: { children: ReactNode }) {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (access.status === 403) {
    return (
      <main className={authStyles.main}>
        <section className={authStyles.card}>
          <h1>دسترسی مجاز نیست</h1>
          <p>این حساب مجوز ورود به پنل مدیریت را ندارد.</p>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary">خروج</Button>
          </form>
        </section>
      </main>
    );
  }
  if (!access.account) {
    return (
      <main className={authStyles.main}>
        <section className={authStyles.card}>
          <h1>پنل موقتاً در دسترس نیست</h1>
          <p>لطفاً کمی بعد دوباره تلاش کنید.</p>
        </section>
      </main>
    );
  }
  return children;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p role="status">در حال بررسی دسترسی…</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
