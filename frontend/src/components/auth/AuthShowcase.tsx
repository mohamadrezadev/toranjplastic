import { Link } from "@astryxdesign/core/Link";
import { Heading, Text } from "@astryxdesign/core/Text";
import NextLink from "next/link";
import styles from "./Auth.module.css";

/**
 * Brand panel of the split authentication layout. The Astryx `login-split`
 * template only offers a placeholder cover image here, so the panel stays a
 * Toranj composition on the inverse surface and uses Astryx type and link
 * components for its content. The copy is the approved pre-migration copy.
 */
export function AuthShowcase() {
  return <aside className={styles.showcase} data-toranj-surface="inverse" aria-label="معرفی ترنج پلاستیک">
    <NextLink className={styles.brand} href="/" aria-label="ترنج پلاستیک — صفحه اصلی"><span className={styles.wordmark} dir="ltr" aria-hidden="true"><span>T</span><span className={styles.wordmarkIcon} /><span>ranj</span></span></NextLink>
    <div className={styles.showcaseContent}>
      <Text type="label" weight="bold">ارتباط ساده‌تر، پیگیری روشن‌تر</Text>
      <Heading level={2} className={styles.showcaseTitle}>از آشنایی تا پیگیری، <em>همراه مسیر شما.</em></Heading>
      <Text as="p" color="secondary" className={styles.showcaseLead}>برای دسترسی به حساب و پیگیری درخواست‌های خود، وارد شوید یا یک حساب مشتری بسازید.</Text>
    </div>
    <div className={styles.showcaseArt} aria-hidden="true"><span className={styles.showcaseDisc} /><span className={styles.showcaseRing} /><span className={styles.showcaseBar} /></div>
    <Link href="/" color="primary" type="inherit" className={styles.backLink}>بازگشت به صفحهٔ اصلی <span aria-hidden="true">↖</span></Link>
  </aside>;
}
