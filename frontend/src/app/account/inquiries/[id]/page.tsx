import { notFound } from "next/navigation";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { CustomerSubmitButton } from "@/components/account/CustomerSubmitButton";
import { CustomerQuotations } from "@/components/account/CustomerQuotations";
import { formatInquiryDate, inquiryStatusLabel, inquiryStatusTone, inquiryTypeLabel } from "@/components/account/inquiry-labels";
import { Alert } from "@/components/feedback";
import { Button, StatusBadge, Textarea } from "@/components/ui";
import { getInquiry, InquiryApiError } from "@/lib/inquiries";
import { listCustomerQuotations } from "@/lib/customer-quotations";
import {
  acceptCustomerQuotationAction,
  addCustomerInquiryMessageAction,
  rejectCustomerQuotationAction,
} from "./actions";
import styles from "@/components/account/PortalPage.module.css";

const terminalStatuses = new Set(["COMPLETED", "REJECTED", "CANCELLED"]);

export const instant = false;

/*
 * Owned request detail (OpenSpec change rebuild-ui-with-astryx, tasks 7.1 and
 * 7.2). Astryx Cards group the header, submitted data (MetadataList), the
 * quotation block, the conversation and the status history. Result banners are
 * the shared Alert (polite status or assertive alert). The conversation is
 * chronological and append-only, each message a Card marked with its sender;
 * the composer is a separate muted Card with its own heading, a labelled
 * Textarea and a submit action that disables itself while pending.
 */
export default async function InquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    created?: string;
    success?: string;
    error?: string;
    conflict?: string;
  }>;
}) {
  const { id } = await params;
  let item;
  try {
    item = await getInquiry(id);
  } catch (error) {
    if (error instanceof InquiryApiError && error.status === 404) notFound();
    throw error;
  }
  const [state, quotations] = await Promise.all([
    searchParams,
    listCustomerQuotations(id),
  ]);
  const fields = [
    ["شرح", item.description ?? item.partDescription],
    ["مقدار تقریبی", item.approximateQuantity],
    ["شهر تحویل", item.deliveryCity],
    ["زمان موردنیاز", item.requestedTiming],
    ["ماده/پلیمر", item.polymerName ?? item.materialName],
    ["گرید", item.grade],
    ["برند", item.brand],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const messageAction = addCustomerInquiryMessageAction.bind(null, item.id);
  const canMessage = !terminalStatuses.has(item.status);

  return (
    <VStack as="section" gap={5} className={styles.page}>
      {state.created ? <Alert variant="success" title="درخواست شما ثبت شد و در صف بررسی قرار دارد." /> : null}
      {state.success === "message" ? <Alert variant="success" title="پیام شما برای کارشناس ثبت شد." /> : null}
      {state.success === "accepted" ? <Alert variant="success" title="پیشنهاد قیمت با موفقیت پذیرفته شد و سفارش در مرحله انجام قرار گرفت." /> : null}
      {state.success === "rejected" ? <Alert variant="success" title="پیشنهاد قیمت رد شد و درخواست برای بررسی و اصلاح به کارشناس بازگردانده شد." /> : null}
      {state.conflict === "quotation" ? (
        <Alert variant="danger" title="نسخه پیشنهاد قیمت یا وضعیت درخواست تغییر کرده یا منقضی شده است. صفحه را تازه‌سازی کنید و آخرین وضعیت را بررسی فرمایید.">
          {/* An explicit refresh, never an automatic retry: it reloads this request without the conflict marker. */}
          <Button href={`/account/inquiries/${item.id}`} variant="secondary">تازه‌سازی و دیدن آخرین وضعیت</Button>
        </Alert>
      ) : null}
      {state.error === "accept" ? <Alert variant="danger" title="پذیرش پیشنهاد قیمت انجام نشد. صفحه را تازه‌سازی و دوباره تلاش کنید." /> : null}
      {state.error === "reject" ? <Alert variant="danger" title="رد پیشنهاد قیمت انجام نشد. صفحه را تازه‌سازی و دوباره تلاش کنید." /> : null}
      {state.error && state.error !== "accept" && state.error !== "reject" ? <Alert variant="danger" title="ارسال پیام انجام نشد. صفحه را تازه‌سازی و دوباره تلاش کنید." /> : null}
      <div><Button href="/account/inquiries" variant="secondary">بازگشت به درخواست‌ها</Button></div>
      <Card elevation="low" className={styles.detailHeader}>
        <HStack as="header" gap={4} vAlign="center" hAlign="between" wrap="wrap">
          <VStack gap={2} hAlign="start" className={styles.headerCopy}>
            <Text as="p" type="supporting" weight="bold" className={styles.eyebrow}>جزئیات درخواست / {inquiryTypeLabel[item.type]}</Text>
            <Heading level={1} color="inherit" className={`${styles.title} ${styles.detailTitle}`}>{item.catalogItemName ?? "درخواست مشتری"}</Heading>
            <Text as="p" type="supporting" color="secondary">ثبت در {formatInquiryDate(item.createdAt)}</Text>
          </VStack>
          <StatusBadge label={inquiryStatusLabel[item.status]} tone={inquiryStatusTone(item.status)} />
        </HStack>
      </Card>
      <Card className={styles.panel}>
        <VStack as="section" gap={4} aria-labelledby="submitted-data-title">
          <Heading level={2} id="submitted-data-title" color="inherit" className={styles.sectionTitle}>اطلاعات ثبت‌شده</Heading>
          {fields.length ? (
            <MetadataList className={styles.details}>
              {fields.map(([label, value]) => <MetadataListItem key={label} label={label}>{value}</MetadataListItem>)}
            </MetadataList>
          ) : (
            <Text as="p" color="secondary">برای این درخواست اطلاعات تکمیلی ثبت نشده است.</Text>
          )}
        </VStack>
      </Card>

      <CustomerQuotations
        inquiryId={item.id}
        inquiryVersion={item.version ?? 0}
        inquiryStatus={item.status}
        quotations={quotations}
        acceptAction={acceptCustomerQuotationAction}
        rejectAction={rejectCustomerQuotationAction}
      />

      <Card className={styles.panel}>
        <VStack as="section" gap={4} aria-labelledby="conversation-title">
          <Heading level={2} id="conversation-title" color="inherit" className={styles.sectionTitle}>گفتگو با کارشناس</Heading>
          <VStack gap={3} className={styles.conversation}>
            {item.messages.length ? (
              item.messages.map((message) => (
                <Card role="article" key={message.id} variant={message.senderType === "CUSTOMER" ? "blue" : "muted"} className={styles.message} data-sender={message.senderType}>
                  <VStack gap={2} hAlign="start">
                    <HStack gap={2} hAlign="between" wrap="wrap" width="100%">
                      <Text as="span" weight="bold" color="inherit">{message.senderType === "CUSTOMER" ? "شما" : "کارشناس ترنج"}</Text>
                      <Text as="span" type="supporting" color="secondary"><time dateTime={message.createdAt}>{formatInquiryDate(message.createdAt)}</time></Text>
                    </HStack>
                    <Text as="p" className={styles.messageText}>{message.text}</Text>
                  </VStack>
                </Card>
              ))
            ) : (
              <Text as="p" color="secondary">هنوز پیامی در این گفتگو ثبت نشده است.</Text>
            )}
          </VStack>
          {canMessage ? (
            <Card variant="muted" className={styles.composer}>
              <form action={messageAction} aria-labelledby="composer-title">
                <VStack gap={3} hAlign="start">
                  <Heading level={3} id="composer-title" color="inherit" className={styles.sectionTitle}>پیام جدید</Heading>
                  <Textarea label="پیام شما" name="text" required maxLength={4000} helpText="اطلاعات موردنیاز را بدون درج رمز یا اطلاعات بانکی ارسال کنید." />
                  <CustomerSubmitButton pendingText="در حال ارسال…">ارسال پیام</CustomerSubmitButton>
                </VStack>
              </form>
            </Card>
          ) : (
            <Text as="p" color="secondary">این درخواست بسته شده و امکان ارسال پیام جدید ندارد.</Text>
          )}
        </VStack>
      </Card>

      <Card className={styles.panel}>
        <VStack as="section" gap={4} aria-labelledby="status-history-title">
          <Heading level={2} id="status-history-title" color="inherit" className={styles.sectionTitle}>تاریخچه وضعیت</Heading>
          <ol className={styles.timeline}>
            {item.statusHistory.map((history) => (
              <li key={history.id}>
                <Text as="span" weight="bold" color="inherit" className={styles.sectionTitle}>{inquiryStatusLabel[history.toStatus]}</Text>
                <Text as="span" type="supporting" color="secondary"><time dateTime={history.createdAt}>{formatInquiryDate(history.createdAt)}</time></Text>
              </li>
            ))}
          </ol>
        </VStack>
      </Card>
    </VStack>
  );
}
