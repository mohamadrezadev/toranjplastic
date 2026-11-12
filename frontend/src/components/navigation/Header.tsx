import { TopNav } from "@astryxdesign/core/TopNav";
import Link from "next/link";
import { accountRoute, inquiryRoute } from "@/design-system/routes";
import { ThemeToggle } from "@/components/theme";
import { ActionLink } from "./ActionLink";
import { MobileNavigation } from "./MobileNavigation";
import { PrimaryNavigationItems } from "./PrimaryNavigationItems";
import styles from "./Navigation.module.css";

function Brand() {
  return (
    <Link className={styles.brand} href="/" aria-label="ترنج پلاستیک — صفحه اصلی">
      <span className={styles.brandSymbol} aria-hidden="true" />
      <span className={styles.brandText}>
        <strong className={styles.brandTitle}>ترنج پلاستیک</strong>
        <span className={styles.brandSub}>تولید و خدمات تزریق</span>
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.headerInner} content-container`}>
        <TopNav
          label="ناوبری اصلی"
          heading={<Brand />}
          centerContent={<span className={styles.desktopOnly}><PrimaryNavigationItems placement="bar" /></span>}
          endContent={<>
            <span className={styles.desktopOnly}>
              <ThemeToggle />
              <ActionLink href={inquiryRoute.path} emphasis="primary">{inquiryRoute.label}</ActionLink>
              <ActionLink href={accountRoute.path}>{accountRoute.label}</ActionLink>
            </span>
            <MobileNavigation />
          </>}
        />
      </div>
    </header>
  );
}
