import Link from "next/link";
import type { ReactNode } from "react";
import type { PublicPath } from "@/design-system/routes";
import styles from "./Navigation.module.css";

export function ActionLink({ href, children, emphasis = "secondary", className }: { href: PublicPath; children: ReactNode; emphasis?: "primary" | "secondary"; className?: string }) {
  return <Link className={[styles.action, emphasis === "primary" ? styles.actionPrimary : undefined, className].filter(Boolean).join(" ")} href={href}>{children}</Link>;
}
