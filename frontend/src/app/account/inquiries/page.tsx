import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { PortalHeader } from "@/components/account/PortalHeader";
import { formatInquiryDay, inquiryStatusLabel, inquiryStatusTone, inquiryTypeLabel } from "@/components/account/inquiry-labels";
import { EmptyState } from "@/components/feedback";
import { Button, Select, StatusBadge } from "@/components/ui";
import { listInquiries, inquiryStatuses, inquiryTypes } from "@/lib/inquiries";
import styles from "@/components/account/PortalPage.module.css";

export const instant = false;

/*
 * Owned request list (OpenSpec change rebuild-ui-with-astryx, task 7.1). The
 * filter stays a plain GET form (it works without client script); each row is
 * an Astryx Card whose title is the named Link, stretched over the card, with
 * the approved status label as a StatusBadge and the date as <time>.
 */
export default async function InquiryListPage({ searchParams }: { searchParams: Promise<{ type?: string; status?: string }> }) {
  const filters = await searchParams;
  const result = await listInquiries(filters);
  return (
    <VStack as="section" gap={5} className={styles.page}>
      <PortalHeader eyebrow="پنل مشتری / پیگیری" title="درخواست‌های من" lead="درخواست‌ها را بر اساس نوع یا وضعیت پیدا کنید و جزئیات هر مورد را ببینید." action={<Button href="/inquiry" variant="primary">درخواست جدید</Button>} />
      <Card className={styles.panel}>
        <form className={styles.filters} aria-label="فیلتر درخواست‌ها">
          <Select label="نوع درخواست" name="type" defaultValue={filters.type ?? ""}>
            <option value="">همه نوع‌ها</option>
            {inquiryTypes.map((value) => <option key={value} value={value}>{inquiryTypeLabel[value]}</option>)}
          </Select>
          <Select label="وضعیت پیگیری" name="status" defaultValue={filters.status ?? ""}>
            <option value="">همه وضعیت‌ها</option>
            {inquiryStatuses.map((value) => <option key={value} value={value}>{inquiryStatusLabel[value]}</option>)}
          </Select>
          <Button type="submit">اعمال فیلتر</Button>
        </form>
      </Card>
      {result.items.length ? (
        <ul className={styles.list}>
          {result.items.map((item) => (
            <li key={item.id}>
              <Card elevation="low" className={styles.listCard}>
                <HStack gap={4} vAlign="center" hAlign="between" wrap="wrap">
                  <VStack gap={1} hAlign="start" className={styles.itemMain}>
                    <Text as="span" type="supporting" color="secondary">{inquiryTypeLabel[item.type]}</Text>
                    <Link href={`/account/inquiries/${item.id}`} color="inherit" type="inherit" weight="bold" className={`${styles.cardLink} ${styles.itemName}`}>{item.catalogItemName ?? inquiryTypeLabel[item.type]}</Link>
                  </VStack>
                  <HStack gap={3} vAlign="center" wrap="wrap">
                    <StatusBadge label={inquiryStatusLabel[item.status]} tone={inquiryStatusTone(item.status)} />
                    <Text as="span" type="supporting" color="secondary" className={styles.date}><time dateTime={item.createdAt}>{formatInquiryDay(item.createdAt)}</time></Text>
                  </HStack>
                </HStack>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="درخواستی با این شرایط پیدا نشد" description="فیلترها را تغییر دهید یا برای شروع یک درخواست تازه ثبت کنید." action={{ label: "ثبت درخواست جدید", href: "/inquiry" }} />
      )}
    </VStack>
  );
}
