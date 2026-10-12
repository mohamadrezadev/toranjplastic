import Link from "next/link";
import type { ReactNode } from "react";
import type { AuthAccount } from "@/lib/auth";
import { Button } from "@/components/ui";
import { PortalNavigation } from "./PortalNavigation";
import styles from "./CustomerPortalShell.module.css";

interface CustomerPortalShellProps {
  account: AuthAccount;
  children: ReactNode;
  logoutAction: () => Promise<void>;
}

export function CustomerPortalShell({ account, children, logoutAction }: CustomerPortalShellProps) {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#portal-content">رفتن به محتوای اصلی</a>
      <aside className={styles.sidebar} aria-label="ناوبری پنل مشتری">
        <div className={styles.sidebarTop}>
          <Link className={styles.brand} href="/" aria-label="ترنج پلاستیک — صفحه اصلی">
            <span className={styles.wordmark} dir="ltr" aria-hidden="true"><span>T</span><span className={styles.wordmarkIcon} /><span>ranj</span></span>
            <span className={styles.brandCaption}>پنل مشتری</span>
          </Link>
          <div className={styles.accountCard}>
            <span className={styles.avatar} aria-hidden="true">{account.displayName.trim().charAt(0) || "ت"}</span>
            <span className={styles.accountCopy}>
              <strong>{account.displayName}</strong>
              <span dir="ltr">{account.mobile}</span>
            </span>
          </div>
        </div>

        <PortalNavigation />

        <div className={styles.sidebarFooter}>
          <p>اطلاعات این بخش فقط برای حساب شما نمایش داده می‌شود.</p>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary">خروج امن</Button>
          </form>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <span>فضای کاری مشتری</span>
          <strong>{account.displayName}</strong>
        </header>
        <main id="portal-content" className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
