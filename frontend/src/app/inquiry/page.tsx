import Link from "next/link";
import styles from "./Inquiry.module.css";

const choices = [
  ["product", "استعلام محصول", "محصول منتشرشده را انتخاب و مقدار تقریبی را اعلام کنید."],
  ["injection", "خدمات تزریق پلاستیک", "شرح قطعه، وضعیت قالب و اطلاعاتی را که می‌دانید وارد کنید."],
  ["material", "تأمین مواد اولیه", "نوع درخواست و نام تقریبی ماده یا پلیمر را ثبت کنید."],
  ["contact", "تماس عمومی", "برای موضوع‌های دیگر یک درخواست عمومی بفرستید."],
] as const;
export default function InquiryPage() {
  return <section className={styles.page}><header className={styles.pageHeader}><p className={styles.eyebrow}>پنل مشتری / درخواست جدید</p><h1>چه نوع درخواستی دارید؟</h1><p className={styles.lead}>مسیر مناسب را انتخاب کنید تا فقط اطلاعات مرتبط با نیاز شما نمایش داده شود.</p></header><div className={styles.choiceGrid}>{choices.map(([type,title,description], index) => <Link className={styles.choiceCard} key={type} href={`/inquiry/${type}`}><span className={styles.choiceTop}><span className={styles.choiceIndex}>0{index + 1}</span><span className={styles.choiceArrow} aria-hidden="true">←</span></span><span><h2>{title}</h2><p>{description}</p></span></Link>)}</div></section>;
}

export const instant = false;
