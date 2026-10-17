import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import {
  reviseQuotationAction,
  saveQuotationDraftAction,
  sendQuotationAction,
} from "./actions";
import { adminQuotationPdfUrl } from "./api";
import { QuotationEditor } from "./QuotationEditor";
import type { Quotation } from "./types";
import styles from "./Quotation.module.css";
const date = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
    new Date(value),
  );
const money = (value: string) =>
  `${new Intl.NumberFormat("fa-IR").format(BigInt(value))} ریال`;
export function QuotationPanel({
  inquiryId,
  inquiryVersion,
  quotations,
}: {
  inquiryId: string;
  inquiryVersion: number;
  quotations: Quotation[];
}) {
  const draft = quotations.find((item) => item.status === "DRAFT");
  const currentSent = quotations.find((item) => item.status === "SENT");
  const visible = quotations.filter((item) => item.status !== "DRAFT");
  const save = saveQuotationDraftAction.bind(
    null,
    inquiryId,
    draft?.id ?? null,
  );
  return (
    <section className={styles.panel} aria-labelledby="quotation-title">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>قیمت‌گذاری دستی و نسخه‌دار</p>
          <h2 id="quotation-title">پیشنهاد قیمت</h2>
        </div>
        {currentSent ? (
          <span className={styles.sentBadge}>نسخه جاری ارسال شده</span>
        ) : null}
      </div>
      {visible.length ? (
        <div className={styles.versions}>
          {visible.map((quotation) => (
            <article className={styles.versionCard} key={quotation.id}>
              <div>
                <strong>{quotation.quotationNumber}</strong>
                <span>
                  نسخه {quotation.version.toLocaleString("fa-IR")} ·{" "}
                  {quotation.status === "SENT" ? "جاری" : "جایگزین‌شده"}
                </span>
              </div>
              <div>
                <b dir="ltr">{money(quotation.totalRials)}</b>
                <small>اعتبار تا {date(quotation.validUntil)}</small>
              </div>
              <a
                href={adminQuotationPdfUrl(inquiryId, quotation.id)}
                target="_blank"
                rel="noreferrer"
              >
                دریافت PDF خصوصی
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          هنوز پیشنهاد قیمتی ارسال نشده است. این وضعیت هیچ تعهد قیمت، موجودی یا
          زمان تحویل ایجاد نمی‌کند.
        </p>
      )}
      {draft ? (
        <>
          <QuotationEditor draft={draft} action={save} />
          <form
            className={styles.sendBox}
            action={sendQuotationAction.bind(null, inquiryId, draft.id)}
          >
            <input
              type="hidden"
              name="expectedVersion"
              value={draft.editVersion}
            />
            <input
              type="hidden"
              name="inquiryExpectedVersion"
              value={inquiryVersion}
            />
            <label>
              <input type="checkbox" name="confirm" value="yes" required />{" "}
              مقادیر، شرایط و نسخه را بازبینی کرده‌ام و ارسال باعث قفل‌شدن این
              نسخه می‌شود.
            </label>
            <AdminSubmitButton pendingText="در حال ارسال…">
              تأیید و ارسال برای مشتری
            </AdminSubmitButton>
          </form>
        </>
      ) : currentSent ? (
        <form
          action={reviseQuotationAction.bind(null, inquiryId, currentSent.id)}
          className={styles.revisionBox}
        >
          <input
            type="hidden"
            name="expectedVersion"
            value={currentSent.editVersion}
          />
          <p>
            برای اصلاح سند ارسال‌شده، نسخه جدیدی از snapshot فعلی ساخته می‌شود.
          </p>
          <AdminSubmitButton pendingText="در حال ساخت…">
            ایجاد نسخه اصلاحی
          </AdminSubmitButton>
        </form>
      ) : (
        <QuotationEditor action={save} />
      )}
    </section>
  );
}
