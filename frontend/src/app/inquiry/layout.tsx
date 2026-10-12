import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { CustomerPortalShell } from "@/components/account/CustomerPortalShell";
import { getAccountAccess } from "@/lib/auth";
import { logoutAction } from "../auth/actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const instant = false;
async function InquiryGate({ children }: { children: ReactNode }) {
  const access = await getAccountAccess();
  if (access.status === 401) redirect("/auth/login?next=/inquiry");
  if (!access.account) redirect("/auth/login?next=/inquiry");
  return <CustomerPortalShell account={access.account} logoutAction={logoutAction}>{children}</CustomerPortalShell>;
}

export default function InquiryLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p role="status">در حال بررسی حساب…</p>}><InquiryGate>{children}</InquiryGate></Suspense>;
}
