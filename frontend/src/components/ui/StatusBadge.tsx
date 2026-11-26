import { Badge } from "@astryxdesign/core/Badge";
import type { ReactNode } from "react";

export type StatusBadgeTone = "neutral" | "info" | "success" | "warning" | "error";

export interface StatusBadgeProps {
  label: ReactNode;
  tone?: StatusBadgeTone;
}

/** Read-only status indicator. Domain status-to-tone mapping stays at the call site. */
export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return <Badge label={label} variant={tone} />;
}
