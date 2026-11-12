import { Banner } from "@astryxdesign/core/Banner";
import { VStack } from "@astryxdesign/core/VStack";
import type { ReactNode } from "react";

export type AlertVariant = "info" | "success" | "warning" | "danger";
const labels: Record<AlertVariant, string> = { info: "اطلاع", success: "موفق", warning: "هشدار", danger: "خطا" };

export function Alert({ variant = "info", title, children }: { variant?: AlertVariant; title: string; children?: ReactNode }) {
  return <VStack
    gap={0}
    role={variant === "danger" ? "alert" : "status"}
    aria-label={labels[variant]}
    aria-live={variant === "danger" ? "assertive" : "polite"}
  >
    <Banner
      status={variant === "danger" ? "error" : variant}
      title={title}
      description={children}
    />
  </VStack>;
}
