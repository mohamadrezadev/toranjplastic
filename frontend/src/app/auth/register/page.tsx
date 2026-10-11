import Link from "next/link";
import type { Metadata } from "next";
import { Button, Input } from "@/components/ui";
import { registerAction } from "../actions";
import { AuthShowcase } from "../AuthShowcase";
import styles from "../Auth.module.css";

export const metadata: Metadata = { title: "ثبت‌نام", robots: { index: false, follow: false } };
export const instant = false;

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const state = await searchParams;
  return <main className={styles.main}><div className={styles.layout}><AuthShowcase /><section className={styles.card} aria-labelledby="register-title">
    <span className={styles.formEyebrow}>حساب کاربری / ثبت‌نام</span>
    <div><h1 id="register-title">ایجاد حساب مشتری</h1><p className={styles.intro}>نقش حساب جدید به‌صورت پیش‌فرض مشتری است.</p></div>
    {state.error ? <p className={styles.feedback} role="alert">امکان ایجاد حساب با اطلاعات واردشده وجود ندارد.</p> : null}
    <form action={registerAction} className={styles.form}>
      <Input label="نام نمایشی" name="displayName" autoComplete="name" required minLength={2} maxLength={80} />
      <Input label="شماره موبایل" name="mobile" inputMode="tel" autoComplete="tel" dir="ltr" required maxLength={32} />
      <Input label="رمز عبور" helpText="حداقل ۱۰ نویسه" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
      <Input label="ایمیل (اختیاری)" name="email" type="email" autoComplete="email" dir="ltr" maxLength={254} />
      <Input label="نام شرکت (اختیاری)" name="companyName" autoComplete="organization" maxLength={120} />
      <Button type="submit">ایجاد حساب</Button>
    </form>
    <p>قبلاً ثبت‌نام کرده‌اید؟ <Link className={styles.link} href="/auth/login">وارد شوید</Link></p>
  </section></div></main>;
}
