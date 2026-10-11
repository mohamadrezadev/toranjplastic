"use server";

import { redirect } from "next/navigation";
import { loginAccount, logoutAccount, registerAccount } from "@/lib/auth";

const value = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

export async function loginAction(form: FormData) {
  const response = await loginAccount({ mobile: value(form, "mobile"), password: value(form, "password") });
  if (!response.ok) redirect("/auth/login?error=invalid");
  redirect("/admin");
}

export async function registerAction(form: FormData) {
  const payload = { mobile: value(form, "mobile"), displayName: value(form, "displayName"), password: value(form, "password"), email: value(form, "email"), companyName: value(form, "companyName") };
  const response = await registerAccount(payload);
  if (!response.ok) redirect("/auth/register?error=invalid");
  redirect("/auth/login?registered=1");
}

export async function logoutAction() {
  await logoutAccount();
  redirect("/auth/login");
}
