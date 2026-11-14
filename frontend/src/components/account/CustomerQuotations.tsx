import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { Alert } from "@/components/feedback";
import { Button, StatusBadge, Textarea, type StatusBadgeTone } from "@/components/ui";
import {
  customerQuotationPdfUrl,
  type CustomerQuotation,
} from "@/lib/customer-quotations";
import { formatQuotationDate } from "@/lib/quotation-date";
import { CustomerSubmitButton } from "./CustomerSubmitButton";
import styles from "./CustomerQuotations.module.css";

const money = (value: string) =>
  `${new Intl.NumberFormat("fa-IR").format(BigInt(value))} ریال`;

const statusText = (status: CustomerQuotation["status"]) => {
  switch (status) {
    case "SENT":
      return "نسخه جاری";
    case "ACCEPTED":
      return "پذیرفته‌شده توسط شما";
    case "REJECTED":
      return "ردشده توسط شما";
    case "SUPERSEDED":
    default:
      return "نسخه جایگزین‌شده";
  }
};

const statusTone = (status: CustomerQuotation["status"]): StatusBadgeTone =>
  status === "ACCEPTED" ? "success" : status === "REJECTED" ? "error" : status === "SENT" ? "info" : "neutral";

/*
 * Customer quotation block (OpenSpec change rebuild-ui-with-astryx, task 7.3).
 * Each version is a native <details> disclosure (it works without script and
 * keeps the open-by-default rule) inside an Astryx Card. The immutable
 * commercial summary comes first (number, version, status, validity, items,
 * totals, terms, private PDF), then the answer states as the shared Alert and
 * the explicit actions: a deliberate accept button and a separate disclosure
 * for rejecting with an optional reason. Nothing here prices, promises
 * delivery or implies a purchase; answers are never retried automatically.
 */
export function CustomerQuotations({
  inquiryId,
  inquiryVersion = 0,
  inquiryStatus,
  quotations,
  now = 0,
  acceptAction,
  rejectAction,
}: {
  inquiryId: string;
  inquiryVersion?: number;
  inquiryStatus?: string;
  quotations: CustomerQuotation[];
  now?: number;
  acceptAction?: (inquiryId: string, quotationId: string, form: FormData) => Promise<void> | void;
  rejectAction?: (inquiryId: string, quotationId: string, form: FormData) => Promise<void> | void;
}) {
  return (
    <Card className={styles.panel}>
      <VStack as="section" gap={4} aria-labelledby="customer-quotations-title">
        <VStack gap={1} hAlign="start">
          <Text as="p" type="supporting" weight="bold" className={styles.eyebrow}>اسناد تجاری خصوصی</Text>
          <Heading level={2} id="customer-quotations-title" color="inherit" className={styles.title}>پیشنهادهای قیمت</Heading>
        </VStack>
        {quotations.length ? (
          <VStack gap={3}>
            {quotations.map((quotation) => {
              const isExpired = Boolean(
                quotation.isExpired ??
                  (now && new Date(quotation.validUntil).getTime() <= now),
              );
              const canRespond = quotation.status === "SENT" && inquiryStatus === "QUOTED" && !isExpired;
              const accept = acceptAction?.bind(null, inquiryId, quotation.id);
              const reject = rejectAction?.bind(null, inquiryId, quotation.id);

              return (
                <Card key={quotation.id} padding={0} variant="muted" className={styles.card}>
                  <details open={quotation.status === "SENT" || quotation.status === "ACCEPTED"}>
                    <summary className={styles.summary}>
                      <HStack as="span" gap={2} vAlign="center" wrap="wrap">
                        <Text as="span" color="inherit">
                          <Text as="span" weight="bold" color="inherit">{quotation.quotationNumber}</Text> · نسخه{" "}
                          {quotation.version.toLocaleString("fa-IR")}
                        </Text>
                        <StatusBadge label={statusText(quotation.status)} tone={statusTone(quotation.status)} />
                      </HStack>
                      <Text as="span" weight="bold" color="inherit" dir="ltr">{money(quotation.totalRials)}</Text>
                    </summary>
                    <VStack gap={3} className={styles.body}>
                      <Text as="p" type="supporting" color="secondary">
                        اعتبار تا {formatQuotationDate(quotation.validUntil)}
                      </Text>
                      <VStack gap={1}>
                        {quotation.items.map((item) => (
                          <HStack key={item.id} gap={3} hAlign="between" wrap="wrap" className={styles.row}>
                            <Text as="span">{item.description} — {item.quantity} {item.unit}</Text>
                            <Text as="span" weight="bold" dir="ltr">{money(item.lineTotalRials)}</Text>
                          </HStack>
                        ))}
                      </VStack>
                      <MetadataList className={styles.totals}>
                        <MetadataListItem label="جمع اقلام"><span dir="ltr">{money(quotation.subtotalRials)}</span></MetadataListItem>
                        <MetadataListItem label="تخفیف"><span dir="ltr">{money(quotation.discountRials)}</span></MetadataListItem>
                        <MetadataListItem label="مالیات"><span dir="ltr">{money(quotation.taxRials)}</span></MetadataListItem>
                        <MetadataListItem label="هزینه جانبی"><span dir="ltr">{money(quotation.additionalCostRials)}</span></MetadataListItem>
                        <MetadataListItem label="مبلغ نهایی"><strong dir="ltr">{money(quotation.totalRials)}</strong></MetadataListItem>
                      </MetadataList>
                      <Text as="p"><Text as="span" weight="bold" color="inherit">شرایط تحویل:</Text> {quotation.deliveryTerms}</Text>
                      <Text as="p"><Text as="span" weight="bold" color="inherit">شرایط پرداخت:</Text> {quotation.paymentTerms}</Text>
                      {quotation.notes ? <Text as="p"><Text as="span" weight="bold" color="inherit">توضیحات:</Text> {quotation.notes}</Text> : null}
                      <div>
                        <Button href={customerQuotationPdfUrl(inquiryId, quotation.id)} target="_blank" rel="noreferrer" variant="secondary">
                          دریافت PDF خصوصی این نسخه
                        </Button>
                      </div>

                      {quotation.status === "ACCEPTED" ? (
                        <Alert variant="success" title={`این پیشنهاد قیمت در تاریخ ${formatQuotationDate(quotation.respondedAt ?? quotation.updatedAt)} توسط شما پذیرفته شد.`} />
                      ) : quotation.status === "REJECTED" ? (
                        <Alert variant="danger" title={`این پیشنهاد قیمت در تاریخ ${formatQuotationDate(quotation.respondedAt ?? quotation.updatedAt)} توسط شما رد شد.`}>
                          {quotation.rejectionReason ? <Text as="p" color="inherit">علت: {quotation.rejectionReason}</Text> : null}
                        </Alert>
                      ) : isExpired && quotation.status === "SENT" ? (
                        <Alert variant="warning" title="مهلت اعتبار این پیشنهاد قیمت به پایان رسیده است." />
                      ) : null}

                      {canRespond && accept ? (
                        <VStack gap={3} className={styles.responseSection}>
                          <form action={accept} aria-label="پذیرش پیشنهاد قیمت">
                            <input type="hidden" name="quotationVersion" value={quotation.version} />
                            <input type="hidden" name="inquiryExpectedVersion" value={inquiryVersion} />
                            <VStack gap={3} hAlign="start">
                              <Text as="p" color="secondary">با تأیید و پذیرش این پیشنهاد قیمت، سفارش وارد فرآیند اجرا می‌شود.</Text>
                              <CustomerSubmitButton pendingText="در حال ثبت پذیرش…">تأیید و پذیرش پیشنهاد قیمت</CustomerSubmitButton>
                            </VStack>
                          </form>

                          {reject ? (
                            <details className={styles.rejectDetails}>
                              <summary className={styles.rejectSummary}>رد این پیشنهاد و درخواست اصلاح</summary>
                              <form action={reject} aria-label="رد پیشنهاد قیمت" className={styles.rejectForm}>
                                <input type="hidden" name="quotationVersion" value={quotation.version} />
                                <input type="hidden" name="inquiryExpectedVersion" value={inquiryVersion} />
                                <VStack gap={3} hAlign="start">
                                  <Textarea label="علت رد پیشنهاد (اختیاری)" name="reason" maxLength={2000} placeholder="در صورت تمایل، علت عدم پذیرش یا شرایط مورد نظر خود را بنویسید..." />
                                  <CustomerSubmitButton pendingText="در حال ثبت…">ثبت رد پیشنهاد</CustomerSubmitButton>
                                </VStack>
                              </form>
                            </details>
                          ) : null}
                        </VStack>
                      ) : null}
                    </VStack>
                  </details>
                </Card>
              );
            })}
          </VStack>
        ) : (
          <Alert variant="info" title="هنوز پیشنهاد قیمتی برای این درخواست ارسال نشده است. این پیام به معنی قیمت، موجودی یا زمان تحویل قطعی نیست." />
        )}
      </VStack>
    </Card>
  );
}
