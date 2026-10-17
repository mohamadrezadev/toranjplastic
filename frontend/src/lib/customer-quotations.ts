import "server-only";
import { protectedHeaders } from "./auth";
export interface CustomerQuotationItem {
  id: string;
  position: number;
  description: string;
  quantity: string;
  unit: string;
  unitPriceRials: string;
  lineTotalRials: string;
}
export interface CustomerQuotation {
  id: string;
  inquiryId: string;
  quotationNumber: string;
  version: number;
  status: "SENT" | "SUPERSEDED";
  items: CustomerQuotationItem[];
  subtotalRials: string;
  discountRials: string;
  taxRials: string;
  additionalCostRials: string;
  totalRials: string;
  validUntil: string;
  deliveryTerms: string;
  paymentTerms: string;
  notes: string | null;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}
const backend = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api/v1"
).replace(/\/$/, "");
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const item = (value: unknown): value is CustomerQuotationItem =>
  record(value) &&
  typeof value.id === "string" &&
  typeof value.position === "number" &&
  ["description", "quantity", "unit", "unitPriceRials", "lineTotalRials"].every(
    (key) => typeof value[key] === "string",
  );
const quotation = (value: unknown): value is CustomerQuotation =>
  record(value) &&
  typeof value.id === "string" &&
  typeof value.inquiryId === "string" &&
  typeof value.quotationNumber === "string" &&
  typeof value.version === "number" &&
  (value.status === "SENT" || value.status === "SUPERSEDED") &&
  !("editVersion" in value) &&
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
    "sentAt",
    "createdAt",
    "updatedAt",
  ].every((key) => typeof value[key] === "string") &&
  (value.notes === null || typeof value.notes === "string");
export async function listCustomerQuotations(
  inquiryId: string,
): Promise<CustomerQuotation[]> {
  const response = await fetch(
    `${backend}/inquiries/${encodeURIComponent(inquiryId)}/quotations`,
    { cache: "no-store", headers: await protectedHeaders() },
  );
  if (!response.ok) return [];
  const body: unknown = await response.json();
  return Array.isArray(body) && body.every(quotation) ? body : [];
}
export const customerQuotationPdfUrl = (
  inquiryId: string,
  quotationId: string,
) =>
  `${backend}/inquiries/${encodeURIComponent(inquiryId)}/quotations/${encodeURIComponent(quotationId)}/pdf`;
