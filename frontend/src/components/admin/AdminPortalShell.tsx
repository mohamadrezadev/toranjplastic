import { Avatar } from "@astryxdesign/core/Avatar";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import type { AuthAccount } from "@/lib/auth";
import { AdminNavigation } from "./AdminNavigation";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { AdminMobileMenu } from "./AdminMobileMenu";
import styles from "./AdminPortalShell.module.css";

interface AdminPortalShellProps {
  account: AuthAccount;
  children: ReactNode;
  logoutAction: () => Promise<void>;
}

const roleLabels = { ADMIN: "مدیر فعال", SALES: "کارشناس فروش", OPERATOR: "اپراتور محتوا", CUSTOMER: "مشتری" } as const;

/*
 * Admin shell (OpenSpec change rebuild-ui-with-astryx, task 8.1). The landmarks
 * and the responsive frame (fixed sidebar, sticky phone/tablet bar) stay Toranj
 * CSS, like the customer portal (OD-13): the frame carries the brand wordmark
 * and the approved layout. Links, identity, helper text and breadcrumbs are
 * Astryx Link, Avatar, Text and Breadcrumbs; logout stays the shared Button.
 * The shell owns the single <main> landmark; pages render inside it. Navigation
 * is derived from the account capabilities and only hides links (presentation).
 */
export function AdminPortalShell({ account, children, logoutAction }: AdminPortalShellProps) {
  const roleLabel = roleLabels[account.role];
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#admin-content">رفتن به محتوای اصلی</a>
      <header className={styles.mobileBar}>
        <Link className={styles.mobileBrand} href="/admin" color="inherit" type="inherit" aria-label="پنل مدیریت ترنج پلاستیک">
          <span className={styles.wordmark} dir="ltr" aria-hidden="true"><span>T</span><span className={styles.wordmarkIcon} /><span>ranj</span></span>
          <Text as="span" type="supporting" weight="bold" color="secondary">مدیریت</Text>
        </Link>
        <AdminMobileMenu displayName={account.displayName} roleLabel={roleLabel}>
          <AdminNavigation capabilities={account.capabilities} />
          <form action={logoutAction}><Button type="submit" variant="secondary">خروج امن</Button></form>
        </AdminMobileMenu>
      </header>
      <aside className={styles.sidebar} aria-label="ناوبری پنل مدیریت">
        <div className={styles.sidebarTop}>
          <Link className={styles.brand} href="/" color="inherit" type="inherit" aria-label="ترنج پلاستیک — صفحه اصلی">
            <span className={styles.wordmark} dir="ltr" aria-hidden="true"><span>T</span><span className={styles.wordmarkIcon} /><span>ranj</span></span>
            <Text as="span" type="supporting" color="secondary" className={styles.brandCaption}>پنل مدیریت</Text>
          </Link>
          <div className={styles.accountCard}>
            <span className={styles.avatar} aria-hidden="true"><Avatar name={account.displayName} alt="" size="md" tooltip={false} /></span>
            <span className={styles.accountCopy}>
              <Text as="span" weight="bold" color="inherit" className={styles.accountName}>{account.displayName}</Text>
              <Text as="span" type="supporting" color="secondary">{roleLabel}</Text>
            </span>
          </div>
        </div>

        <AdminNavigation capabilities={account.capabilities} />

        <div className={styles.sidebarFooter}>
          <Text as="p" type="supporting" color="secondary">اطلاعات این محیط محرمانه و ویژه کارکنان مجاز است.</Text>
          <form action={logoutAction}><Button type="submit" variant="secondary">خروج امن</Button></form>
        </div>
      </aside>

      <div className={styles.workspace}>
        <main id="admin-content" className={styles.content}><AdminBreadcrumbs />{children}</main>
      </div>
    </div>
  );
}
