"use client";

import { BreadcrumbItem, Breadcrumbs } from "@astryxdesign/core/Breadcrumbs";
import { usePathname } from "next/navigation";
import styles from "./AdminPortalShell.module.css";

const labels: Record<string, string> = {
  inquiries: "استعلام‌ها", categories: "دسته‌بندی‌ها", products: "محصولات",
  services: "خدمات", materials: "مواد اولیه", articles: "مقالات", pages: "صفحات ثابت",
  new: "ایجاد جدید", staff: "کاربران سازمانی",
  media: "رسانه‌ها",
};

/* Route-derived trail (task 8.1): Astryx Breadcrumbs with the current page as plain text. */
export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean).slice(1);
  if (parts.length === 0) return null;
  return (
    <div className={styles.breadcrumbs}>
      <Breadcrumbs label="مسیر صفحه" variant="supporting">
        <BreadcrumbItem href="/admin">مدیریت</BreadcrumbItem>
        {parts.map((part, index) => {
          const href = `/admin/${parts.slice(0, index + 1).join("/")}`;
          const last = index === parts.length - 1;
          const label = labels[part] ?? (last ? "جزئیات" : part);
          return last
            ? <BreadcrumbItem key={href} isCurrent>{label}</BreadcrumbItem>
            : <BreadcrumbItem key={href} href={href}>{label}</BreadcrumbItem>;
        })}
      </Breadcrumbs>
    </div>
  );
}
