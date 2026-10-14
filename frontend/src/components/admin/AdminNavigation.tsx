"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminPortalShell.module.css";

const destinations = [
  { href: "/admin", label: "نمای کلی", marker: "⌂", exact: true },
  { href: "/admin/inquiries", label: "استعلام‌ها", marker: "≡" },
  { href: "/admin/categories", label: "دسته‌بندی", marker: "#" },
  { href: "/admin/products", label: "محصولات", marker: "P" },
  { href: "/admin/services", label: "خدمات", marker: "S" },
  { href: "/admin/materials", label: "مواد اولیه", marker: "M" },
  { href: "/admin/articles", label: "مقالات", marker: "A" },
  { href: "/admin/pages", label: "صفحات", marker: "D" },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.navigation} aria-label="بخش‌های پنل مدیریت">
      {destinations.map((item) => {
        const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? styles.activeLink : undefined} aria-current={active ? "page" : undefined}>
            <span className={styles.navMarker} aria-hidden="true">{item.marker}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
