import Link from "next/link";
import { accountRoute, inquiryRoute, primaryNavigationRoutes } from "@/design-system/routes";
import { ActionLink } from "./ActionLink";
import { MobileNavigation } from "./MobileNavigation";
import styles from "./Navigation.module.css";

export function Header() {
  return <header className={styles.header}>
    <div className={`${styles.headerInner} content-container`}>
      <Link className={styles.brand} href="/" aria-label="ترنج پلاستیک — صفحه اصلی"><span className={styles.brandMark} aria-hidden="true">ت</span><span>ترنج پلاستیک</span></Link>
      <nav className={styles.desktopNav} aria-label="ناوبری اصلی"><ul className={styles.navList}>{primaryNavigationRoutes.map((route) => <li key={route.key}><Link className={styles.navLink} href={route.path}>{route.label}</Link></li>)}</ul></nav>
      <div className={styles.actions}><ActionLink href={inquiryRoute.path} emphasis="primary">{inquiryRoute.label}</ActionLink><ActionLink href={accountRoute.path}>{accountRoute.label}</ActionLink></div>
      <MobileNavigation />
    </div>
  </header>;
}
