import { Avatar } from "@astryxdesign/core/Avatar";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
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

/*
 * Customer portal shell (OpenSpec change rebuild-ui-with-astryx, task 7.1).
 * The landmarks and the responsive frame (sidebar, sticky mobile top bar and
 * the fixed bottom navigation of phones) stay Toranj CSS: Astryx AppShell
 * would replace the bottom bar with a drawer, which the portal requirements
 * and tests do not allow. The brand link, account identity, helper text and
 * destinations are Astryx Link, Avatar and Text; logout is the shared Button.
 */
export function CustomerPortalShell({ account, children, logoutAction }: CustomerPortalShellProps) {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#portal-content">رفتن به محتوای اصلی</a>
      <aside className={styles.sidebar} aria-label="ناوبری پنل مشتری">
        <div className={styles.sidebarTop}>
          <Link className={styles.brand} href="/" color="inherit" type="inherit" aria-label="ترنج پلاستیک — صفحه اصلی">
            <span className={styles.wordmark} dir="ltr" aria-hidden="true"><span>T</span><span className={styles.wordmarkIcon} /><span>ranj</span></span>
            <Text as="span" type="supporting" color="secondary" className={styles.brandCaption}>پنل مشتری</Text>
          </Link>
          <div className={styles.accountCard}>
            <span className={styles.avatar} aria-hidden="true"><Avatar name={account.displayName} alt="" size="md" tooltip={false} /></span>
            <span className={styles.accountCopy}>
              <Text as="span" weight="bold" color="inherit" className={styles.accountName}>{account.displayName}</Text>
              <Text as="span" type="supporting" color="secondary" dir="ltr" className={styles.accountMobile}>{account.mobile}</Text>
            </span>
          </div>
        </div>

        <PortalNavigation />

        <div className={styles.sidebarFooter}>
          <Text as="p" type="supporting" color="secondary">اطلاعات این بخش فقط برای حساب شما نمایش داده می‌شود.</Text>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary">خروج امن</Button>
          </form>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.mobileHeader}>
          <Text as="span" type="supporting" color="secondary">فضای کاری مشتری</Text>
          <Text as="span" weight="bold" color="inherit" className={styles.mobileName}>{account.displayName}</Text>
        </header>
        <main id="portal-content" className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
