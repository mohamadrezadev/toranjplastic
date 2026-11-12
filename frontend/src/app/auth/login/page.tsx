import type { Metadata } from "next";
import { Link } from "@astryxdesign/core/Link";
import { AuthLayout, AuthSubmitButton } from "@/components/auth";
import { Alert } from "@/components/feedback";
import { Input } from "@/components/ui";
import { loginAction } from "../actions";
import styles from "@/components/auth/Auth.module.css";

export const metadata: Metadata = { title: "ورود به حساب", robots: { index: false, follow: false } };
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; registered?: string; next?: string }> }) {
  const state = await searchParams;
  const feedback = state.error
    ? <Alert variant="danger" title="شماره موبایل یا رمز عبور صحیح نیست." />
    : state.registered ? <Alert variant="success" title="حساب شما ساخته شد. اکنون وارد شوید." /> : null;

  return <AuthLayout
    eyebrow="حساب کاربری / ورود"
    title="ورود به حساب"
    titleId="login-title"
    intro="با شماره موبایل و رمز عبور وارد شوید."
    feedback={feedback}
    footer={<>حساب ندارید؟ <Link href="/auth/register" weight="bold" hasUnderline>ثبت‌نام کنید</Link></>}
  >
    <form action={loginAction} className={styles.form}>
      <input type="hidden" name="next" value={state.next ?? ""} />
      <Input label="شماره موبایل" name="mobile" inputMode="tel" autoComplete="tel" dir="ltr" required maxLength={32} />
      <Input label="رمز عبور" name="password" type="password" autoComplete="current-password" required minLength={10} maxLength={128} />
      <AuthSubmitButton label="ورود" pendingLabel="در حال ورود…" />
    </form>
  </AuthLayout>;
}
