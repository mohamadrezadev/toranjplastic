import { notFound } from "next/navigation";
import Link from "next/link";
import { CustomerSubmitButton } from "@/components/account/CustomerSubmitButton";
import { getInquiry, InquiryApiError } from "@/lib/inquiries";
import { addCustomerInquiryMessageAction } from "./actions";
import styles from "../../Portal.module.css";

const labels: Record<string, string> = { SUBMITTED: "ثبت‌شده", UNDER_REVIEW: "در حال بررسی", NEED_MORE_INFO: "نیازمند اطلاعات", QUOTED: "پیشنهاد ارسال‌شده", ACCEPTED: "پذیرفته‌شده", IN_PROGRESS: "در حال انجام", COMPLETED: "تکمیل‌شده", REJECTED: "ردشده", CANCELLED: "لغوشده" };
const typeLabels: Record<string, string> = { PRODUCT: "استعلام محصول", INJECTION_SERVICE: "خدمات تزریق", MATERIAL: "مواد اولیه", GENERAL_CONTACT: "تماس عمومی" };
const formatDate = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const terminalStatuses = new Set(["COMPLETED", "REJECTED", "CANCELLED"]);

export const instant = false;
export default async function InquiryDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; success?: string; error?: string }> }) {
  const { id } = await params;
  let item;
  try { item = await getInquiry(id); } catch (error) { if (error instanceof InquiryApiError && error.status === 404) notFound(); throw error; }
  const state = await searchParams;
  const fields = [["شرح", item.description ?? item.partDescription], ["مقدار تقریبی", item.approximateQuantity], ["شهر تحویل", item.deliveryCity], ["زمان موردنیاز", item.requestedTiming], ["ماده/پلیمر", item.polymerName ?? item.materialName], ["گرید", item.grade], ["برند", item.brand]].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const messageAction = addCustomerInquiryMessageAction.bind(null, item.id);
  const canMessage = !terminalStatuses.has(item.status);

  return <section className={styles.page}>
    {state.created ? <p role="status" className={styles.success}>درخواست شما ثبت شد و در صف بررسی قرار دارد.</p> : null}
    {state.success === "message" ? <p role="status" className={styles.success}>پیام شما برای کارشناس ثبت شد.</p> : null}
    {state.error ? <p role="alert" className={styles.error}>ارسال پیام انجام نشد. صفحه را تازه‌سازی و دوباره تلاش کنید.</p> : null}
    <div className={styles.actions}><Link className={styles.backLink} href="/account/inquiries">بازگشت به درخواست‌ها</Link></div>
    <header className={styles.detailHeader}><div><p className={styles.eyebrow}>جزئیات درخواست / {typeLabels[item.type]}</p><h1>{item.catalogItemName ?? "درخواست مشتری"}</h1><div className={styles.detailMeta}><span>ثبت در {formatDate(item.createdAt)}</span></div></div><span className={styles.status} data-status={item.status}>{labels[item.status]}</span></header>
    <section className={styles.panel} aria-labelledby="submitted-data-title"><h2 className={styles.sectionTitle} id="submitted-data-title">اطلاعات ثبت‌شده</h2>{fields.length ? <dl className={styles.details}>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p className={styles.lead}>برای این درخواست اطلاعات تکمیلی ثبت نشده است.</p>}</section>

    <section className={styles.panel} aria-labelledby="conversation-title">
      <h2 className={styles.sectionTitle} id="conversation-title">گفتگو با کارشناس</h2>
      <div className={styles.conversation}>{item.messages.length ? item.messages.map((message) => <article className={styles.message} data-sender={message.senderType} key={message.id}><div className={styles.messageMeta}><strong>{message.senderType === "CUSTOMER" ? "شما" : "کارشناس ترنج"}</strong><time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time></div><p>{message.text}</p></article>) : <p className={styles.lead}>هنوز پیامی در این گفتگو ثبت نشده است.</p>}</div>
      {canMessage ? <form action={messageAction} className={styles.messageForm}><label htmlFor="customer-reply">پیام شما</label><textarea id="customer-reply" name="text" required minLength={1} maxLength={4000} aria-describedby="customer-reply-help" /><small id="customer-reply-help">اطلاعات موردنیاز را بدون درج رمز یا اطلاعات بانکی ارسال کنید.</small><CustomerSubmitButton pendingText="در حال ارسال…">ارسال پیام</CustomerSubmitButton></form> : <p className={styles.lead}>این درخواست بسته شده و امکان ارسال پیام جدید ندارد.</p>}
    </section>

    <section className={styles.panel} aria-labelledby="status-history-title"><h2 className={styles.sectionTitle} id="status-history-title">تاریخچه وضعیت</h2><ol className={styles.timeline}>{item.statusHistory.map((history) => <li key={history.id}><strong>{labels[history.toStatus]}</strong><time dateTime={history.createdAt}>{formatDate(history.createdAt)}</time></li>)}</ol></section>
  </section>;
}
