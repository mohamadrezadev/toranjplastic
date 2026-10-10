import styles from "./page.module.css";

const foundations = [
  { index: "۰۱", title: "محصولات تولیدی", text: "معرفی شفاف محصولات منتشرشده و مسیر مستقیم برای ثبت استعلام؛ بدون خرید آنلاین." },
  { index: "۰۲", title: "خدمات تزریق پلاستیک", text: "دریافت نیاز قطعه، قالب، ماده و تعداد با امکان اعلام «اطلاع ندارم» برای جزئیات فنی." },
  { index: "۰۳", title: "تأمین مواد اولیه", text: "درخواست بررسی تأمین پلیمر با گرید و برند اختیاری؛ بدون ادعای موجودی یا قیمت تأییدنشده." },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="ترنج پلاستیک — ابتدای صفحه">
          <span className={styles.brandMark} aria-hidden="true">ت</span><span>ترنج پلاستیک</span>
        </a>
        <span className={styles.phaseBadge}>فاز صفر · زیرساخت آماده توسعه</span>
      </header>
      <section className={styles.hero} id="top">
        <div className={styles.eyebrow}>پایه فنی و سیستم طراحی پیشنهادی</div>
        <h1>یک مسیر روشن برای تبدیل نیاز صنعتی به درخواست قابل پیگیری</h1>
        <p>این صفحه خروجی فاز صفر است: چارچوب فارسی و راست‌به‌چپ، توکن‌های طراحی و مرزهای محصول. محتوای تجاری و اطلاعات تماس پس از تأیید تیم ترنج منتشر می‌شوند.</p>
        <a className={styles.primaryAction} href="#phase-zero">مشاهده خروجی فاز صفر</a>
      </section>
      <section className={styles.foundationSection} aria-labelledby="paths-title">
        <div className={styles.sectionHeading}><span>سه مسیر اصلی محصول</span><h2 id="paths-title">ساختار پیشنهادی، بدون ادعای تجاری تأییدنشده</h2></div>
        <div className={styles.cards}>
          {foundations.map((item) => (
            <article className={styles.card} key={item.title}>
              <span className={styles.cardIndex} aria-hidden="true">{item.index}</span>
              <h3>{item.title}</h3><p>{item.text}</p>
              <span className={styles.pending}>پیاده‌سازی در فازهای بعد</span>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.phaseZero} id="phase-zero" aria-labelledby="phase-zero-title">
        <div><span className={styles.eyebrow}>Foundation checklist</span><h2 id="phase-zero-title">آنچه اکنون آماده است</h2><p>ساختار monorepo و قراردادهای توسعه تثبیت شده‌اند تا هر قابلیت بعدی از یک spec قابل آزمون شروع شود.</p></div>
        <ul><li>Next.js و NestJS مستقل در یک workspace</li><li>فارسی، RTL و design tokenهای معنایی</li><li>PostgreSQL، Prisma و health endpoint</li><li>قوانین امنیت، scope و quality gate</li></ul>
      </section>
    </main>
  );
}
