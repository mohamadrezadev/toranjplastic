import { BreadcrumbItem, Breadcrumbs } from "@astryxdesign/core/Breadcrumbs";
import type { PublicPath } from "@/design-system/routes";
import styles from "./Navigation.module.css";

export function Breadcrumb({ items }: { items: ReadonlyArray<{ label: string; href?: PublicPath }> }) {
  return (
    <div className={`${styles.breadcrumb} content-container`}>
      <Breadcrumbs label="مسیر صفحه" variant="supporting">
        {items.map((item, index) => (
          <BreadcrumbItem key={`${item.label}-${index}`} href={item.href} isCurrent={!item.href}>{item.label}</BreadcrumbItem>
        ))}
      </Breadcrumbs>
    </div>
  );
}
