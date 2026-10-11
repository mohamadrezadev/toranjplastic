import Link from "next/link";
import type { Metadata } from "next";
import { Button, Input } from "@/components/ui";
import { loginAction } from "../actions";
import { AuthShowcase } from "../AuthShowcase";
import styles from "../Auth.module.css";

export const metadata: Metadata = { title: "ورود به حساب", robots: { index: false, follow: false } };
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; registered?: string }> }) {
  const state = await searchParams;
  return <main className={styles.main}><div className={styles.layout}><AuthShowcase /><section className={styles.card} aria-labelledby="login-title">
    <span className={styles.formEyebrow}>حساب کاربری / ورود</span>
    <div><h1 id="login-title">ورود به حساب</h1><p className={styles.intro}>با شماره موبایل و رمز عبور وارد شوید.</p></div>
    {state.error ? <p className={styles.feedback} role="alert">شماره موبایل یا رمز عبور صحیح نیست.</p> : null}
    {state.registered ? <p className={styles.success} role="status">حساب شما ساخته شد. اکنون وارد شوید.</p> : null}
    <form action={loginAction} className={styles.form}>
      <Input label="شماره موبایل" name="mobile" inputMode="tel" autoComplete="tel" dir="ltr" required maxLength={32} />
      <Input label="رمز عبور" name="password" type="password" autoComplete="current-password" required minLength={10} maxLength={128} />
      <Button type="submit">ورود</Button>
    </form>
    <p>حساب ندارید؟ <Link className={styles.link} href="/auth/register">ثبت‌نام کنید</Link></p>
  </section></div></main>;
}
