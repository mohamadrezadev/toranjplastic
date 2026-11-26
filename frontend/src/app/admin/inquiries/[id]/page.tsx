import type { Metadata } from "next";
import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound } from "next/navigation";
import { AdminHeader, AdminSection, AdminTimeline } from "@/components/admin/AdminContent";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { inquiryStatusTone } from "@/components/account/inquiry-labels";
import { Alert, EmptyState } from "@/components/feedback";
import { Button, Checkbox, Select, StatusBadge, Textarea } from "@/components/ui";
import {
  addCustomerVisibleMessageAction,
  addInquiryNoteAction,
  AdminInquiryError,
  getAdminInquiry,
  inquiryStatusLabels,
  inquiryTypeLabels,
  listAdminAssignees,
  listAdminQuotations,
  QuotationPanel,
  updateInquiryAssignmentAction,
  updateInquiryStatusAction,
} from "@/features/admin-inquiries";
import styles from "../Inquiry.module.css";

export const metadata: Metadata = {
  title: "جزئیات استعلام",
  robots: { index: false, follow: false },
};
export const instant = false;

const errors: Record<string, string> = {
  INQUIRY_VERSION_CONFLICT:
    "این درخواست هم‌زمان تغییر کرده است. صفحه را تازه‌سازی کنید.",
  INQUIRY_INVALID_TRANSITION: "این تغییر وضعیت دیگر مجاز نیست.",
  INQUIRY_INVALID_ASSIGNEE: "مسئول انتخاب‌شده کارمند فعال و مجاز نیست.",
  INQUIRY_MESSAGE_NOT_ALLOWED: "ارسال پیام در وضعیت فعلی درخواست مجاز نیست.",
  validation: "اطلاعات واردشده معتبر نیست.",
  QUOTATION_VERSION_CONFLICT:
    "پیش‌نویس هم‌زمان تغییر کرده است؛ صفحه را تازه‌سازی کنید.",
  QUOTATION_DRAFT_EXISTS: "برای این درخواست یک پیش‌نویس فعال وجود دارد.",
  QUOTATION_TOTAL_MISMATCH: "جمع مبالغ با ردیف‌های پیشنهاد قیمت سازگار نیست.",
  quotation: "عملیات پیشنهاد قیمت انجام نشد.",
  "quotation-confirm": "پیش از ارسال، تأیید بازبینی الزامی است.",
  failed: "عملیات با خطا مواجه شد.",
};
const conflictCodes = new Set(["INQUIRY_VERSION_CONFLICT", "QUOTATION_VERSION_CONFLICT"]);
const successes: Record<string, string> = {
  status: "وضعیت درخواست به‌روزرسانی شد.",
  assignment: "مسئول درخواست به‌روزرسانی شد.",
  note: "یادداشت داخلی ثبت شد.",
  message: "پیام برای مشتری ثبت شد.",
  "quotation-draft": "پیش‌نویس پیشنهاد قیمت ذخیره شد.",
  "quotation-revision": "نسخه اصلاحی ساخته شد.",
  "quotation-sent": "پیشنهاد قیمت برای مشتری ارسال و قفل شد.",
};
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

/*
 * Inquiry operations (OpenSpec change rebuild-ui-with-astryx, task 8.4). The
 * detail separates what the customer submitted from staff-only operations:
 * submitted data, the quotation panel, the customer-visible conversation, the
 * status timeline and the internal notes in the main column; assignment,
 * allowed status changes and the assignment history in the side column. Every
 * mutation still carries the inquiry version; a conflict is stated with an
 * explicit refresh action and never retried. Authorization stays in the backend:
 * the UI only shows what the Admin DTO allows.
 */
export default async function AdminInquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  let item;
  try {
    item = await getAdminInquiry(id);
  } catch (error) {
    if (error instanceof AdminInquiryError && error.status === 404) notFound();
    throw error;
  }
  const [assignees, state, quotations] = await Promise.all([
    listAdminAssignees(),
    searchParams,
    listAdminQuotations(id),
  ]);
  const fields = [
    ["شرح", item.description ?? item.partDescription],
    ["مقدار تقریبی", item.approximateQuantity],
    ["واحد", item.quantityUnit],
    ["شهر تحویل", item.deliveryCity],
    ["زمان موردنیاز", item.requestedTiming],
    ["ماده/پلیمر", item.polymerName ?? item.materialName],
    ["گرید", item.grade],
    ["برند", item.brand],
    ["رنگ", item.color],
    ["کاربرد", item.application],
    ["مشخصات", item.specifications],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const assignAction = updateInquiryAssignmentAction.bind(null, item.id);
  const noteAction = addInquiryNoteAction.bind(null, item.id);
  const messageAction = addCustomerVisibleMessageAction.bind(null, item.id);
  const statusAction = updateInquiryStatusAction.bind(null, item.id);

  return (
    <VStack gap={4}>
      <div>
        <Button href="/admin/inquiries" variant="ghost">بازگشت به کارتابل</Button>
      </div>
      {state.error ? (
        <Alert variant={conflictCodes.has(state.error) ? "warning" : "danger"} title={errors[state.error] ?? errors.failed}>
          {conflictCodes.has(state.error) ? <Button href={`/admin/inquiries/${item.id}`} variant="secondary">تازه‌سازی</Button> : null}
        </Alert>
      ) : null}
      {state.success ? <Alert variant="success" title={successes[state.success] ?? "عملیات انجام شد."} /> : null}

      <AdminHeader
        eyebrow={`${inquiryTypeLabels[item.type]} / نسخه ${item.version.toLocaleString("fa-IR")}`}
        title={item.catalogItemName ?? "درخواست مشتری"}
        lead={`ثبت‌شده توسط ${item.ownerSummary.displayName} در ${formatDate(item.createdAt)}`}
        badge={<StatusBadge label={inquiryStatusLabels[item.status]} tone={inquiryStatusTone(item.status)} />}
      />

      <div className={styles.detailGrid}>
        <VStack gap={4}>
          <AdminSection title="اطلاعات ثبت‌شده مشتری" id="submitted-data-title">
            <MetadataList className={styles.details}>
              <MetadataListItem label="نام مشتری">{item.ownerSummary.displayName}</MetadataListItem>
              <MetadataListItem label="موبایل"><span dir="ltr">{item.ownerSummary.mobile}</span></MetadataListItem>
              {item.ownerSummary.companyName ? <MetadataListItem label="شرکت">{item.ownerSummary.companyName}</MetadataListItem> : null}
              {fields.map(([label, value]) => <MetadataListItem key={label} label={label}>{value}</MetadataListItem>)}
            </MetadataList>
          </AdminSection>

          <QuotationPanel
            inquiryId={item.id}
            inquiryVersion={item.version}
            quotations={quotations}
          />

          <AdminSection
            title="گفتگو با مشتری"
            id="customer-conversation-title"
            hint="این پیام در پنل مشتری نمایش داده می‌شود و با یادداشت داخلی متفاوت است."
          >
            {item.messages.length ? (
              <VStack gap={3} role="list" aria-label="پیام‌های گفتگو">
                {item.messages.map((message) => (
                  <Card key={message.id} variant={message.senderType === "STAFF" ? "default" : "muted"} className={styles.message} data-sender={message.senderType} role="listitem">
                    <VStack gap={2}>
                      <HStack gap={2} hAlign="between" wrap="wrap">
                        <Text as="span" weight="bold" color="inherit">
                          {message.senderType === "STAFF" ? "کارشناس" : "مشتری"} · {message.authorDisplayName}
                        </Text>
                        <Text as="span" type="supporting" color="secondary"><time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time></Text>
                      </HStack>
                      <Text as="p" className={styles.messageText}>{message.text}</Text>
                    </VStack>
                  </Card>
                ))}
              </VStack>
            ) : (
              <EmptyState title="هنوز پیامی در این گفتگو ثبت نشده است." description="پیام شما برای مشتری در پنل او نمایش داده می‌شود." />
            )}
            <form action={messageAction}>
              <input type="hidden" name="expectedVersion" value={item.version} />
              <VStack gap={3} hAlign="start">
                <Textarea label="پیام جدید برای مشتری" name="text" required maxLength={4000} />
                <Checkbox label="درخواست اطلاعات تکمیلی و تغییر وضعیت" name="requestMoreInfo" value="true" disabled={item.status !== "UNDER_REVIEW"} />
                <AdminSubmitButton pendingText="در حال ارسال…">ارسال پیام به مشتری</AdminSubmitButton>
              </VStack>
            </form>
          </AdminSection>

          <AdminSection title="تاریخچه وضعیت" id="status-history-title">
            <AdminTimeline
              label="تاریخچه وضعیت"
              entries={item.statusHistory.map((history) => ({
                id: history.id,
                title: inquiryStatusLabels[history.toStatus],
                actor: `توسط ${history.actorSummary.displayName}`,
                time: history.createdAt,
                timeLabel: formatDate(history.createdAt),
              }))}
            />
          </AdminSection>

          <AdminSection
            title="یادداشت‌های داخلی"
            id="internal-notes-title"
            variant="dashed"
            badge={<StatusBadge label="فقط کارکنان مجاز؛ برای مشتری ارسال نمی‌شود" tone="warning" />}
          >
            <form action={noteAction}>
              <VStack gap={3} hAlign="start">
                <Textarea label="یادداشت داخلی جدید" name="text" required maxLength={4000} />
                <AdminSubmitButton pendingText="در حال ثبت…">ثبت یادداشت داخلی</AdminSubmitButton>
              </VStack>
            </form>
            {item.internalNotes.length ? (
              <VStack gap={3} role="list" aria-label="یادداشت‌های داخلی">
                {item.internalNotes.map((note) => (
                  <Card key={note.id} variant="muted" role="listitem">
                    <VStack gap={2}>
                      <Text as="span" type="supporting" color="secondary">{note.authorSummary.displayName} — {formatDate(note.createdAt)}</Text>
                      <Text as="p" className={styles.noteText}>{note.text}</Text>
                    </VStack>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Text as="p" color="secondary">یادداشت داخلی ثبت نشده است.</Text>
            )}
          </AdminSection>
        </VStack>

        <VStack gap={4} as="aside">
          <AdminSection title="مسئول رسیدگی" id="assignee-title">
            <form action={assignAction}>
              <input type="hidden" name="expectedVersion" value={item.version} />
              <VStack gap={3} hAlign="start">
                <Select label="کارمند فعال" name="assignedAdminId" defaultValue={item.assigneeSummary?.id ?? ""}>
                  <option value="">بدون مسئول</option>
                  {assignees.map((admin) => <option key={admin.id} value={admin.id}>{admin.displayName}</option>)}
                </Select>
                <AdminSubmitButton pendingText="در حال تخصیص…">ذخیره مسئول</AdminSubmitButton>
              </VStack>
            </form>
          </AdminSection>

          <AdminSection title="تغییر وضعیت" id="status-change-title">
            {item.allowedTransitions.length ? (
              <HStack gap={2} wrap="wrap">
                {item.allowedTransitions.map((status) => (
                  <form action={statusAction} key={status}>
                    <input type="hidden" name="expectedVersion" value={item.version} />
                    <input type="hidden" name="toStatus" value={status} />
                    <AdminSubmitButton variant={status === "REJECTED" ? "danger" : "primary"} pendingText="در حال ثبت…">
                      {inquiryStatusLabels[status]}
                    </AdminSubmitButton>
                  </form>
                ))}
              </HStack>
            ) : (
              <Text as="p" color="secondary">انتقال دستی دیگری برای وضعیت فعلی وجود ندارد.</Text>
            )}
          </AdminSection>

          <AdminSection title="تاریخچه تخصیص" id="assignment-history-title">
            {item.assignmentHistory.length ? (
              <AdminTimeline
                label="تاریخچه تخصیص"
                entries={item.assignmentHistory.map((history) => ({
                  id: history.id,
                  title: history.toAdminSummary?.displayName ?? "حذف مسئول",
                  actor: `توسط ${history.actorSummary.displayName}`,
                  time: history.createdAt,
                  timeLabel: formatDate(history.createdAt),
                }))}
              />
            ) : (
              <Text as="p" color="secondary">تغییر مسئولی ثبت نشده است.</Text>
            )}
          </AdminSection>
        </VStack>
      </div>
    </VStack>
  );
}
