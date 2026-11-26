import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { PortalHeader } from "@/components/account/PortalHeader";
import { Button } from "@/components/ui";
import styles from "@/components/account/PortalPage.module.css";

export const instant = false;

const quick = [
  ["01", "درخواست‌های من", "/account/inquiries", "فهرست درخواست‌ها، وضعیت فعلی و تاریخچه بررسی را مشاهده کنید."],
  ["02", "درخواست تازه", "/inquiry", "از بین چهار مسیر مصوب، فرم مناسب نیاز خود را انتخاب کنید."],
] as const;

/*
 * Customer overview (OpenSpec change rebuild-ui-with-astryx, task 7.1): Astryx
 * header, a brand hero Card on an always-dark surface, two stretched-link
 * Cards and a private-data note. Facts only: no quotation, price or lead time.
 */
export default function AccountPage() {
  return (
    <VStack as="section" gap={5} className={styles.page}>
      <PortalHeader eyebrow="پنل مشتری / نمای کلی" title="مدیریت درخواست‌ها، ساده و شفاف" lead="از اینجا می‌توانید درخواست جدید ثبت کنید، وضعیت درخواست‌های قبلی را ببینید و تاریخچه هر مورد را دنبال کنید." />
      <section aria-labelledby="portal-start-title">
        <Card padding={0} elevation="med" className={styles.hero} data-toranj-surface="inverse">
          <VStack gap={2} hAlign="start" className={styles.heroCopy}>
            <Text as="p" type="supporting" weight="bold" color="inherit">شروع سریع</Text>
            <Heading level={2} id="portal-start-title" color="inherit" className={styles.heroTitle}>برای محصول، خدمات تزریق یا مواد اولیه درخواست دارید؟</Heading>
            <Text as="p" color="inherit">نوع درخواست را انتخاب کنید و فقط اطلاعاتی را وارد کنید که از آن مطمئن هستید.</Text>
          </VStack>
          <div className={styles.heroAction}><Button href="/inquiry" variant="primary">ثبت درخواست جدید</Button></div>
        </Card>
      </section>
      <Grid columns={2} gap={4} className={styles.quickGrid}>
        {quick.map(([index, title, href, description]) => (
          <Card key={href} elevation="low" className={styles.quickCard}>
            <VStack gap={6} height="100%">
              <HStack gap={3} vAlign="start" hAlign="between" aria-hidden="true">
                <Text as="span" type="supporting" weight="bold" className={styles.quickIndex}>{index}</Text>
                <Text as="span" color="secondary">←</Text>
              </HStack>
              <VStack gap={2} hAlign="start">
                <Heading level={2} color="inherit" className={styles.quickTitle}><Link href={href} color="inherit" type="inherit" className={styles.cardLink}>{title}</Link></Heading>
                <Text as="p" color="secondary">{description}</Text>
              </VStack>
            </VStack>
          </Card>
        ))}
      </Grid>
      <Card variant="muted">
        <HStack gap={3} vAlign="center">
          <span className={styles.privacyDot} aria-hidden="true" />
          <Text as="p" type="supporting" color="secondary">اطلاعات حساب و درخواست‌ها خصوصی است و فقط در نشست معتبر شما نمایش داده می‌شود.</Text>
        </HStack>
      </Card>
    </VStack>
  );
}
