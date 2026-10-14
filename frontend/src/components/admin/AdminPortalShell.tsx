import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import type { AuthAccount } from "@/lib/auth";
import { AdminNavigation } from "./AdminNavigation";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import styles from "./AdminPortalShell.module.css";

interface AdminPortalShellProps {
  account: AuthAccount;
  children: ReactNode;
  logoutAction: () => Promise<void>;
}

export function AdminPortalShell({ account, children, logoutAction }: AdminPortalShellProps) {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#admin-content">رفتن به محتوای اصلی</a>
      <header className={styles.mobileBar}>
        <Link className={styles.mobileBrand} href="/admin" aria-label="پنل مدیریت ترنج پلاستیک">
          <span className={styles.wordmark} dir="ltr" aria-hidden="true"><span>T</span><span className={styles.wordmarkIcon} /><span>ranj</span></span>
          <span>مدیریت</span>
        </Link>
        <details className={styles.mobileMenu}>
          <summary>
            <span className={styles.avatar} aria-hidden="true">{account.displayName.trim().charAt(0) || "ت"}</span>
            <span className={styles.mobileAccount}>{account.displayName}</span>
            <span className={styles.menuLabel}>منو</span>
            <span className={styles.menuIcon} aria-hidden="true" />
          </summary>
          <div className={styles.mobilePanel}>
            <div className={styles.mobilePanelHeading}>
              <strong>{account.displayName}</strong>
              <span>مدیر فعال</span>
            </div>
            <AdminNavigation />
            <form action={logoutAction}><Button type="submit" variant="secondary">خروج امن</Button></form>
          </div>
        </details>
      </header>
      <aside className={styles.sidebar} aria-label="ناوبری پنل مدیریت">
        <div className={styles.sidebarTop}>
          <Link className={styles.brand} href="/" aria-label="ترنج پلاستیک — صفحه اصلی">
            <span className={styles.wordmark} dir="ltr" aria-hidden="true"><span>T</span><span className={styles.wordmarkIcon} /><span>ranj</span></span>
            <span className={styles.brandCaption}>پنل مدیریت</span>
          </Link>
          <div className={styles.accountCard}>
            <span className={styles.avatar} aria-hidden="true">{account.displayName.trim().charAt(0) || "ت"}</span>
            <span className={styles.accountCopy}>
              <strong>{account.displayName}</strong>
              <span>مدیر فعال</span>
            </span>
          </div>
        </div>

        <AdminNavigation />

        <div className={styles.sidebarFooter}>
          <p>اطلاعات این محیط محرمانه و ویژه کارکنان مجاز است.</p>
          <form action={logoutAction}><Button type="submit" variant="secondary">خروج امن</Button></form>
        </div>
      </aside>

      <div className={styles.workspace}>
        <div id="admin-content" className={styles.content} role="main"><AdminBreadcrumbs />{children}</div>
      </div>
    </div>
  );
}
