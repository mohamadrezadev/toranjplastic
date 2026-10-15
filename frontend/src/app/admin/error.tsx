"use client";

import Link from "next/link";
import styles from "./Admin.module.css";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className={styles.main}><div className={styles.shell}><section className={styles.card} role="alert"><div className={styles.header}><div><h1>امکان نمایش این بخش وجود ندارد</h1><p className={styles.subtitle}>ممکن است سطح دسترسی شما برای این صفحه کافی نباشد یا ارتباط با سرویس موقتاً قطع شده باشد.</p></div></div><div className={styles.formActions}><button className={styles.linkButton} type="button" onClick={reset}>تلاش دوباره</button><Link className={styles.backLink} href="/admin">بازگشت به پنل</Link></div></section></div></main>;
}
