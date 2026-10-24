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
  status: "SENT" | "SUPERSEDED" | "ACCEPTED" | "REJECTED";
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
  respondedAt?: string | null;
  rejectionReason?: string | null;
  isExpired?: boolean;
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
  ["SENT", "SUPERSEDED", "ACCEPTED", "REJECTED"].includes(String(value.status)) &&
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
  (value.notes === null || typeof value.notes === "string") &&
  (value.respondedAt === undefined || value.respondedAt === null || typeof value.respondedAt === "string") &&
  (value.rejectionReason === undefined || value.rejectionReason === null || typeof value.rejectionReason === "string");

export class CustomerQuotationApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "CustomerQuotationApiError";
  }
}

export async function listCustomerQuotations(
  inquiryId: string,
): Promise<CustomerQuotation[]> {
  const response = await fetch(
    `${backend}/inquiries/${encodeURIComponent(inquiryId)}/quotations`,
    { cache: "no-store", headers: await protectedHeaders() },
  );
  if (!response.ok) return [];
  const body: unknown = await response.json();
  if (!Array.isArray(body) || !body.every(quotation)) return [];
  const now = Date.now();
  return body.map((item) => ({
    ...item,
    isExpired: new Date(item.validUntil).getTime() <= now,
  }));
}

export async function acceptCustomerQuotation(
  inquiryId: string,
  quotationId: string,
  quotationVersion: number,
  inquiryExpectedVersion: number,
): Promise<CustomerQuotation> {
  const response = await fetch(
    `${backend}/inquiries/${encodeURIComponent(inquiryId)}/quotations/${encodeURIComponent(quotationId)}/accept`,
    {
      method: "POST",
      headers: {
        ...(await protectedHeaders(true)),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quotationVersion, inquiryExpectedVersion }),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new CustomerQuotationApiError(
      errorBody?.message ?? "خطا در پذیرش پیشنهاد قیمت.",
      response.status,
      errorBody?.code,
    );
  }
  const body: unknown = await response.json();
  if (!quotation(body)) throw new CustomerQuotationApiError("پاسخ نامعتبر از سرور.", 502);
  return {
    ...body,
    isExpired: new Date(body.validUntil).getTime() <= Date.now(),
  };
}

export async function rejectCustomerQuotation(
  inquiryId: string,
  quotationId: string,
  quotationVersion: number,
  inquiryExpectedVersion: number,
  reason?: string,
): Promise<CustomerQuotation> {
  const response = await fetch(
    `${backend}/inquiries/${encodeURIComponent(inquiryId)}/quotations/${encodeURIComponent(quotationId)}/reject`,
    {
      method: "POST",
      headers: {
        ...(await protectedHeaders(true)),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quotationVersion, inquiryExpectedVersion, reason }),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new CustomerQuotationApiError(
      errorBody?.message ?? "خطا در رد پیشنهاد قیمت.",
      response.status,
      errorBody?.code,
    );
  }
  const body: unknown = await response.json();
  if (!quotation(body)) throw new CustomerQuotationApiError("پاسخ نامعتبر از سرور.", 502);
  return {
    ...body,
    isExpired: new Date(body.validUntil).getTime() <= Date.now(),
  };
}
export const customerQuotationPdfUrl = (
  inquiryId: string,
  quotationId: string,
) =>
  `${backend}/inquiries/${encodeURIComponent(inquiryId)}/quotations/${encodeURIComponent(quotationId)}/pdf`;
