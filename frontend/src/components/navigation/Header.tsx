import Link from "next/link";
import { inquiryRoute, primaryNavigationRoutes } from "@/design-system/routes";
import { ThemeToggle } from "@/components/theme";
import { ActionLink } from "./ActionLink";
import { MobileNavigation } from "./MobileNavigation";
import styles from "./Navigation.module.css";

export function Header() {
  return <header className={styles.header}>
    <div className={`${styles.headerInner} content-container`}>
      <Link className={styles.brand} href="/" aria-label="ترنج پلاستیک — صفحه اصلی">
        <span className={styles.brandWrap}>
          <span className={styles.brandSymbol} aria-hidden="true" />
          <span className={styles.brandText}>
            <strong className={styles.brandTitle}>ترنج پلاستیک</strong>
            <span className={styles.brandSub}>تولید و خدمات تزریق</span>
          </span>
        </span>
      </Link>
      <nav className={styles.desktopNav} aria-label="ناوبری اصلی"><ul className={styles.navList}>{primaryNavigationRoutes.map((route) => <li key={route.key}><Link className={styles.navLink} href={route.path}>{route.label}</Link></li>)}</ul></nav>
      <div className={styles.actions}><ThemeToggle /><ActionLink href={inquiryRoute.path} emphasis="primary">{inquiryRoute.label}</ActionLink><Link className={styles.action} href="/account">حساب من</Link></div>
      <MobileNavigation />
    </div>
  </header>;
}
