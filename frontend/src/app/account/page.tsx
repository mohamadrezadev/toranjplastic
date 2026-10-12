import Link from "next/link";
import { getAccountAccess } from "@/lib/auth";
import styles from "./Portal.module.css";

export default async function AccountPage() {
  const access = await getAccountAccess();
  return <main className={styles.main}><section className={styles.card}>
    <p className={styles.eyebrow}>پنل مشتری</p><h1>سلام {access.account?.displayName}</h1>
    <p>درخواست‌های تجاری خود را ثبت و پیگیری کنید.</p>
    <div className={styles.actions}><Link className={styles.primary} href="/inquiry">ثبت درخواست جدید</Link><Link className={styles.secondary} href="/account/inquiries">درخواست‌های من</Link></div>
  </section></main>;
}
