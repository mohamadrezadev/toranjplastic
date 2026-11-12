import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import styles from "./Inquiry.module.css";

export function InquiryPageHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return <header>
    <VStack gap={2}>
      <Text type="label" weight="bold" color="accent">{eyebrow}</Text>
      <Heading level={1} className={styles.title}>{title}</Heading>
      <Text as="p" color="secondary" className={styles.lead}>{lead}</Text>
    </VStack>
  </header>;
}
