import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { AdminSection } from "@/components/admin/AdminContent";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { Alert } from "@/components/feedback";
import { Button, Checkbox, StatusBadge, type StatusBadgeTone } from "@/components/ui";
import { formatQuotationDate } from "@/lib/quotation-date";
import {
  reviseQuotationAction,
  saveQuotationDraftAction,
  sendQuotationAction,
} from "./actions";
import { adminQuotationPdfUrl } from "./api";
import { QuotationEditor } from "./QuotationEditor";
import type { Quotation } from "./types";
import styles from "./Quotation.module.css";
const money = (value: string) =>
  `${new Intl.NumberFormat("fa-IR").format(BigInt(value))} ریال`;

const statusLabel = (status: Quotation["status"]) => {
  switch (status) {
    case "SENT":
      return "جاری";
    case "ACCEPTED":
      return "پذیرفته‌شده توسط مشتری";
    case "REJECTED":
      return "ردشده توسط مشتری";
    case "SUPERSEDED":
    default:
      return "جایگزین‌شده";
  }
};

const statusTone = (status: Quotation["status"]): StatusBadgeTone =>
  status === "ACCEPTED" ? "success" : status === "REJECTED" ? "error" : status === "SENT" ? "info" : "neutral";

/*
 * Staff quotation block (OpenSpec change rebuild-ui-with-astryx, task 8.4):
 * the sent and answered versions (number, version, state, total, validity,
 * private PDF), then the one current action: edit and send the draft, create a
 * revision of a sent or rejected document, or start a new draft. Prices are
 * always entered by hand; nothing here reads a catalog or implies a purchase.
 * Server actions, version parameters and the lock-on-send confirmation are
 * unchanged.
 */
export function QuotationPanel({
  inquiryId,
  inquiryVersion,
  quotations,
}: {
  inquiryId: string;
  inquiryVersion: number;
  quotations: Quotation[];
}) {
  const draft = quotations.find((item) => item.status === "DRAFT");
  const currentSent = quotations.find((item) => item.status === "SENT");
  const latestActionable = quotations.find(
    (item) => item.status === "SENT" || item.status === "REJECTED",
  );
  const visible = quotations.filter((item) => item.status !== "DRAFT");
  const save = saveQuotationDraftAction.bind(
    null,
    inquiryId,
    draft?.id ?? null,
  );
  return (
    <AdminSection
      title="پیشنهاد قیمت"
      id="quotation-title"
      eyebrow="قیمت‌گذاری دستی و نسخه‌دار"
      badge={currentSent ? <StatusBadge label="نسخه جاری ارسال شده" tone="success" /> : undefined}
    >
      {visible.length ? (
        <VStack gap={3} role="list" aria-label="نسخه‌های ارسال‌شده">
          {visible.map((quotation) => (
            <Card key={quotation.id} variant="muted" role="listitem">
              <HStack gap={3} hAlign="between" vAlign="center" wrap="wrap">
                <VStack gap={1} hAlign="start" className={styles.versionMain}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text as="span" weight="bold" color="inherit">{quotation.quotationNumber}</Text>
                    <Text as="span" type="supporting" color="secondary">نسخه {quotation.version.toLocaleString("fa-IR")}</Text>
                    <StatusBadge label={statusLabel(quotation.status)} tone={statusTone(quotation.status)} />
                  </HStack>
                  {quotation.respondedAt ? (
                    <Text as="span" type="supporting" color="secondary">
                      پاسخ در {formatQuotationDate(quotation.respondedAt)}
                      {quotation.rejectionReason ? ` (علت: ${quotation.rejectionReason})` : ""}
                    </Text>
                  ) : null}
                </VStack>
                <VStack gap={1} hAlign="start">
                  <Text as="span" weight="bold" color="inherit" dir="ltr">{money(quotation.totalRials)}</Text>
                  <Text as="span" type="supporting" color="secondary">اعتبار تا {formatQuotationDate(quotation.validUntil)}</Text>
                </VStack>
                <Button href={adminQuotationPdfUrl(inquiryId, quotation.id)} target="_blank" rel="noreferrer" variant="secondary">
                  دریافت PDF خصوصی
                </Button>
              </HStack>
            </Card>
          ))}
        </VStack>
      ) : (
        <Alert variant="info" title="هنوز پیشنهاد قیمتی ارسال نشده است. این وضعیت هیچ تعهد قیمت، موجودی یا زمان تحویل ایجاد نمی‌کند." />
      )}
      {draft ? (
        <>
          <QuotationEditor draft={draft} action={save} />
          <Card variant="muted" className={styles.confirmCard}>
            <form action={sendQuotationAction.bind(null, inquiryId, draft.id)}>
              <input type="hidden" name="expectedVersion" value={draft.editVersion} />
              <input type="hidden" name="inquiryExpectedVersion" value={inquiryVersion} />
              <VStack gap={3} hAlign="start">
                <Checkbox
                  name="confirm"
                  value="yes"
                  required
                  label="مقادیر، شرایط و نسخه را بازبینی کرده‌ام و ارسال باعث قفل‌شدن این نسخه می‌شود."
                />
                <AdminSubmitButton pendingText="در حال ارسال…">تأیید و ارسال برای مشتری</AdminSubmitButton>
              </VStack>
            </form>
          </Card>
        </>
      ) : latestActionable ? (
        <Card variant="muted" className={styles.confirmCard}>
          <form action={reviseQuotationAction.bind(null, inquiryId, latestActionable.id)}>
            <input type="hidden" name="expectedVersion" value={latestActionable.editVersion} />
            <VStack gap={3} hAlign="start">
              <Text as="p" color="secondary">
                برای اصلاح سند {latestActionable.status === "REJECTED" ? "ردشده" : "ارسال‌شده"}، نسخه جدیدی از snapshot فعلی ساخته می‌شود.
              </Text>
              <AdminSubmitButton pendingText="در حال ساخت…">ایجاد نسخه اصلاحی</AdminSubmitButton>
            </VStack>
          </form>
        </Card>
      ) : (
        <QuotationEditor action={save} />
      )}
    </AdminSection>
  );
}
