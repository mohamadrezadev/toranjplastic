import type { HTMLAttributes } from "react";

export function DirectionalData({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} dir="ltr" className={["ltr-data", className].filter(Boolean).join(" ")} />;
}
