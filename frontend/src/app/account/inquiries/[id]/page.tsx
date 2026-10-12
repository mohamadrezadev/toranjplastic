import { notFound } from "next/navigation";
import Link from "next/link";
import { getInquiry, InquiryApiError } from "@/lib/inquiries";
import styles from "../../Portal.module.css";

const labels: Record<string, string> = { SUBMITTED: "ثبت‌شده", UNDER_REVIEW: "در حال بررسی", NEED_MORE_INFO: "نیازمند اطلاعات", QUOTED: "پیشنهاد ارسال‌شده", ACCEPTED: "پذیرفته‌شده", IN_PROGRESS: "در حال انجام", COMPLETED: "تکمیل‌شده", REJECTED: "ردشده", CANCELLED: "لغوشده" };
const typeLabels: Record<string, string> = { PRODUCT: "استعلام محصول", INJECTION_SERVICE: "خدمات تزریق", MATERIAL: "مواد اولیه", GENERAL_CONTACT: "تماس عمومی" };
export const instant = false;
export default async function InquiryDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  let item;
  try { item = await getInquiry(id); } catch (error) { if (error instanceof InquiryApiError && error.status === 404) notFound(); throw error; }
  const state = await searchParams;
  const fields = [["شرح", item.description ?? item.partDescription], ["مقدار تقریبی", item.approximateQuantity], ["شهر تحویل", item.deliveryCity], ["زمان موردنیاز", item.requestedTiming], ["ماده/پلیمر", item.polymerName ?? item.materialName], ["گرید", item.grade], ["برند", item.brand]].filter((entry): entry is [string, string] => Boolean(entry[1]));
  return <section className={styles.page}>{state.created ? <p role="status" className={styles.success}>درخواست شما با موفقیت ثبت شد و اکنون در صف بررسی قرار دارد.</p> : null}
    <div className={styles.actions}><Link className={styles.backLink} href="/account/inquiries">بازگشت به درخواست‌ها</Link></div>
    <header className={styles.detailHeader}><div><p className={styles.eyebrow}>جزئیات درخواست / {typeLabels[item.type]}</p><h1>{item.catalogItemName ?? "درخواست مشتری"}</h1><div className={styles.detailMeta}><span>ثبت در {new Intl.DateTimeFormat("fa-IR").format(new Date(item.createdAt))}</span></div></div><span className={styles.status} data-status={item.status}>{labels[item.status]}</span></header>
    <section className={styles.panel} aria-labelledby="submitted-data-title"><h2 className={styles.sectionTitle} id="submitted-data-title">اطلاعات ثبت‌شده</h2>{fields.length ? <dl className={styles.details}>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p className={styles.lead}>برای این درخواست اطلاعات تکمیلی ثبت نشده است.</p>}</section>
    <section className={styles.panel} aria-labelledby="status-history-title"><h2 className={styles.sectionTitle} id="status-history-title">تاریخچه وضعیت</h2><ol className={styles.timeline}>{item.statusHistory.map((history) => <li key={history.id}><strong>{labels[history.toStatus]}</strong><time dateTime={history.createdAt}>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(history.createdAt))}</time></li>)}</ol></section>
  </section>;
}
