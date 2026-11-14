import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import styles from "./Inquiry.module.css";

/*
 * Page header of the inquiry surface (OpenSpec change rebuild-ui-with-astryx,
 * task 6.2): eyebrow, the page's one level-one heading and a lead sentence as
 * Astryx Text and Heading, shared by the type chooser and the guided form.
 */
export function InquiryHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <VStack as="header" gap={2} hAlign="start" className={styles.pageHeader}>
      <Text as="p" type="supporting" weight="bold" className={styles.eyebrow}>{eyebrow}</Text>
      <Heading level={1} color="inherit" className={styles.title}>{title}</Heading>
      <Text as="p" color="secondary" className={styles.lead}>{lead}</Text>
    </VStack>
  );
}
