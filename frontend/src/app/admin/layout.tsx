import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AdminPortalShell } from "@/components/admin/AdminPortalShell";
import { AuthLayout, SecureLogoutForm } from "@/components/auth";
import { Alert } from "@/components/feedback";
import { getAdminAccess } from "@/lib/auth";
import { logoutAction } from "../auth/actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function AdminGate({ children }: { children: ReactNode }) {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (access.status === 403) {
    return (
      <AuthLayout
        hasShowcase={false}
        eyebrow="پنل مدیریت"
        title="دسترسی مجاز نیست"
        titleId="admin-forbidden-title"
        feedback={<Alert variant="warning" title="این حساب مجوز ورود به پنل مدیریت را ندارد." />}
      >
        <SecureLogoutForm action={logoutAction} label="خروج" />
      </AuthLayout>
    );
  }
  if (!access.account) {
    return (
      <AuthLayout
        hasShowcase={false}
        eyebrow="پنل مدیریت"
        title="پنل موقتاً در دسترس نیست"
        titleId="admin-unavailable-title"
        feedback={<Alert variant="danger" title="لطفاً کمی بعد دوباره تلاش کنید." />}
      />
    );
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
