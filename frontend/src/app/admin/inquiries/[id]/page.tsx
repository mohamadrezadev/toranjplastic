import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
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

  return (
    <div className={styles.page}>
      <div>
        <Link className={styles.backLink} href="/admin/inquiries">
          بازگشت به کارتابل
        </Link>
      </div>
      {state.error ? (
        <div className={styles.feedback} role="alert">
          {errors[state.error] ?? errors.failed}{" "}
          {state.error === "INQUIRY_VERSION_CONFLICT" ? (
            <Link href={`/admin/inquiries/${item.id}`}>تازه‌سازی</Link>
          ) : null}
        </div>
      ) : null}
      {state.success ? (
        <div className={styles.success} role="status">
          {successes[state.success] ?? "عملیات انجام شد."}
        </div>
      ) : null}
      <header className={styles.detailHeader}>
        <div>
          <p className={styles.eyebrow}>
            {inquiryTypeLabels[item.type]} / نسخه{" "}
            {item.version.toLocaleString("fa-IR")}
          </p>
          <h1>{item.catalogItemName ?? "درخواست مشتری"}</h1>
          <p className={styles.lead}>
            ثبت‌شده توسط {item.ownerSummary.displayName} در{" "}
            {formatDate(item.createdAt)}
          </p>
        </div>
        <span className={styles.badge} data-status={item.status}>
          {inquiryStatusLabels[item.status]}
        </span>
      </header>
      <div className={styles.detailGrid}>
        <div className={styles.stack}>
          <section className={styles.panel}>
            <h2>اطلاعات ثبت‌شده مشتری</h2>
            <dl className={styles.details}>
              <div>
                <dt>نام مشتری</dt>
                <dd>{item.ownerSummary.displayName}</dd>
              </div>
              <div>
                <dt>موبایل</dt>
                <dd dir="ltr">{item.ownerSummary.mobile}</dd>
              </div>
              {item.ownerSummary.companyName ? (
                <div>
                  <dt>شرکت</dt>
                  <dd>{item.ownerSummary.companyName}</dd>
                </div>
              ) : null}
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <QuotationPanel
            inquiryId={item.id}
            inquiryVersion={item.version}
            quotations={quotations}
          />

          <section
            className={`${styles.panel} ${styles.customerConversation}`}
            aria-labelledby="customer-conversation-title"
          >
            <h2 id="customer-conversation-title">گفتگو با مشتری</h2>
            <p className={styles.messageFormHint}>
              این پیام در پنل مشتری نمایش داده می‌شود و با یادداشت داخلی متفاوت
              است.
            </p>
            <div className={styles.conversation}>
              {item.messages.length ? (
                item.messages.map((message) => (
                  <article
                    className={styles.message}
                    data-sender={message.senderType}
                    key={message.id}
                  >
                    <div className={styles.messageMeta}>
                      <strong>
                        {message.senderType === "STAFF" ? "کارشناس" : "مشتری"} ·{" "}
                        {message.authorDisplayName}
                      </strong>
                      <time dateTime={message.createdAt}>
                        {formatDate(message.createdAt)}
                      </time>
                    </div>
                    <p>{message.text}</p>
                  </article>
                ))
              ) : (
                <p className={styles.empty}>
                  هنوز پیامی در این گفتگو ثبت نشده است.
                </p>
              )}
            </div>
            <form action={messageAction} className={styles.operationForm}>
              <input
                type="hidden"
                name="expectedVersion"
                value={item.version}
              />
              <label htmlFor="customer-message">پیام جدید برای مشتری</label>
              <textarea
                id="customer-message"
                name="text"
                required
                minLength={1}
                maxLength={4000}
              />
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  name="requestMoreInfo"
                  value="true"
                  disabled={item.status !== "UNDER_REVIEW"}
                />{" "}
                درخواست اطلاعات تکمیلی و تغییر وضعیت
              </label>
              <AdminSubmitButton pendingText="در حال ارسال…">
                ارسال پیام به مشتری
              </AdminSubmitButton>
            </form>
          </section>

          <section className={styles.panel}>
            <h2>تاریخچه وضعیت</h2>
            <ol className={styles.timeline}>
              {item.statusHistory.map((history) => (
                <li key={history.id}>
                  <strong>{inquiryStatusLabels[history.toStatus]}</strong>
                  <small>توسط {history.actorSummary.displayName}</small>
                  <time dateTime={history.createdAt}>
                    {formatDate(history.createdAt)}
                  </time>
                </li>
              ))}
            </ol>
          </section>

          <section className={`${styles.panel} ${styles.internalPanel}`}>
            <h2>یادداشت‌های داخلی</h2>
            <span className={styles.staffOnly}>
              فقط کارکنان مجاز؛ برای مشتری ارسال نمی‌شود
            </span>
            <form action={noteAction} className={styles.operationForm}>
              <label htmlFor="note-text">یادداشت داخلی جدید</label>
              <textarea
                id="note-text"
                name="text"
                required
                minLength={1}
                maxLength={4000}
              />
              <AdminSubmitButton pendingText="در حال ثبت…">
                ثبت یادداشت داخلی
              </AdminSubmitButton>
            </form>
            <div className={styles.timeline}>
              {item.internalNotes.length ? (
                item.internalNotes.map((note) => (
                  <article className={styles.note} key={note.id}>
                    <small>
                      {note.authorSummary.displayName} —{" "}
                      {formatDate(note.createdAt)}
                    </small>
                    <p>{note.text}</p>
                  </article>
                ))
              ) : (
                <p className={styles.empty}>یادداشت داخلی ثبت نشده است.</p>
              )}
            </div>
          </section>
        </div>
        <aside className={styles.stack}>
          <section className={styles.panel}>
            <h2>مسئول رسیدگی</h2>
            <form action={assignAction} className={styles.operationForm}>
              <input
                type="hidden"
                name="expectedVersion"
                value={item.version}
              />
              <label htmlFor="assignedAdminId">کارمند فعال</label>
              <select
                id="assignedAdminId"
                name="assignedAdminId"
                defaultValue={item.assigneeSummary?.id ?? ""}
              >
                <option value="">بدون مسئول</option>
                {assignees.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.displayName}
                  </option>
                ))}
              </select>
              <AdminSubmitButton pendingText="در حال تخصیص…">
                ذخیره مسئول
              </AdminSubmitButton>
            </form>
          </section>
          <section className={styles.panel}>
            <h2>تغییر وضعیت</h2>
            {item.allowedTransitions.length ? (
              <div className={styles.actionList}>
                {item.allowedTransitions.map((status) => {
                  const action = updateInquiryStatusAction.bind(null, item.id);
                  return (
                    <form action={action} key={status}>
                      <input
                        type="hidden"
                        name="expectedVersion"
                        value={item.version}
                      />
                      <input type="hidden" name="toStatus" value={status} />
                      <AdminSubmitButton
                        variant={status === "REJECTED" ? "danger" : "primary"}
                        pendingText="در حال ثبت…"
                      >
                        {inquiryStatusLabels[status]}
                      </AdminSubmitButton>
                    </form>
                  );
                })}
              </div>
            ) : (
              <p className={styles.lead}>
                انتقال دستی دیگری برای وضعیت فعلی وجود ندارد.
              </p>
            )}
          </section>
          <section className={styles.panel}>
            <h2>تاریخچه تخصیص</h2>
            {item.assignmentHistory.length ? (
              <ol className={styles.timeline}>
                {item.assignmentHistory.map((history) => (
                  <li key={history.id}>
                    <strong>
                      {history.toAdminSummary?.displayName ?? "حذف مسئول"}
                    </strong>
                    <small>توسط {history.actorSummary.displayName}</small>
                    <time dateTime={history.createdAt}>
                      {formatDate(history.createdAt)}
                    </time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.empty}>تغییر مسئولی ثبت نشده است.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
