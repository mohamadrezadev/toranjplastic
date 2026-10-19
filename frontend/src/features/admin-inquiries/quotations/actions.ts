"use server";
import { redirect } from "next/navigation";
import { quotationTehranLocalToIso } from "@/lib/quotation-date";
import {
  createQuotationDraft,
  QuotationApiError,
  reviseQuotation,
  sendQuotation,
  updateQuotationDraft,
} from "./api";
import type { QuotationDraftInput } from "./types";

const value = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const rials = (value: string) =>
  /^(0|[1-9]\d{0,18})$/.test(value) ? BigInt(value) : BigInt("0");
const quantity = (value: string) => {
  const match = /^(?:0|[1-9]\d{0,11})(?:\.(\d{1,3}))?$/.exec(value);
  if (!match) return BigInt("0");
  return (
    BigInt(value.split(".")[0]) * BigInt("1000") +
    BigInt((match[1] ?? "").padEnd(3, "0") || "0")
  );
};
function input(form: FormData): QuotationDraftInput {
  const count = Math.min(
    50,
    Math.max(1, Number(value(form, "itemCount")) || 1),
  );
  const items = Array.from({ length: count }, (_, index) => {
    const quantityValue = value(form, `quantity-${index}`);
    const unitPriceRials = value(form, `unitPriceRials-${index}`);
    const scaled = quantity(quantityValue) * rials(unitPriceRials);
    return {
      description: value(form, `description-${index}`),
      quantity: quantityValue,
      unit: value(form, `unit-${index}`),
      unitPriceRials,
      lineTotalRials: (scaled / BigInt("1000")).toString(),
    };
  });
  const subtotal = items.reduce(
    (sum, item) => sum + rials(item.lineTotalRials),
    BigInt("0"),
  );
  const discount = rials(value(form, "discountRials"));
  const tax = rials(value(form, "taxRials"));
  const additional = rials(value(form, "additionalCostRials"));
  return {
    items,
    subtotalRials: subtotal.toString(),
    discountRials: discount.toString(),
    taxRials: tax.toString(),
    additionalCostRials: additional.toString(),
    totalRials: (subtotal - discount + tax + additional).toString(),
    validUntil: quotationTehranLocalToIso(value(form, "validUntil")),
    deliveryTerms: value(form, "deliveryTerms"),
    paymentTerms: value(form, "paymentTerms"),
    notes: value(form, "notes") || undefined,
  };
}
const failure = (id: string, error: unknown) =>
  `/admin/inquiries/${id}?error=${encodeURIComponent(error instanceof QuotationApiError ? (error.code ?? "quotation") : "quotation")}`;
export async function saveQuotationDraftAction(
  inquiryId: string,
  quotationId: string | null,
  form: FormData,
) {
  try {
    if (quotationId) {
      await updateQuotationDraft(
        inquiryId,
        quotationId,
        input(form),
        Number(value(form, "expectedVersion")),
      );
    } else {
      await createQuotationDraft(inquiryId, input(form));
    }
  } catch (error) {
    redirect(failure(inquiryId, error));
  }
  redirect(`/admin/inquiries/${inquiryId}?success=quotation-draft`);
}
export async function reviseQuotationAction(
  inquiryId: string,
  quotationId: string,
  form: FormData,
) {
  try {
    await reviseQuotation(
      inquiryId,
      quotationId,
      Number(value(form, "expectedVersion")),
    );
  } catch (error) {
    redirect(failure(inquiryId, error));
  }
  redirect(`/admin/inquiries/${inquiryId}?success=quotation-revision`);
}
export async function sendQuotationAction(
  inquiryId: string,
  quotationId: string,
  form: FormData,
) {
  if (value(form, "confirm") !== "yes")
    redirect(`/admin/inquiries/${inquiryId}?error=quotation-confirm`);
  try {
    await sendQuotation(
      inquiryId,
      quotationId,
      Number(value(form, "expectedVersion")),
      Number(value(form, "inquiryExpectedVersion")),
    );
  } catch (error) {
    redirect(failure(inquiryId, error));
  }
  redirect(`/admin/inquiries/${inquiryId}?success=quotation-sent`);
}
