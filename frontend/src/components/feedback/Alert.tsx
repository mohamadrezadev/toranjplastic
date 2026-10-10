import type { ReactNode } from "react";
import styles from "./Feedback.module.css";

export type AlertVariant = "info" | "success" | "warning" | "danger";
const icons: Record<AlertVariant, string> = { info: "i", success: "✓", warning: "!", danger: "×" };
const labels: Record<AlertVariant, string> = { info: "اطلاع", success: "موفق", warning: "هشدار", danger: "خطا" };

export function Alert({ variant = "info", title, children }: { variant?: AlertVariant; title: string; children?: ReactNode }) {
  return <div className={[styles.surface, styles[variant]].join(" ")} role={variant === "danger" ? "alert" : "status"} aria-live={variant === "danger" ? "assertive" : "polite"}>
    <span className={styles.icon} aria-label={labels[variant]}>{icons[variant]}</span>
    <div className={styles.content}><p className={styles.title}>{title}</p>{children ? <div className={styles.description}>{children}</div> : null}</div>
  </div>;
}
