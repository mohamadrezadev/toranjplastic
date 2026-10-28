import Link from "next/link";
import styles from "./Navigation.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} data-shell-inert>
      <div className={`${styles.footerGrid} content-container`}>
        {/* Brand & Mission Column */}
        <div className={styles.footerColBrand}>
          <div className={styles.footerBrandWrap}>
            <span className={styles.footerSymbol} aria-hidden="true" />
            <span className={styles.footerBrandTitle}>صنایع پلاستیک ترنج</span>
          </div>
          <p className={styles.footerDescription}>
            تولید محصولات کاتالوگ با قالب‌های اختصاصی، پذیرش خدمات تزریق پلاستیک کارمزدی در کهریزک (با قالب مشتری بر روی دستگاه‌های ۸۰ تا ۴۵۰ تن) و تأمین مواد اولیه پلیمری.
          </p>
          <div className={styles.footerMeta}>
            <span>محل کارخانه و دفتر: <strong>تهران، کهریزک</strong></span>
          </div>
        </div>

        {/* Contact Points Column */}
        <div className={styles.footerCol}>
          <h3 className={styles.footerColTitle}>راه‌های ارتباط و پیگیری</h3>
          <ul className={styles.footerList}>
            <li>
              <span className={styles.footerLabel}>واحد فروش و سفارش عمده:</span>
              <div className={styles.footerPhones} dir="ltr">
                <a href="tel:09132075925">۰۹۱۳ ۲۰۷ ۵۹۲۵</a>
                <span aria-hidden="true"> | </span>
                <a href="tel:09122009515">۰۹۱۲ ۲۰۰ ۹۵۱۵</a>
              </div>
            </li>
            <li>
              <span className={styles.footerLabel}>پشتیبان فنی و هماهنگی تزریق:</span>
              <div dir="ltr">
                <a href="tel:09104500086">۰۹۱۰ ۴۵۰ ۰۰۸۶</a>
              </div>
            </li>
            <li>
              <span className={styles.footerLabel}>پست الکترونیک رسمی:</span>
              <div dir="ltr">
                <a href="mailto:info@toranjplastic.com">info@toranjplastic.com</a>
              </div>
            </li>
          </ul>
        </div>

        {/* Catalog & Services Links Column */}
        <div className={styles.footerCol}>
          <h3 className={styles.footerColTitle}>محصولات و خدمات</h3>
          <nav aria-label="محصولات و خدمات فوتر">
            <ul className={styles.footerNavList}>
              <li><Link href="/products">محصولات کاتالوگ</Link></li>
              <li><Link href="/injection-molding">خدمات تزریق پلاستیک</Link></li>
              <li><Link href="/materials">مواد اولیه و پلیمرها</Link></li>
              <li><Link href="/inquiry">سامانه استعلام آنلاین</Link></li>
            </ul>
          </nav>
        </div>

        {/* Institutional & Articles Links Column */}
        <div className={styles.footerCol}>
          <h3 className={styles.footerColTitle}>دسترسی و راهنما</h3>
          <nav aria-label="پیوندهای سازمانی فوتر">
            <ul className={styles.footerNavList}>
              <li><Link href="/about">درباره ترنج پلاستیک</Link></li>
              <li><Link href="/contact">تماس با ما</Link></li>
              <li><Link href="/articles">مقالات و راهنمای تخصصی</Link></li>
              <li><Link href="/account">حساب کاربری و پیگیری</Link></li>
            </ul>
          </nav>
        </div>
      </div>

      <div className={`${styles.footerBottom} content-container`}>
        <p className={styles.footerCopyright}>
          © کلیه حقوق مادی و معنوی متعلق به صنایع پلاستیک ترنج است.
        </p>
        <div className={styles.footerLegalLinks}>
          <Link href="/terms">قوانین و مقررات</Link>
          <Link href="/privacy">حریم خصوصی</Link>
        </div>
      </div>
    </footer>
  );
}
