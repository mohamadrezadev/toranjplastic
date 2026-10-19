import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
}

export function Button({
  variant = "primary",
  isLoading = false,
  loadingText = "در حال انجام…",
  disabled,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      <span className={isLoading ? styles.contentHidden : undefined} aria-hidden={isLoading || undefined}>
        {children}
      </span>
      {isLoading ? <span className={styles.loadingLabel} role="status" aria-live="polite">{loadingText}</span> : null}
    </button>
  );
}
