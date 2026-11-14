"use client";

import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { usePathname } from "next/navigation";
import type { Capability } from "@/lib/auth";
import styles from "./AdminPortalShell.module.css";

const destinations: ReadonlyArray<{ href: string; label: string; marker: string; capability: Capability; exact?: boolean }> = [
  { href: "/admin", label: "نمای کلی", marker: "⌂", exact: true, capability: "MANAGEMENT_ACCESS" },
  { href: "/admin/inquiries", label: "استعلام‌ها", marker: "≋", capability: "INQUIRY_OPERATIONS" },
  { href: "/admin/categories", label: "دسته‌بندی", marker: "#", capability: "CONTENT_MANAGEMENT" },
  { href: "/admin/products", label: "محصولات", marker: "P", capability: "CONTENT_MANAGEMENT" },
  { href: "/admin/media", label: "رسانه‌ها", marker: "◫", capability: "CONTENT_MANAGEMENT" },
  { href: "/admin/services", label: "خدمات", marker: "S", capability: "CONTENT_MANAGEMENT" },
  { href: "/admin/materials", label: "مواد اولیه", marker: "M", capability: "CONTENT_MANAGEMENT" },
  { href: "/admin/articles", label: "مقالات", marker: "A", capability: "CONTENT_MANAGEMENT" },
  { href: "/admin/pages", label: "صفحات", marker: "D", capability: "CONTENT_MANAGEMENT" },
  { href: "/admin/staff", label: "کاربران سازمانی", marker: "U", capability: "STAFF_MANAGEMENT" },
];

/*
 * Capability-aware destinations (task 8.1). The list is derived from the
 * server-issued capabilities; hiding a link is presentation only, the
 * server and the route gates still enforce access.
 */
export function AdminNavigation({ capabilities }: { capabilities: Capability[] }) {
  const pathname = usePathname();
  return (
    <nav className={styles.navigation} aria-label="بخش‌های پنل مدیریت">
      {destinations.filter((item) => capabilities.includes(item.capability)).map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} color="inherit" type="inherit" className={active ? styles.activeLink : undefined} aria-current={active ? "page" : undefined}>
            <span className={styles.navMarker} aria-hidden="true">{item.marker}</span>
            <Text as="span" color="inherit">{item.label}</Text>
          </Link>
        );
      })}
    </nav>
  );
}
