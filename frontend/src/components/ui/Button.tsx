"use client";

import { Button as AstryxButton } from "@astryxdesign/core/Button";
import { Children, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  href?: string;
  target?: string;
  rel?: string;
  /** Lets a long label wrap onto more lines instead of ending in an ellipsis; the 44px minimum target stays. */
  wrapLabel?: boolean;
}

function accessibleText(children: ReactNode): string {
  return Children.toArray(children)
    .filter((child): child is string | number => typeof child === "string" || typeof child === "number")
    .join(" ")
    .trim();
}

export function Button({
  variant = "primary",
  isLoading = false,
  loadingText = "در حال انجام…",
  disabled,
  href,
  target,
  rel,
  wrapLabel = false,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const visibleLabel = accessibleText(children);
  const label = isLoading ? loadingText : (typeof props["aria-label"] === "string" ? props["aria-label"] : visibleLabel);
  const nativeDisabled = disabled || isLoading;
  const classNames = [wrapLabel ? styles.wrapLabel : undefined, className].filter(Boolean).join(" ") || undefined;

  return (
    <AstryxButton
      {...props}
      {...{ disabled: nativeDisabled }}
      label={label || "عملیات"}
      variant={variant === "danger" ? "destructive" : variant}
      type={type}
      className={classNames}
      isDisabled={nativeDisabled}
      isLoading={isLoading}
      href={href}
      target={target}
      rel={rel}
    >{isLoading ? loadingText : children}</AstryxButton>
  );
}
