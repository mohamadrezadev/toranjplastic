import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getAccountAccess } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function AccountGate({ children }: { children: ReactNode }) {
  const access = await getAccountAccess();
  if (access.status === 401) redirect("/auth/login?next=/account");
  return children;
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p role="status">در حال بررسی حساب…</p>}><AccountGate>{children}</AccountGate></Suspense>;
}
