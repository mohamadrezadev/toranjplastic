import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { AdminPortalShell } from "@/components/admin/AdminPortalShell";
import { getAdminAccess } from "@/lib/auth";
import { logoutAction } from "../auth/actions";
import { AuthStatus } from "../auth/AuthFrame";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function AdminGate({ children }: { children: ReactNode }) {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (access.status === 403) {
    return (
      <AuthStatus
        title="دسترسی مجاز نیست"
        actions={<form action={logoutAction}><Button type="submit" variant="secondary">خروج</Button></form>}
      >
        این حساب مجوز ورود به پنل مدیریت را ندارد.
      </AuthStatus>
    );
  }
  if (!access.account) {
    return <AuthStatus title="پنل موقتاً در دسترس نیست">لطفاً کمی بعد دوباره تلاش کنید.</AuthStatus>;
  }
  return <AdminPortalShell account={access.account} logoutAction={logoutAction}>{children}</AdminPortalShell>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p role="status">در حال بررسی دسترسی…</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
