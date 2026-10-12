import Link from "next/link";
import { listInquiries, inquiryStatuses, inquiryTypes } from "@/lib/inquiries";
import styles from "../Portal.module.css";

const typeLabel: Record<string, string> = { PRODUCT: "استعلام محصول", INJECTION_SERVICE: "خدمات تزریق", MATERIAL: "مواد اولیه", GENERAL_CONTACT: "تماس عمومی" };
const statusLabel: Record<string, string> = { SUBMITTED: "ثبت‌شده", UNDER_REVIEW: "در حال بررسی", NEED_MORE_INFO: "نیازمند اطلاعات", QUOTED: "پیشنهاد ارسال‌شده", ACCEPTED: "پذیرفته‌شده", IN_PROGRESS: "در حال انجام", COMPLETED: "تکمیل‌شده", REJECTED: "ردشده", CANCELLED: "لغوشده" };

export const instant = false;

export default async function InquiryListPage({ searchParams }: { searchParams: Promise<{ type?: string; status?: string }> }) {
  const filters = await searchParams;
  const result = await listInquiries(filters);
  return <section className={styles.page}><header className={styles.pageHeader}><div className={styles.pageHeaderCopy}><p className={styles.eyebrow}>پنل مشتری / پیگیری</p><h1>درخواست‌های من</h1><p className={styles.lead}>درخواست‌ها را بر اساس نوع یا وضعیت پیدا کنید و جزئیات هر مورد را ببینید.</p></div><Link className={styles.primary} href="/inquiry">درخواست جدید</Link></header>
    <div className={styles.panel}><form className={styles.filters}><label>نوع درخواست<select name="type" defaultValue={filters.type ?? ""}><option value="">همه نوع‌ها</option>{inquiryTypes.map((value) => <option key={value} value={value}>{typeLabel[value]}</option>)}</select></label><label>وضعیت پیگیری<select name="status" defaultValue={filters.status ?? ""}><option value="">همه وضعیت‌ها</option>{inquiryStatuses.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label><button type="submit">اعمال فیلتر</button></form></div>
    {result.items.length ? <ul className={styles.list}>{result.items.map((item) => <li className={styles.listItem} key={item.id}><Link href={`/account/inquiries/${item.id}`}><span className={styles.itemMain}><span className={styles.itemType}>{typeLabel[item.type]}</span><strong>{item.catalogItemName ?? typeLabel[item.type]}</strong></span><span className={styles.itemMeta}><span className={styles.status} data-status={item.status}>{statusLabel[item.status]}</span><time className={styles.date} dateTime={item.createdAt}>{new Intl.DateTimeFormat("fa-IR").format(new Date(item.createdAt))}</time></span></Link></li>)}</ul> : <div className={styles.empty}><span className={styles.emptyMark} aria-hidden="true">0</span><h2>درخواستی با این شرایط پیدا نشد</h2><p>فیلترها را تغییر دهید یا برای شروع یک درخواست تازه ثبت کنید.</p><Link className={styles.primary} href="/inquiry">ثبت درخواست جدید</Link></div>}
  </section>;
}
