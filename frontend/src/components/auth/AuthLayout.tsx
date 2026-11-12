import { Card } from "@astryxdesign/core/Card";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { ReactNode } from "react";
import { AuthShowcase } from "./AuthShowcase";
import styles from "./Auth.module.css";

interface AuthLayoutProps {
  /** Short breadcrumb-like context line above the heading. */
  eyebrow: string;
  title: string;
  titleId: string;
  intro?: ReactNode;
  /** Server-derived feedback (error/success) rendered above the form. */
  feedback?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Status screens (authorization failure, unavailable) omit the brand panel. */
  hasShowcase?: boolean;
}

/**
 * Split authentication frame adapted from the Astryx `login-split` template:
 * one Astryx Card holding the Toranj brand panel and the form section. The
 * template's sample SSO buttons, remember-me checkbox and simulated submit
 * are not copied; authentication stays a server action.
 */
export function AuthLayout({ eyebrow, title, titleId, intro, feedback, children, footer, hasShowcase = true }: AuthLayoutProps) {
  return <main className={styles.main}>
    <Card padding={0} elevation="med" className={styles.layout} data-showcase={hasShowcase ? "true" : "false"}>
      {hasShowcase ? <AuthShowcase /> : null}
      <section className={styles.card} aria-labelledby={titleId}>
        <VStack gap={5}>
          <Text type="label" weight="bold" color="accent">{eyebrow}</Text>
          <VStack gap={2}>
            <Heading level={1} id={titleId} className={styles.title}>{title}</Heading>
            {intro ? <Text as="p" color="secondary">{intro}</Text> : null}
          </VStack>
          {feedback}
          {children}
          {footer ? <Text as="p" color="secondary" size="sm">{footer}</Text> : null}
        </VStack>
      </section>
    </Card>
  </main>;
}
