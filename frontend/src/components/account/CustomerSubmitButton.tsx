"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

export function CustomerSubmitButton({ children, pendingText }: { children: string; pendingText: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" isLoading={pending} disabled={pending} loadingText={pendingText}>{children}</Button>;
}
