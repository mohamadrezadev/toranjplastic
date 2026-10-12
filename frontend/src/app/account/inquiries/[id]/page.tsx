import { notFound } from "next/navigation";
import { getInquiry, InquiryApiError } from "@/lib/inquiries";
import styles from "../../Portal.module.css";

const labels: Record<string, string> = { SUBMITTED: "ثبت‌شده", UNDER_REVIEW: "در حال بررسی", NEED_MORE_INFO: "نیازمند اطلاعات", QUOTED: "پیشنهاد ارسال‌شده", ACCEPTED: "پذیرفته‌شده", IN_PROGRESS: "در حال انجام", COMPLETED: "تکمیل‌شده", REJECTED: "ردشده", CANCELLED: "لغوشده" };
export default async function InquiryDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  let item;
  try { item = await getInquiry(id); } catch (error) { if (error instanceof InquiryApiError && error.status === 404) notFound(); throw error; }
  const state = await searchParams;
  const fields = [["شرح", item.description ?? item.partDescription], ["مقدار تقریبی", item.approximateQuantity], ["شهر تحویل", item.deliveryCity], ["زمان موردنیاز", item.requestedTiming], ["ماده/پلیمر", item.polymerName ?? item.materialName], ["گرید", item.grade], ["برند", item.brand]].filter((entry): entry is [string, string] => Boolean(entry[1]));
  return <main className={styles.main}><section className={styles.card}>{state.created ? <p role="status" className={styles.success}>درخواست با موفقیت ثبت شد.</p> : null}<p className={styles.eyebrow}>جزئیات درخواست</p><h1>{item.catalogItemName ?? "درخواست مشتری"}</h1><p>وضعیت فعلی: <strong>{labels[item.status]}</strong></p><dl className={styles.details}>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><h2>تاریخچه وضعیت</h2><ol className={styles.timeline}>{item.statusHistory.map((history) => <li key={history.id}><strong>{labels[history.toStatus]}</strong><span>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(history.createdAt))}</span></li>)}</ol></section></main>;
}
