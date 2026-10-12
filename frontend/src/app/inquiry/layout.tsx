import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getAccountAccess } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };
async function InquiryGate({ children }: { children: ReactNode }) {
  const access = await getAccountAccess();
  if (access.status === 401) redirect("/auth/login?next=/inquiry");
  return children;
}

export default function InquiryLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p role="status">در حال بررسی حساب…</p>}><InquiryGate>{children}</InquiryGate></Suspense>;
}
