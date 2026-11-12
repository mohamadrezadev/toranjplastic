import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Heading, Text } from "@astryxdesign/core/Text";
import { InquiryPageHeader } from "./InquiryPageHeader";
import styles from "./Inquiry.module.css";

const choices = [
  ["product", "استعلام محصول", "محصول منتشرشده را انتخاب و مقدار تقریبی را اعلام کنید."],
  ["injection", "خدمات تزریق پلاستیک", "شرح قطعه، وضعیت قالب و اطلاعاتی را که می‌دانید وارد کنید."],
  ["material", "تأمین مواد اولیه", "نوع درخواست و نام تقریبی ماده یا پلیمر را ثبت کنید."],
  ["contact", "تماس عمومی", "برای موضوع‌های دیگر یک درخواست عمومی بفرستید."],
] as const;

export default function InquiryPage() {
  return <section className={styles.page}>
    <InquiryPageHeader eyebrow="پنل مشتری / درخواست جدید" title="چه نوع درخواستی دارید؟" lead="مسیر مناسب را انتخاب کنید تا فقط اطلاعات مرتبط با نیاز شما نمایش داده شود." />
    <ul className={styles.choiceGrid}>
      {choices.map(([type, title, description], index) => <li key={type}>
        <ClickableCard href={`/inquiry/${type}`} label={title} padding={5} elevation="low" height="100%" className={styles.choiceCard}>
          <span className={styles.choiceTop} aria-hidden="true">
            <span className={styles.choiceIndex}>0{index + 1}</span>
            <span className={styles.choiceArrow}>←</span>
          </span>
          <span className={styles.choiceBody}>
            <Heading level={2} className={styles.choiceTitle}>{title}</Heading>
            <Text as="p" color="secondary" size="sm">{description}</Text>
          </span>
        </ClickableCard>
      </li>)}
    </ul>
  </section>;
}

export const instant = false;
