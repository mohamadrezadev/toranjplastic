import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import styles from "./Auth.module.css";

/* The showcase is an always-dark brand surface in both themes (see astryx-theme.css). */
export function AuthShowcase() {
  return <aside className={styles.showcase} data-toranj-surface="inverse" aria-label="معرفی ترنج پلاستیک">
    <Link className={styles.brand} href="/" color="inherit" type="inherit" aria-label="ترنج پلاستیک — صفحه اصلی"><span className={styles.wordmark} dir="ltr" aria-hidden="true"><span>T</span><span className={styles.wordmarkIcon} /><span>ranj</span></span></Link>
    <div className={styles.showcaseContent}>
      <Text as="span" type="supporting" weight="bold" color="inherit" className={styles.showcaseEyebrow}>ارتباط ساده‌تر، پیگیری روشن‌تر</Text>
      <Heading level={2} color="inherit" className={styles.showcaseTitle}>از آشنایی تا پیگیری، <em>همراه مسیر شما.</em></Heading>
      <Text as="p" color="inherit" className={styles.showcaseLead}>برای دسترسی به حساب و پیگیری درخواست‌های خود، وارد شوید یا یک حساب مشتری بسازید.</Text>
    </div>
    <div className={styles.showcaseArt} aria-hidden="true"><span className={styles.showcaseDisc} /><span className={styles.showcaseRing} /><span className={styles.showcaseBar} /></div>
    <Link className={styles.backLink} href="/" color="inherit" type="inherit">بازگشت به صفحهٔ اصلی <span aria-hidden="true">↖</span></Link>
  </aside>;
}
