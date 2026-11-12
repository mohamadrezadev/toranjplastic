"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

export function LogoutSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="secondary" isLoading={pending} loadingText="در حال خروج…">{label}</Button>;
}
