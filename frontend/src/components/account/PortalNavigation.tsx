"use client";

import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { usePathname } from "next/navigation";
import styles from "./CustomerPortalShell.module.css";

const destinations = [
  { href: "/account", label: "نمای کلی", marker: "⌂", exact: true },
  { href: "/account/inquiries", label: "درخواست‌های من", marker: "≡", exact: false },
  { href: "/inquiry", label: "درخواست جدید", marker: "+", exact: false },
] as const;

export function PortalNavigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.navigation} aria-label="بخش‌های پنل مشتری">
      {destinations.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return <Link key={item.href} href={item.href} color="inherit" type="inherit" className={active ? styles.activeLink : undefined} aria-current={active ? "page" : undefined}>
          <span className={styles.navMarker} aria-hidden="true">{item.marker}</span>
          <Text as="span" color="inherit">{item.label}</Text>
        </Link>;
      })}
    </nav>
  );
}
