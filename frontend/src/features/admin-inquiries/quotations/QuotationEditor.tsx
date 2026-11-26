"use client";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminFieldset } from "@/components/admin/AdminContent";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { Button, Input, Textarea } from "@/components/ui";
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
const itemFieldId = (index: number) => `quotation-item-${index}-description`;

/*
 * Quotation draft editor (OpenSpec change rebuild-ui-with-astryx, task 8.4).
 * Same form contract as before: `itemCount`, `description-N`, `quantity-N`,
 * `unit-N`, `unitPriceRials-N`, the three adjustments, `validUntil` (Iran local
 * time), the terms and `expectedVersion` of the draft. Rows are Astryx-styled
 * fieldsets of the shared fields; the running totals use integer arithmetic only
 * and are a convenience, the backend recomputes and rejects a mismatch. When a
 * row is added the new row's first field gets focus; when one is removed focus
 * moves to the add button so it is never lost.
 */
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
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });
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
      <VStack gap={4}>
        <HStack gap={3} hAlign="between" vAlign="start" wrap="wrap">
          <VStack gap={1} hAlign="start" className={styles.editorCopy}>
            <Heading level={3} color="inherit" className={styles.editorTitle}>
              {draft
                ? `ویرایش پیش‌نویس نسخه ${draft.version.toLocaleString("fa-IR")}`
                : "پیش‌نویس جدید"}
            </Heading>
            <Text as="p" type="supporting" color="secondary">
              همه قیمت‌ها دستی و به ریال وارد می‌شوند؛ سامانه از کاتالوگ یا موجودی
              قیمت دریافت نمی‌کند.
            </Text>
          </VStack>
          <Button
            id="quotation-add-item"
            type="button"
            variant="secondary"
            onClick={() => {
              if (items.length >= 50) return;
              pendingFocus.current = itemFieldId(items.length);
              setItems((current) => [...current, blank()]);
            }}
            disabled={items.length >= 50}
          >
            افزودن ردیف
          </Button>
        </HStack>

        <VStack gap={3}>
          {items.map((item, index) => (
            <AdminFieldset key={index} legend={<>ردیف {(index + 1).toLocaleString("fa-IR")}</>}>
              <Input
                id={itemFieldId(index)}
                label="شرح"
                name={`description-${index}`}
                value={item.description}
                onChange={(event) =>
                  update(index, "description", event.target.value)
                }
                required
                maxLength={500}
              />
              <Grid columns={{ minWidth: 160 }} gap={3} align="start" className={styles.itemGrid}>
                <Input
                  label="تعداد"
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
                <Input
                  label="واحد"
                  name={`unit-${index}`}
                  value={item.unit}
                  onChange={(event) =>
                    update(index, "unit", event.target.value)
                  }
                  required
                  maxLength={40}
                />
                <Input
                  label="قیمت واحد (ریال)"
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
              </Grid>
              <HStack gap={3} hAlign="between" vAlign="center" wrap="wrap">
                <Text as="span">
                  جمع ردیف: <b dir="ltr">{money(totals.lines[index])}</b>
                </Text>
                {items.length > 1 ? (
                  <Button
                    type="button"
                    variant="danger"
                    aria-label={`حذف ردیف ${(index + 1).toLocaleString("fa-IR")}`}
                    onClick={() => {
                      pendingFocus.current = "quotation-add-item";
                      setItems((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      );
                    }}
                  >
                    حذف ردیف
                  </Button>
                ) : null}
              </HStack>
            </AdminFieldset>
          ))}
        </VStack>

        <Grid columns={{ minWidth: 160 }} gap={3} align="start" className={styles.adjustments}>
          <Input
            label="تخفیف (ریال)"
            name="discountRials"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            dir="ltr"
            inputMode="numeric"
            pattern="[0-9]+"
            required
          />
          <Input
            label="مالیات (ریال)"
            name="taxRials"
            value={tax}
            onChange={(event) => setTax(event.target.value)}
            dir="ltr"
            inputMode="numeric"
            pattern="[0-9]+"
            required
          />
          <Input
            label="هزینه جانبی (ریال)"
            name="additionalCostRials"
            value={additional}
            onChange={(event) => setAdditional(event.target.value)}
            dir="ltr"
            inputMode="numeric"
            pattern="[0-9]+"
            required
          />
        </Grid>

        <Card variant="muted">
          <HStack gap={4} hAlign="between" vAlign="center" wrap="wrap">
            <Text as="span">
              جمع اقلام <b dir="ltr">{money(totals.subtotal)}</b>
            </Text>
            <Text as="span" weight="bold" color="inherit">
              مبلغ نهایی <b dir="ltr">{money(totals.total)}</b>
            </Text>
          </HStack>
        </Card>

        <VStack gap={3}>
          <Input
            type="datetime-local"
            label="اعتبار تا"
            name="validUntil"
            defaultValue={
              draft ? quotationIsoToTehranLocal(draft.validUntil) : ""
            }
            helpText="تاریخ و ساعت براساس منطقه زمانی ایران ثبت می‌شود."
            dir="ltr"
            required
          />
          <Textarea
            label="شرایط تحویل"
            name="deliveryTerms"
            defaultValue={draft?.deliveryTerms ?? ""}
            required
            maxLength={2000}
          />
          <Textarea
            label="شرایط پرداخت"
            name="paymentTerms"
            defaultValue={draft?.paymentTerms ?? ""}
            required
            maxLength={2000}
          />
          <Textarea
            label="توضیحات اختیاری"
            name="notes"
            defaultValue={draft?.notes ?? ""}
            maxLength={4000}
          />
        </VStack>
        <div>
          <AdminSubmitButton pendingText="در حال ذخیره…">
            ذخیره پیش‌نویس
          </AdminSubmitButton>
        </div>
      </VStack>
    </form>
  );
}
