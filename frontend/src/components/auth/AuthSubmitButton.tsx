"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

/**
 * Submit control for the login and registration server actions. While the
 * action is pending the button is disabled and announces progress, so a slow
 * response cannot produce a second submission. There is no automatic retry.
 */
export function AuthSubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" isLoading={pending} loadingText={pendingLabel}>{label}</Button>;
}
