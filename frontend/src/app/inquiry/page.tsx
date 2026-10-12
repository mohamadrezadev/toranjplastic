import Link from "next/link";
import styles from "./Inquiry.module.css";

const choices = [
  ["product", "استعلام محصول", "محصول منتشرشده را انتخاب و مقدار تقریبی را اعلام کنید."],
  ["injection", "خدمات تزریق پلاستیک", "شرح قطعه، وضعیت قالب و اطلاعاتی را که می‌دانید وارد کنید."],
  ["material", "تأمین مواد اولیه", "نوع درخواست و نام تقریبی ماده یا پلیمر را ثبت کنید."],
  ["contact", "تماس عمومی", "برای موضوع‌های دیگر یک درخواست عمومی بفرستید."],
] as const;
export default function InquiryPage() {
  return <main className={styles.main}><section className={styles.shell}><p className={styles.eyebrow}>ثبت درخواست</p><h1>چه نوع درخواستی دارید؟</h1><p>برای بررسی و پیگیری توسط تیم ترنج، گزینه مناسب را انتخاب کنید.</p><div className={styles.grid}>{choices.map(([type,title,description]) => <Link key={type} href={`/inquiry/${type}`}><h2>{title}</h2><p>{description}</p></Link>)}</div></section></main>;
}
