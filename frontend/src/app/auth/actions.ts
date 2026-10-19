"use server";

import { redirect } from "next/navigation";
import { loginAccount, logoutAccount, registerAccount } from "@/lib/auth";

const value = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

function loginDestination(next: string, isStaff: boolean) {
  const fallback = isStaff ? "/admin" : "/account";
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if (isStaff) return next === "/admin" || next.startsWith("/admin/") ? next : fallback;
  return next === "/account" || next.startsWith("/account/") || next === "/inquiry" || next.startsWith("/inquiry/")
    ? next
    : fallback;
}

export async function loginAction(form: FormData) {
  const response = await loginAccount({ mobile: value(form, "mobile"), password: value(form, "password") });
  if (!response.ok) redirect("/auth/login?error=invalid");
  const next = value(form, "next");
  const account: unknown = await response.clone().json().catch(() => null);
  const isStaff = typeof account === "object" && account !== null && "role" in account && ["ADMIN", "SALES", "OPERATOR"].includes(String(account.role));
  redirect(loginDestination(next, isStaff));
}

export async function registerAction(form: FormData) {
  const email = value(form, "email");
  const companyName = value(form, "companyName");
  const payload = {
    mobile: value(form, "mobile"),
    displayName: value(form, "displayName"),
    password: value(form, "password"),
    ...(email ? { email } : {}),
    ...(companyName ? { companyName } : {}),
  };
  const response = await registerAccount(payload);
  if (!response.ok) redirect("/auth/register?error=invalid");
  redirect("/auth/login?registered=1");
}

export async function logoutAction() {
  await logoutAccount();
  redirect("/auth/login");
}
