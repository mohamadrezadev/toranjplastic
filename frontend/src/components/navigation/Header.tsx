import Link from "next/link";
import { inquiryRoute, primaryNavigationRoutes } from "@/design-system/routes";
import { ThemeToggle } from "@/components/theme";
import { ActionLink } from "./ActionLink";
import { MobileNavigation } from "./MobileNavigation";
import styles from "./Navigation.module.css";

export function Header() {
  return <header className={styles.header}>
    <div className={`${styles.headerInner} content-container`}>
      <Link className={styles.brand} href="/" aria-label="ترنج پلاستیک — صفحه اصلی"><span className={styles.wordmark} dir="ltr" aria-hidden="true"><span>T</span><span className={styles.wordmarkIcon} /><span>ranj</span></span></Link>
      <nav className={styles.desktopNav} aria-label="ناوبری اصلی"><ul className={styles.navList}>{primaryNavigationRoutes.map((route) => <li key={route.key}><Link className={styles.navLink} href={route.path}>{route.label}</Link></li>)}</ul></nav>
      <div className={styles.actions}><ThemeToggle /><ActionLink href={inquiryRoute.path} emphasis="primary">{inquiryRoute.label}</ActionLink><Link className={styles.action} href="/auth/login">ورود / ثبت‌نام</Link></div>
      <MobileNavigation />
    </div>
  </header>;
}
