import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { ReactNode } from "react";
import { AuthShowcase } from "./AuthShowcase";
import styles from "./Auth.module.css";

/*
 * Authentication presentation (OpenSpec change rebuild-ui-with-astryx, task
 * 6.1). An Astryx Card holds the brand showcase and the form panel; headings,
 * supporting text and feedback are Astryx components, while the brand art
 * stays Toranj CSS. The pages remain Server Components: only serialisable
 * props cross into the Astryx client components, and the forms keep their
 * native server actions.
 */
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className={styles.main}>
      <Card padding={0} elevation="med" className={styles.layout}>
        <AuthShowcase />
        {children}
      </Card>
    </main>
  );
}

export function AuthPanel({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <VStack as="section" aria-labelledby={id} gap={5} className={styles.panel}>
      <Text as="span" type="supporting" weight="bold" className={styles.formEyebrow}>{eyebrow}</Text>
      <VStack gap={2} hAlign="start">
        <Heading level={1} id={id} color="inherit" className={styles.title}>{title}</Heading>
        <Text as="p" color="secondary">{intro}</Text>
      </VStack>
      {children}
    </VStack>
  );
}

/** A whole-page status (authorization failure, panel unavailable): one level-one heading, a sentence and optional actions. */
export function AuthStatus({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <main className={styles.main}>
      <Card elevation="med" className={styles.statusCard}>
        <VStack as="section" gap={4} hAlign="start" aria-labelledby="auth-status-title">
          <Heading level={1} id="auth-status-title" color="inherit" className={styles.title}>{title}</Heading>
          <Text as="p" color="secondary">{children}</Text>
          {actions}
        </VStack>
      </Card>
    </main>
  );
}
