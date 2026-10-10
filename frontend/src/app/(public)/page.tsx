import { ActionLink } from "@/components/navigation";
import { DirectionalData } from "@/components/ui";
import styles from "./page.module.css";

const foundations = [
  { index: "۰۱", title: "محصولات تولیدی", text: "ساختار معرفی محصولات و مسیر ثبت استعلام، بدون خرید آنلاین یا نمایش اطلاعات تأییدنشده." },
  { index: "۰۲", title: "خدمات تزریق پلاستیک", text: "مسیر دریافت نیاز قطعه، قالب، ماده و تعداد؛ جزئیات اجرایی در فازهای بعد و پس از تصویب قراردادها." },
  { index: "۰۳", title: "تأمین مواد اولیه", text: "درخواست بررسی تأمین پلیمر با اطلاعات اختیاری، بدون ادعای موجودی، قیمت یا زمان تحویل." },
];

export default function Home() {
  return <main className={styles.page}>
    <section className={`${styles.hero} content-container`}>
      <div className={styles.eyebrow}>پایه فنی و سیستم طراحی پیشنهادی</div>
      <h1>یک مسیر روشن برای تبدیل نیاز صنعتی به درخواست قابل پیگیری</h1>
      <p>ساختار فارسی و راست‌به‌چپ پروژه آماده توسعه است. محتوای تجاری، اطلاعات تماس و هویت بصری نهایی تنها پس از تأیید تیم ترنج منتشر می‌شوند.</p>
      <ActionLink href="/inquiry" emphasis="primary">ورود به مسیر ثبت استعلام</ActionLink>
    </section>
    <section className={styles.foundationSection} aria-labelledby="paths-title">
      <div className={`${styles.sectionHeading} content-container`}><span>سه مسیر اصلی محصول</span><h2 id="paths-title">ساختار پیشنهادی، بدون ادعای تجاری تأییدنشده</h2></div>
      <div className={`${styles.cards} content-container`}>{foundations.map((item) => <article className={styles.card} key={item.title}><span className={styles.cardIndex} aria-hidden="true">{item.index}</span><h3>{item.title}</h3><p>{item.text}</p><span className={styles.pending}>در حال آماده‌سازی</span></article>)}</div>
    </section>
    <section className={`${styles.phaseZero} content-container`} aria-labelledby="phase-zero-title">
      <div><span className={styles.eyebrow}>Foundation checklist</span><h2 id="phase-zero-title">آنچه اکنون آماده است</h2><p>ساختار monorepo و قراردادهای توسعه تثبیت شده‌اند تا هر قابلیت بعدی از یک spec قابل‌آزمون شروع شود. نمونه شناسه فنی: <DirectionalData>TRJ-2048-A</DirectionalData></p></div>
      <ul><li>Next.js و NestJS مستقل در یک workspace</li><li>فارسی، RTL و design tokenهای معنایی</li><li>PostgreSQL، Prisma و health endpoint</li><li>قوانین امنیت، scope و quality gate</li></ul>
    </section>
  </main>;
}
