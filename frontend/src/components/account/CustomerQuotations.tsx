import {
  customerQuotationPdfUrl,
  type CustomerQuotation,
} from "@/lib/customer-quotations";
import styles from "./CustomerQuotations.module.css";
const money = (value: string) =>
  `${new Intl.NumberFormat("fa-IR").format(BigInt(value))} ریال`;
const date = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
    new Date(value),
  );
export function CustomerQuotations({
  inquiryId,
  quotations,
}: {
  inquiryId: string;
  quotations: CustomerQuotation[];
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
          {quotations.map((quotation) => (
            <details
              className={styles.card}
              key={quotation.id}
              open={quotation.status === "SENT"}
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
                  {quotation.status === "SENT"
                    ? "نسخه جاری"
                    : "نسخه جایگزین‌شده"}{" "}
                  · اعتبار تا {date(quotation.validUntil)}
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
              </div>
            </details>
          ))}
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
