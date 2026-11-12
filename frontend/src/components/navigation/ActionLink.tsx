import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import type { PublicPath } from "@/design-system/routes";

/** Route-typed navigation action rendered through the shared Astryx-backed Button adapter. */
export function ActionLink({ href, children, emphasis = "secondary", className }: { href: PublicPath; children: ReactNode; emphasis?: "primary" | "secondary"; className?: string }) {
  return <Button href={href} variant={emphasis === "primary" ? "primary" : "secondary"} className={className}>{children}</Button>;
}
