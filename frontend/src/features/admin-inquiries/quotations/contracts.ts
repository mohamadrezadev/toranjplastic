import type { Quotation } from "./types";
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const string = (value: unknown): value is string => typeof value === "string";
const nullableString = (value: unknown) => value === null || string(value);
const item = (value: unknown) =>
  record(value) &&
  string(value.id) &&
  typeof value.position === "number" &&
  ["description", "quantity", "unit", "unitPriceRials", "lineTotalRials"].every(
    (key) => string(value[key]),
  );
export const isQuotation = (value: unknown): value is Quotation =>
  record(value) &&
  string(value.id) &&
  string(value.inquiryId) &&
  string(value.quotationNumber) &&
  typeof value.version === "number" &&
  typeof value.editVersion === "number" &&
  ["DRAFT", "SENT", "SUPERSEDED"].includes(String(value.status)) &&
  Array.isArray(value.items) &&
  value.items.every(item) &&
  [
    "subtotalRials",
    "discountRials",
    "taxRials",
    "additionalCostRials",
    "totalRials",
    "validUntil",
    "deliveryTerms",
    "paymentTerms",
    "createdAt",
    "updatedAt",
  ].every((key) => string(value[key])) &&
  nullableString(value.notes) &&
  nullableString(value.sentAt);
export const isQuotations = (value: unknown): value is Quotation[] =>
  Array.isArray(value) && value.every(isQuotation);
