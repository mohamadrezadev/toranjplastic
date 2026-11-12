"use client";

import { Button as AstryxButton } from "@astryxdesign/core/Button";
import { Children, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  href?: string;
  target?: string;
  rel?: string;
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
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const visibleLabel = accessibleText(children);
  const label = isLoading ? loadingText : (typeof props["aria-label"] === "string" ? props["aria-label"] : visibleLabel);
  const nativeDisabled = disabled || isLoading;

  return (
    <AstryxButton
      {...props}
      {...{ disabled: nativeDisabled }}
      label={label || "عملیات"}
      variant={variant === "danger" ? "destructive" : variant}
      type={type}
      className={className}
      isDisabled={nativeDisabled}
      isLoading={isLoading}
      href={href}
      target={target}
      rel={rel}
    >{isLoading ? loadingText : children}</AstryxButton>
  );
}
