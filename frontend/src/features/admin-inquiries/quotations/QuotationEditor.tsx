"use client";
import { useMemo, useState } from "react";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { quotationIsoToTehranLocal } from "@/lib/quotation-date";
import type { Quotation, QuotationItem } from "./types";
import styles from "./Quotation.module.css";
type FormAction = (formData: FormData) => void | Promise<void>;
type EditableItem = Pick<
  QuotationItem,
  "description" | "quantity" | "unit" | "unitPriceRials"
>;
const blank = (): EditableItem => ({
  description: "",
  quantity: "1",
  unit: "عدد",
  unitPriceRials: "0",
});
const amount = (value: string) =>
  /^(0|[1-9]\d*)$/.test(value) ? BigInt(value) : BigInt("0");
const quantity = (value: string) => {
  const match = /^(?:0|[1-9]\d{0,11})(?:\.(\d{1,3}))?$/.exec(value);
  return match
    ? BigInt(value.split(".")[0]) * BigInt("1000") +
        BigInt((match[1] ?? "").padEnd(3, "0") || "0")
    : BigInt("0");
};
const money = (value: bigint) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} ریال`;
export function QuotationEditor({
  draft,
  action,
}: {
  draft?: Quotation;
  action: FormAction;
}) {
  const [items, setItems] = useState<EditableItem[]>(
    draft?.items.map(({ description, quantity, unit, unitPriceRials }) => ({
      description,
      quantity,
      unit,
      unitPriceRials,
    })) ?? [blank()],
  );
  const [discount, setDiscount] = useState(draft?.discountRials ?? "0");
  const [tax, setTax] = useState(draft?.taxRials ?? "0");
  const [additional, setAdditional] = useState(
    draft?.additionalCostRials ?? "0",
  );
  const totals = useMemo(() => {
    const lines = items.map(
      (item) =>
        (quantity(item.quantity) * amount(item.unitPriceRials)) /
        BigInt("1000"),
    );
    const subtotal = lines.reduce((sum, line) => sum + line, BigInt("0"));
    return {
      lines,
      subtotal,
      total: subtotal - amount(discount) + amount(tax) + amount(additional),
    };
  }, [items, discount, tax, additional]);
  const update = (index: number, key: keyof EditableItem, value: string) =>
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  return (
    <form action={action} className={styles.editor}>
      <input type="hidden" name="itemCount" value={items.length} />
      {draft ? (
        <input type="hidden" name="expectedVersion" value={draft.editVersion} />
      ) : null}
      <div className={styles.editorHeader}>
        <div>
          <h3>
            {draft
              ? `ویرایش پیش‌نویس نسخه ${draft.version.toLocaleString("fa-IR")}`
              : "پیش‌نویس جدید"}
          </h3>
          <p>
            همه قیمت‌ها دستی و به ریال وارد می‌شوند؛ سامانه از کاتالوگ یا موجودی
            قیمت دریافت نمی‌کند.
          </p>
        </div>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() =>
            setItems((current) =>
              current.length < 50 ? [...current, blank()] : current,
            )
          }
          disabled={items.length >= 50}
        >
          افزودن ردیف
        </button>
      </div>
      <div className={styles.items}>
        {items.map((item, index) => (
          <fieldset className={styles.item} key={index}>
            <legend>ردیف {(index + 1).toLocaleString("fa-IR")}</legend>
            <label>
              شرح
              <input
                name={`description-${index}`}
                value={item.description}
                onChange={(event) =>
                  update(index, "description", event.target.value)
                }
                required
                maxLength={500}
              />
            </label>
            <div className={styles.itemGrid}>
              <label>
                تعداد
                <input
                  name={`quantity-${index}`}
                  value={item.quantity}
                  onChange={(event) =>
                    update(index, "quantity", event.target.value)
                  }
                  dir="ltr"
                  inputMode="decimal"
                  pattern="[0-9]+([.][0-9]{1,3})?"
                  required
                />
              </label>
              <label>
                واحد
                <input
                  name={`unit-${index}`}
                  value={item.unit}
                  onChange={(event) =>
                    update(index, "unit", event.target.value)
                  }
                  required
                  maxLength={40}
                />
              </label>
              <label>
                قیمت واحد (ریال)
                <input
                  name={`unitPriceRials-${index}`}
                  value={item.unitPriceRials}
                  onChange={(event) =>
                    update(index, "unitPriceRials", event.target.value)
                  }
                  dir="ltr"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  required
                />
              </label>
            </div>
            <div className={styles.lineTotal}>
              جمع ردیف: <b dir="ltr">{money(totals.lines[index])}</b>
            </div>
            {items.length > 1 ? (
              <button
                className={styles.removeButton}
                type="button"
                onClick={() =>
                  setItems((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                حذف ردیف
              </button>
            ) : null}
          </fieldset>
        ))}
      </div>
      <div className={styles.adjustments}>
        <label>
          تخفیف (ریال)
          <input
            name="discountRials"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            dir="ltr"
            inputMode="numeric"
            pattern="[0-9]+"
            required
          />
        </label>
        <label>
          مالیات (ریال)
          <input
            name="taxRials"
            value={tax}
            onChange={(event) => setTax(event.target.value)}
            dir="ltr"
            inputMode="numeric"
            pattern="[0-9]+"
            required
          />
        </label>
        <label>
          هزینه جانبی (ریال)
          <input
            name="additionalCostRials"
            value={additional}
            onChange={(event) => setAdditional(event.target.value)}
            dir="ltr"
            inputMode="numeric"
            pattern="[0-9]+"
            required
          />
        </label>
      </div>
      <div className={styles.totalBox}>
        <span>
          جمع اقلام <b dir="ltr">{money(totals.subtotal)}</b>
        </span>
        <strong>
          مبلغ نهایی <b dir="ltr">{money(totals.total)}</b>
        </strong>
      </div>
      <div className={styles.terms}>
        <label>
          اعتبار تا
          <input
            type="datetime-local"
            name="validUntil"
            defaultValue={
              draft ? quotationIsoToTehranLocal(draft.validUntil) : ""
            }
            aria-describedby="quotation-valid-until-hint"
            dir="ltr"
            required
          />
          <span id="quotation-valid-until-hint" className={styles.fieldHint}>
            تاریخ و ساعت براساس منطقه زمانی ایران ثبت می‌شود.
          </span>
        </label>
        <label>
          شرایط تحویل
          <textarea
            name="deliveryTerms"
            defaultValue={draft?.deliveryTerms ?? ""}
            required
            maxLength={2000}
          />
        </label>
        <label>
          شرایط پرداخت
          <textarea
            name="paymentTerms"
            defaultValue={draft?.paymentTerms ?? ""}
            required
            maxLength={2000}
          />
        </label>
        <label>
          توضیحات اختیاری
          <textarea
            name="notes"
            defaultValue={draft?.notes ?? ""}
            maxLength={4000}
          />
        </label>
      </div>
      <AdminSubmitButton pendingText="در حال ذخیره…">
        ذخیره پیش‌نویس
      </AdminSubmitButton>
    </form>
  );
}
