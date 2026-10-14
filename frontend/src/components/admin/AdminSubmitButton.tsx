"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Button, type ButtonVariant } from "@/components/ui";

export function AdminSubmitButton({ children, pendingText = "در حال انجام…", variant = "primary" }: { children: ReactNode; pendingText?: string; variant?: ButtonVariant }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant={variant} isLoading={pending} disabled={pending} loadingText={pendingText}>{children}</Button>;
}
