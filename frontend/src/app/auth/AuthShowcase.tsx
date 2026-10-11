import Link from "next/link";
import styles from "./Auth.module.css";

export function AuthShowcase() {
  return <aside className={styles.showcase} aria-label="معرفی ترنج پلاستیک">
    <Link className={styles.brand} href="/"><span className={styles.brandMark} aria-hidden="true">ت</span><span>ترنج پلاستیک</span></Link>
    <div className={styles.showcaseContent}>
      <span className={styles.showcaseEyebrow}>ارتباط ساده‌تر، پیگیری روشن‌تر</span>
      <h2>از آشنایی تا پیگیری، <em>همراه مسیر شما.</em></h2>
      <p>برای دسترسی به حساب و پیگیری درخواست‌های خود، وارد شوید یا یک حساب مشتری بسازید.</p>
    </div>
    <div className={styles.showcaseArt} aria-hidden="true"><span className={styles.showcaseDisc} /><span className={styles.showcaseRing} /><span className={styles.showcaseBar} /></div>
    <Link className={styles.backLink} href="/">بازگشت به صفحهٔ اصلی <span aria-hidden="true">↖</span></Link>
  </aside>;
}
