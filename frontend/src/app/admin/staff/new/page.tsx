import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";
import { createStaffAction } from "@/features/admin-staff";
import { getAdminAccess, hasCapability } from "@/lib/auth";
import styles from "../../Admin.module.css";

export const metadata: Metadata = { title: "کاربر سازمانی جدید", robots: { index: false, follow: false } };
export const instant = false;
const messages: Record<string, string> = { validation: "اطلاعات واردشده معتبر نیست.", STAFF_ACCOUNT_CONFLICT: "امکان ایجاد حساب با این اطلاعات وجود ندارد.", forbidden: "اجازه انجام این عملیات را ندارید.", failed: "ایجاد حساب انجام نشد. دوباره تلاش کنید." };
export default async function NewStaffPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const access = await getAdminAccess(); if (access.status === 401) redirect("/auth/login");
  if (!access.account || !hasCapability(access.account, "STAFF_MANAGEMENT")) return <p className={styles.feedback} role="alert">شما اجازه ایجاد کاربر سازمانی را ندارید.</p>;
  const { error } = await searchParams;
  return <main className={styles.main}><div className={styles.shell}><section className={styles.card}><div className={styles.header}><div><h1>کاربر سازمانی جدید</h1><p className={styles.subtitle}>حساب با رمز اولیه ایجاد می‌شود؛ رمز در هیچ صفحه‌ای نمایش داده نخواهد شد.</p></div></div>{error ? <p className={styles.feedback} role="alert">{messages[error] ?? messages.failed}</p> : null}<form action={createStaffAction} className={styles.form}><div className={styles.row}><Input label="نام و نام خانوادگی" name="displayName" required minLength={2} maxLength={80} autoComplete="off"/><Input label="شماره موبایل" name="mobile" required maxLength={32} dir="ltr" inputMode="tel" autoComplete="off"/></div><div className={styles.row}><Select label="سطح دسترسی" name="role" required defaultValue="SALES"><option value="ADMIN">مدیر — دسترسی کامل</option><option value="SALES">فروش — مدیریت استعلام‌ها</option><option value="OPERATOR">اپراتور — مدیریت محتوا</option></Select><Input label="رمز عبور اولیه" name="password" type="password" required minLength={10} maxLength={128} autoComplete="new-password" helpText="حداقل ۱۰ نویسه"/></div><div className={styles.formActions}><Button type="submit">ایجاد حساب</Button></div></form></section></div></main>;
}

