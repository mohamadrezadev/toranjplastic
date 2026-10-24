import { CustomerSubmitButton } from "./CustomerSubmitButton";
import {
  customerQuotationPdfUrl,
  type CustomerQuotation,
} from "@/lib/customer-quotations";
import { formatQuotationDate } from "@/lib/quotation-date";
import styles from "./CustomerQuotations.module.css";

const money = (value: string) =>
  `${new Intl.NumberFormat("fa-IR").format(BigInt(value))} ریال`;

const statusText = (status: CustomerQuotation["status"]) => {
  switch (status) {
    case "SENT":
      return "نسخه جاری";
    case "ACCEPTED":
      return "پذیرفته‌شده توسط شما";
    case "REJECTED":
      return "ردشده توسط شما";
    case "SUPERSEDED":
    default:
      return "نسخه جایگزین‌شده";
  }
};

export function CustomerQuotations({
  inquiryId,
  inquiryVersion = 0,
  inquiryStatus,
  quotations,
  now = 0,
  acceptAction,
  rejectAction,
}: {
  inquiryId: string;
  inquiryVersion?: number;
  inquiryStatus?: string;
  quotations: CustomerQuotation[];
  now?: number;
  acceptAction?: (inquiryId: string, quotationId: string, form: FormData) => Promise<void> | void;
  rejectAction?: (inquiryId: string, quotationId: string, form: FormData) => Promise<void> | void;
}) {
  return (
    <section
      className={styles.panel}
      aria-labelledby="customer-quotations-title"
    >
      <div className={styles.heading}>
        <div>
          <p>اسناد تجاری خصوصی</p>
          <h2 id="customer-quotations-title">پیشنهادهای قیمت</h2>
        </div>
      </div>
      {quotations.length ? (
        <div className={styles.list}>
          {quotations.map((quotation) => {
            const isExpired = Boolean(
              quotation.isExpired ??
                (now && new Date(quotation.validUntil).getTime() <= now),
            );
            const canRespond = quotation.status === "SENT" && inquiryStatus === "QUOTED" && !isExpired;
            const accept = acceptAction?.bind(null, inquiryId, quotation.id);
            const reject = rejectAction?.bind(null, inquiryId, quotation.id);

            return (
              <details
                className={styles.card}
                key={quotation.id}
                open={quotation.status === "SENT" || quotation.status === "ACCEPTED"}
              >
                <summary>
                  <span>
                    <strong>{quotation.quotationNumber}</strong> · نسخه{" "}
                    {quotation.version.toLocaleString("fa-IR")}
                  </span>
                  <b dir="ltr">{money(quotation.totalRials)}</b>
                </summary>
                <div className={styles.body}>
                  <p className={styles.status}>
                    {statusText(quotation.status)} · اعتبار تا{" "}
                    {formatQuotationDate(quotation.validUntil)}
                  </p>
                  <div className={styles.items}>
                    {quotation.items.map((item) => (
                      <div key={item.id}>
                        <span>
                          {item.description} — {item.quantity} {item.unit}
                        </span>
                        <b dir="ltr">{money(item.lineTotalRials)}</b>
                      </div>
                    ))}
                  </div>
                  <dl>
                    <div>
                      <dt>جمع اقلام</dt>
                      <dd dir="ltr">{money(quotation.subtotalRials)}</dd>
                    </div>
                    <div>
                      <dt>تخفیف</dt>
                      <dd dir="ltr">{money(quotation.discountRials)}</dd>
                    </div>
                    <div>
                      <dt>مالیات</dt>
                      <dd dir="ltr">{money(quotation.taxRials)}</dd>
                    </div>
                    <div>
                      <dt>هزینه جانبی</dt>
                      <dd dir="ltr">{money(quotation.additionalCostRials)}</dd>
                    </div>
                    <div className={styles.final}>
                      <dt>مبلغ نهایی</dt>
                      <dd dir="ltr">{money(quotation.totalRials)}</dd>
                    </div>
                  </dl>
                  <p>
                    <strong>شرایط تحویل:</strong> {quotation.deliveryTerms}
                  </p>
                  <p>
                    <strong>شرایط پرداخت:</strong> {quotation.paymentTerms}
                  </p>
                  {quotation.notes ? (
                    <p>
                      <strong>توضیحات:</strong> {quotation.notes}
                    </p>
                  ) : null}
                  <a
                    className={styles.download}
                    href={customerQuotationPdfUrl(inquiryId, quotation.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    دریافت PDF خصوصی این نسخه
                  </a>

                  {quotation.status === "ACCEPTED" ? (
                    <div className={styles.acceptedNotice}>
                      ✓ این پیشنهاد قیمت در تاریخ {formatQuotationDate(quotation.respondedAt ?? quotation.updatedAt)} توسط شما پذیرفته شد.
                    </div>
                  ) : quotation.status === "REJECTED" ? (
                    <div className={styles.rejectedNotice}>
                      ✕ این پیشنهاد قیمت در تاریخ {formatQuotationDate(quotation.respondedAt ?? quotation.updatedAt)} توسط شما رد شد.
                      {quotation.rejectionReason ? (
                        <p>علت: {quotation.rejectionReason}</p>
                      ) : null}
                    </div>
                  ) : isExpired && quotation.status === "SENT" ? (
                    <p className={styles.expiredNotice}>
                      مهلت اعتبار این پیشنهاد قیمت به پایان رسیده است.
                    </p>
                  ) : null}

                  {canRespond && accept ? (
                    <div className={styles.responseSection}>
                      <form action={accept} className={styles.acceptBox}>
                        <input
                          type="hidden"
                          name="quotationVersion"
                          value={quotation.version}
                        />
                        <input
                          type="hidden"
                          name="inquiryExpectedVersion"
                          value={inquiryVersion}
                        />
                        <p className={styles.acceptNotice}>
                          با تأیید و پذیرش این پیشنهاد قیمت، سفارش وارد فرآیند اجرا می‌شود.
                        </p>
                        <CustomerSubmitButton pendingText="در حال ثبت پذیرش…">
                          تأیید و پذیرش پیشنهاد قیمت
                        </CustomerSubmitButton>
                      </form>

                      {reject ? (
                        <details className={styles.rejectDetails}>
                          <summary className={styles.rejectSummary}>
                            رد این پیشنهاد و درخواست اصلاح
                          </summary>
                          <form action={reject} className={styles.rejectForm}>
                            <input
                              type="hidden"
                              name="quotationVersion"
                              value={quotation.version}
                            />
                            <input
                              type="hidden"
                              name="inquiryExpectedVersion"
                              value={inquiryVersion}
                            />
                            <label
                              htmlFor={`reject-reason-${quotation.id}`}
                              className={styles.label}
                            >
                              علت رد پیشنهاد (اختیاری)
                            </label>
                            <textarea
                              id={`reject-reason-${quotation.id}`}
                              name="reason"
                              maxLength={2000}
                              placeholder="در صورت تمایل، علت عدم پذیرش یا شرایط مورد نظر خود را بنویسید..."
                              className={styles.textarea}
                            />
                            <CustomerSubmitButton pendingText="در حال ثبت…">
                              ثبت رد پیشنهاد
                            </CustomerSubmitButton>
                          </form>
                        </details>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <p className={styles.empty}>
          هنوز پیشنهاد قیمتی برای این درخواست ارسال نشده است. این پیام به معنی
          قیمت، موجودی یا زمان تحویل قطعی نیست.
        </p>
      )}
    </section>
  );
}
