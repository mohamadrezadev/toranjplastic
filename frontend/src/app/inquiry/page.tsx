import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { InquiryHeader } from "./InquiryHeader";
import styles from "./Inquiry.module.css";

const choices = [
  ["product", "استعلام محصول", "محصول منتشرشده را انتخاب و مقدار تقریبی را اعلام کنید."],
  ["injection", "خدمات تزریق پلاستیک", "شرح قطعه، وضعیت قالب و اطلاعاتی را که می‌دانید وارد کنید."],
  ["material", "تأمین مواد اولیه", "نوع درخواست و نام تقریبی ماده یا پلیمر را ثبت کنید."],
  ["contact", "تماس عمومی", "برای موضوع‌های دیگر یک درخواست عمومی بفرستید."],
] as const;

/*
 * Inquiry type chooser (OpenSpec change rebuild-ui-with-astryx, task 6.2).
 * Four Astryx Cards in a Grid; each title is the named Astryx Link and a
 * stretched pseudo-element (.choiceLink) makes the whole card a pointer
 * target, so the accessible name stays the short title and the keyboard stop
 * count stays four.
 */
export default function InquiryPage() {
  return (
    <VStack as="section" gap={5} className={styles.page}>
      <InquiryHeader eyebrow="پنل مشتری / درخواست جدید" title="چه نوع درخواستی دارید؟" lead="مسیر مناسب را انتخاب کنید تا فقط اطلاعات مرتبط با نیاز شما نمایش داده شود." />
      <Grid columns={2} gap={4} className={styles.choiceGrid}>
        {choices.map(([type, title, description], index) => (
          <Card key={type} elevation="low" className={styles.choiceCard}>
            <VStack gap={6} height="100%">
              <HStack gap={3} vAlign="start" hAlign="between" aria-hidden="true">
                <Text as="span" type="supporting" weight="bold" className={styles.choiceIndex}>0{index + 1}</Text>
                <Text as="span" color="secondary" className={styles.choiceArrow}>←</Text>
              </HStack>
              <VStack gap={2} hAlign="start">
                <Heading level={2} color="inherit" className={styles.choiceTitle}>
                  <Link href={`/inquiry/${type}`} color="inherit" type="inherit" className={styles.choiceLink}>{title}</Link>
                </Heading>
                <Text as="p" color="secondary">{description}</Text>
              </VStack>
            </VStack>
          </Card>
        ))}
      </Grid>
    </VStack>
  );
}

export const instant = false;
