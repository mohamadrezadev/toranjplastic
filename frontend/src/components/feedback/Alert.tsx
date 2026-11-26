import { Banner } from "@astryxdesign/core/Banner";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/VStack";
import type { ReactNode } from "react";
import styles from "./Alert.module.css";

export type AlertVariant = "info" | "success" | "warning" | "danger";
export type AlertHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
const labels: Record<AlertVariant, string> = { info: "اطلاع", success: "موفق", warning: "هشدار", danger: "خطا" };

/*
 * `headingLevel` is opt-in. Without it the title is the Banner's plain title
 * text, exactly as before, so every existing caller renders the same markup.
 * With it the title is a real heading of that level (a whole-page state such as
 * the public content error screen passes 1, so the page has an outline), drawn
 * in the Banner title's own type (.heading), not in the heading-level scale.
 */
export function Alert({ variant = "info", title, headingLevel, children }: { variant?: AlertVariant; title: string; headingLevel?: AlertHeadingLevel; children?: ReactNode }) {
  return <VStack
    gap={0}
    role={variant === "danger" ? "alert" : "status"}
    aria-label={labels[variant]}
    aria-live={variant === "danger" ? "assertive" : "polite"}
  >
    <Banner
      status={variant === "danger" ? "error" : variant}
      title={headingLevel ? <Heading level={headingLevel} color="inherit" className={styles.heading}>{title}</Heading> : title}
      description={children}
    />
  </VStack>;
}
