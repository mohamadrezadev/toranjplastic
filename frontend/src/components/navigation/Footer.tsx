import Link from "next/link";
import { publicRoutes } from "@/design-system/routes";
import styles from "./Navigation.module.css";

export function Footer() {
  const footerRoutes = publicRoutes.filter((route) => ["about", "contact", "privacy", "terms"].includes(route.key));
  return <footer className={styles.footer} data-shell-inert>
    <div className={`${styles.footerInner} content-container`}><div><p className={styles.footerBrand}>ترنج پلاستیک</p><p className={styles.footerNote}>اطلاعات تماس و هویت بصری پس از تأیید رسمی تیم ترنج منتشر می‌شود.</p></div><nav className={styles.footerLinks} aria-label="پیوندهای پایین صفحه">{footerRoutes.map((route) => <Link key={route.key} href={route.path}>{route.label}</Link>)}</nav></div>
  </footer>;
}
