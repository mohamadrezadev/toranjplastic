import Link from "next/link";
import { listInquiries, inquiryStatuses, inquiryTypes } from "@/lib/inquiries";
import styles from "../Portal.module.css";

const typeLabel: Record<string, string> = { PRODUCT: "استعلام محصول", INJECTION_SERVICE: "خدمات تزریق", MATERIAL: "مواد اولیه", GENERAL_CONTACT: "تماس عمومی" };
const statusLabel: Record<string, string> = { SUBMITTED: "ثبت‌شده", UNDER_REVIEW: "در حال بررسی", NEED_MORE_INFO: "نیازمند اطلاعات", QUOTED: "پیشنهاد ارسال‌شده", ACCEPTED: "پذیرفته‌شده", IN_PROGRESS: "در حال انجام", COMPLETED: "تکمیل‌شده", REJECTED: "ردشده", CANCELLED: "لغوشده" };

export default async function InquiryListPage({ searchParams }: { searchParams: Promise<{ type?: string; status?: string }> }) {
  const filters = await searchParams;
  const result = await listInquiries(filters);
  return <main className={styles.main}><section className={styles.card}><div className={styles.heading}><div><p className={styles.eyebrow}>پنل مشتری</p><h1>درخواست‌های من</h1></div><Link className={styles.primary} href="/inquiry">درخواست جدید</Link></div>
    <form className={styles.filters}><label>نوع<select name="type" defaultValue={filters.type ?? ""}><option value="">همه</option>{inquiryTypes.map((value) => <option key={value} value={value}>{typeLabel[value]}</option>)}</select></label><label>وضعیت<select name="status" defaultValue={filters.status ?? ""}><option value="">همه</option>{inquiryStatuses.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label><button type="submit">اعمال فیلتر</button></form>
    {result.items.length ? <ul className={styles.list}>{result.items.map((item) => <li key={item.id}><Link href={`/account/inquiries/${item.id}`}><strong>{item.catalogItemName ?? typeLabel[item.type]}</strong><span>{statusLabel[item.status]} · {new Intl.DateTimeFormat("fa-IR").format(new Date(item.createdAt))}</span></Link></li>)}</ul> : <div className={styles.empty}><h2>هنوز درخواستی ندارید</h2><p>برای شروع، نوع درخواست را انتخاب و فرم مربوط را تکمیل کنید.</p></div>}
  </section></main>;
}
