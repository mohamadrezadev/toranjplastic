import type { Metadata } from "next";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { Alert } from "@/components/feedback";
import { Button, Input } from "@/components/ui";
import { loginAction } from "../actions";
import { AuthFrame, AuthPanel } from "../AuthFrame";
import styles from "../Auth.module.css";

export const metadata: Metadata = { title: "ورود به حساب", robots: { index: false, follow: false } };
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; registered?: string; next?: string }> }) {
  const state = await searchParams;
  return <AuthFrame>
    <AuthPanel id="login-title" eyebrow="حساب کاربری / ورود" title="ورود به حساب" intro="با شماره موبایل و رمز عبور وارد شوید.">
      {state.error ? <Alert variant="danger" title="شماره موبایل یا رمز عبور صحیح نیست." /> : null}
      {state.registered ? <Alert variant="success" title="حساب شما ساخته شد. اکنون وارد شوید." /> : null}
      <form action={loginAction} className={styles.form}>
        <input type="hidden" name="next" value={state.next ?? ""} />
        <Input label="شماره موبایل" name="mobile" inputMode="tel" autoComplete="tel" dir="ltr" required maxLength={32} />
        <Input label="رمز عبور" name="password" type="password" autoComplete="current-password" required minLength={10} maxLength={128} />
        <Button type="submit" className={styles.submit}>ورود</Button>
      </form>
      <Text as="p" color="secondary">حساب ندارید؟ <Link href="/auth/register" hasUnderline>ثبت‌نام کنید</Link></Text>
    </AuthPanel>
  </AuthFrame>;
}
