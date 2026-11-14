import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { ReactNode } from "react";
import styles from "./PortalPage.module.css";

/*
 * Page header of the customer portal (OpenSpec change rebuild-ui-with-astryx,
 * task 7.1): eyebrow, the page's one level-one heading, a lead sentence and an
 * optional action, as Astryx Heading, Text and HStack.
 */
export function PortalHeader({ eyebrow, title, lead, action }: { eyebrow: string; title: string; lead?: string; action?: ReactNode }) {
  return (
    <HStack as="header" gap={4} vAlign="end" hAlign="between" wrap="wrap" className={styles.pageHeader}>
      <VStack gap={2} hAlign="start" className={styles.headerCopy}>
        <Text as="p" type="supporting" weight="bold" className={styles.eyebrow}>{eyebrow}</Text>
        <Heading level={1} color="inherit" className={styles.title}>{title}</Heading>
        {lead ? <Text as="p" color="secondary" className={styles.lead}>{lead}</Text> : null}
      </VStack>
      {action}
    </HStack>
  );
}
