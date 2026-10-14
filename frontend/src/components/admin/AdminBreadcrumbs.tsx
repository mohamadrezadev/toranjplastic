"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminPortalShell.module.css";

const labels: Record<string, string> = {
  inquiries: "استعلام‌ها", categories: "دسته‌بندی‌ها", products: "محصولات",
  services: "خدمات", materials: "مواد اولیه", articles: "مقالات", pages: "صفحات ثابت",
  new: "ایجاد جدید",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean).slice(1);
  if (parts.length === 0) return null;
  return (
    <nav className={styles.breadcrumbs} aria-label="مسیر صفحه">
      <Link href="/admin">مدیریت</Link>
      {parts.map((part, index) => {
        const href = `/admin/${parts.slice(0, index + 1).join("/")}`;
        const last = index === parts.length - 1;
        const label = labels[part] ?? (last ? "جزئیات" : part);
        return <span key={href}><span aria-hidden="true">/</span>{last ? <span aria-current="page">{label}</span> : <Link href={href}>{label}</Link>}</span>;
      })}
    </nav>
  );
}
