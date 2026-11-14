import { Collapsible, CollapsibleGroup } from "@astryxdesign/core/Collapsible";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import type { ReactNode } from "react";
import styles from "./Navigation.module.css";

type FooterLink = readonly [href: string, label: string];

const productLinks: ReadonlyArray<FooterLink> = [
  ["/products", "محصولات کاتالوگ"],
  ["/injection-molding", "خدمات تزریق پلاستیک"],
  ["/materials", "مواد اولیه و پلیمرها"],
  ["/inquiry", "سامانه استعلام آنلاین"],
];

const institutionalLinks: ReadonlyArray<FooterLink> = [
  ["/about", "درباره ترنج پلاستیک"],
  ["/contact", "تماس با ما"],
  ["/articles", "مقالات و راهنمای تخصصی"],
  ["/account", "حساب کاربری و پیگیری"],
];

const legalLinks: ReadonlyArray<FooterLink> = [
  ["/terms", "قوانین و مقررات"],
  ["/privacy", "حریم خصوصی"],
];

function FooterLinks({ links }: { links: ReadonlyArray<FooterLink> }) {
  return <ul className={styles.footerNavList}>{links.map(([href, label]) => <li key={href}><Link href={href} color="primary" type="inherit">{label}</Link></li>)}</ul>;
}

function ContactLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} color="primary" type="inherit">{children}</Link>;
}

function DisclosureTitle({ children }: { children: string }) {
  return <Text type="body" weight="bold" color="primary">{children}</Text>;
}

/**
 * The public footer is a Toranj composition on the always-dark brand surface:
 * Astryx has no site-footer pattern. Links and the mobile link groups use the
 * public Astryx Link and Collapsible components, themed through the inverse
 * surface roles in astryx-theme.css.
 */
export function Footer() {
  return (
    <footer className={styles.footer} data-toranj-surface="inverse">
      <div className={`${styles.footerGrid} content-container`}>
        <div className={styles.footerColBrand}>
          <div className={styles.footerBrandWrap}>
            <span className={styles.footerSymbol} aria-hidden="true" />
            <span className={styles.footerBrandTitle}>صنایع پلاستیک ترنج</span>
          </div>
          <p className={styles.footerDescription}>
            تولید محصولات کاتالوگ با قالب‌های اختصاصی، پذیرش خدمات تزریق پلاستیک کارمزدی در کهریزک (با قالب مشتری) و تأمین مواد اولیه پلیمری.
          </p>
          <div className={styles.footerMeta}>
            <span>محل کارخانه و دفتر: <strong>تهران، کهریزک</strong></span>
          </div>
        </div>

        <div className={styles.footerCol}>
          <h3 className={styles.footerColTitle}>راه‌های ارتباط و پیگیری</h3>
          <ul className={styles.footerList}>
            <li>
              <span className={styles.footerLabel}>واحد فروش و سفارش عمده:</span>
              <div className={styles.footerPhones} dir="ltr">
                <ContactLink href="tel:09132075925">۰۹۱۳ ۲۰۷ ۵۹۲۵</ContactLink>
                <span aria-hidden="true"> | </span>
                <ContactLink href="tel:09122009515">۰۹۱۲ ۲۰۰ ۹۵۱۵</ContactLink>
              </div>
            </li>
            <li>
              <span className={styles.footerLabel}>پشتیبانی فنی وب‌سایت:</span>
              <div dir="ltr">
                <ContactLink href="tel:09104500086">۰۹۱۰ ۴۵۰ ۰۰۸۶</ContactLink>
              </div>
            </li>
            <li>
              <span className={styles.footerLabel}>پست الکترونیک رسمی:</span>
              <div dir="ltr">
                <ContactLink href="mailto:info@toranjplastic.com">info@toranjplastic.com</ContactLink>
              </div>
            </li>
          </ul>
        </div>

        <div className={`${styles.footerCol} ${styles.footerDesktopCol}`}>
          <h3 className={styles.footerColTitle}>محصولات و خدمات</h3>
          <nav aria-label="محصولات و خدمات فوتر">
            <FooterLinks links={productLinks} />
          </nav>
        </div>
        <div className={`${styles.footerCol} ${styles.footerDesktopCol}`}>
          <h3 className={styles.footerColTitle}>دسترسی و راهنما</h3>
          <nav aria-label="پیوندهای سازمانی فوتر">
            <FooterLinks links={institutionalLinks} />
          </nav>
        </div>

        {/* Narrow screens keep contact details open and fold the lower-priority link groups. */}
        <div className={styles.footerDisclosures}>
          <CollapsibleGroup type="multiple" hasDividers>
            <Collapsible value="products" trigger={<DisclosureTitle>محصولات و خدمات</DisclosureTitle>}>
              <nav aria-label="محصولات و خدمات فوتر موبایل">
                <FooterLinks links={productLinks} />
              </nav>
            </Collapsible>
            <Collapsible value="institutional" trigger={<DisclosureTitle>دسترسی و راهنما</DisclosureTitle>}>
              <nav aria-label="پیوندهای سازمانی فوتر موبایل">
                <FooterLinks links={institutionalLinks} />
              </nav>
            </Collapsible>
          </CollapsibleGroup>
        </div>
      </div>

      <div className={`${styles.footerBottom} content-container`}>
        <p className={styles.footerCopyright}>
          © کلیه حقوق مادی و معنوی متعلق به صنایع پلاستیک ترنج است.
        </p>
        <div className={styles.footerLegalLinks}>
          {legalLinks.map(([href, label]) => <Link key={href} href={href} color="secondary" type="inherit">{label}</Link>)}
        </div>
      </div>
    </footer>
  );
}
