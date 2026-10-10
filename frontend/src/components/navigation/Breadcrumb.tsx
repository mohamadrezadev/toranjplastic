import Link from "next/link";
import type { PublicPath } from "@/design-system/routes";
import styles from "./Navigation.module.css";

export function Breadcrumb({ items }: { items: ReadonlyArray<{ label: string; href?: PublicPath }> }) {
  return <nav className={`${styles.breadcrumb} content-container`} aria-label="مسیر صفحه"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}
