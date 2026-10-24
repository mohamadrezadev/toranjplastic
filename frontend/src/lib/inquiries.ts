import "server-only";
import { protectedHeaders } from "./auth";

export const inquiryTypes = ["PRODUCT", "INJECTION_SERVICE", "MATERIAL", "GENERAL_CONTACT"] as const;
export const inquiryStatuses = ["SUBMITTED", "UNDER_REVIEW", "NEED_MORE_INFO", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"] as const;
export type InquiryType = (typeof inquiryTypes)[number];
export type InquiryStatus = (typeof inquiryStatuses)[number];

export interface InquiryMessage {
  id: string;
  senderType: "CUSTOMER" | "STAFF";
  authorDisplayName: string;
  text: string;
  createdAt: string;
}

export interface CustomerInquiry {
  id: string; type: InquiryType; status: InquiryStatus; version?: number; catalogItemName: string | null;
  description: string | null; approximateQuantity: string | null; quantityUnit: string | null;
  deliveryCity: string | null; requestedTiming: string | null; partDescription: string | null;
  moldStatus: string | null; materialName: string | null; color: string | null;
  materialRequestKind: "PRICE_QUOTE" | "SUPPLY_REQUEST" | "AVAILABILITY_REVIEW" | null;
  polymerName: string | null; grade: string | null; brand: string | null;
  materialCondition: "NEW" | "RECYCLED" | null; application: string | null;
  specifications: string | null; createdAt: string; updatedAt: string;
  statusHistory: Array<{ id: string; fromStatus: InquiryStatus | null; toStatus: InquiryStatus; createdAt: string }>;
}

export interface CustomerInquiryDetail extends CustomerInquiry { messages: InquiryMessage[] }

export interface InquiryPage { items: CustomerInquiry[]; page: number; pageSize: number; total: number; pageCount: number }
export class InquiryApiError extends Error { constructor(public status: number) { super("Inquiry API error"); } }

const backend = (process.env.BACKEND_API_URL ?? "http://127.0.0.1:3001/api/v1").replace(/\/$/, "");
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const nullableString = (value: unknown) => value === null || typeof value === "string";

export function isCustomerInquiry(value: unknown): value is CustomerInquiry {
  if (!record(value) || typeof value.id !== "string" || !inquiryTypes.includes(value.type as InquiryType) || !inquiryStatuses.includes(value.status as InquiryStatus)) return false;
  const nullableKeys = ["catalogItemName", "description", "approximateQuantity", "quantityUnit", "deliveryCity", "requestedTiming", "partDescription", "moldStatus", "materialName", "color", "polymerName", "grade", "brand", "application", "specifications"];
  return nullableKeys.every((key) => nullableString(value[key])) && typeof value.createdAt === "string" && typeof value.updatedAt === "string" && Array.isArray(value.statusHistory) && value.statusHistory.every((item) => record(item) && typeof item.id === "string" && inquiryStatuses.includes(item.toStatus as InquiryStatus) && typeof item.createdAt === "string");
}

const isInquiryMessage = (value: unknown): value is InquiryMessage => record(value) && typeof value.id === "string" && (value.senderType === "CUSTOMER" || value.senderType === "STAFF") && typeof value.authorDisplayName === "string" && typeof value.text === "string" && typeof value.createdAt === "string";
export const isCustomerInquiryDetail = (value: unknown): value is CustomerInquiryDetail => isCustomerInquiry(value) && record(value) && Array.isArray(value.messages) && value.messages.every(isInquiryMessage);

async function parse(response: Response) {
  if (!response.ok) throw new InquiryApiError(response.status);
  try { return await response.json() as unknown; } catch { throw new InquiryApiError(502); }
}

export async function listInquiries(filters: { type?: string; status?: string; page?: number } = {}): Promise<InquiryPage> {
  const query = new URLSearchParams({ page: String(filters.page ?? 1), pageSize: "12" });
  if (inquiryTypes.includes(filters.type as InquiryType)) query.set("type", filters.type!);
  if (inquiryStatuses.includes(filters.status as InquiryStatus)) query.set("status", filters.status!);
  const payload = await parse(await fetch(`${backend}/inquiries?${query}`, { cache: "no-store", headers: await protectedHeaders() }));
  if (!record(payload) || !Array.isArray(payload.items) || !payload.items.every(isCustomerInquiry) || typeof payload.total !== "number" || typeof payload.page !== "number" || typeof payload.pageSize !== "number" || typeof payload.pageCount !== "number") throw new InquiryApiError(502);
  return payload as unknown as InquiryPage;
}

export async function getInquiry(id: string): Promise<CustomerInquiryDetail> {
  const payload = await parse(await fetch(`${backend}/inquiries/${encodeURIComponent(id)}`, { cache: "no-store", headers: await protectedHeaders() }));
  if (!isCustomerInquiryDetail(payload)) throw new InquiryApiError(502);
  return payload;
}

export async function addInquiryMessage(id: string, text: string): Promise<CustomerInquiryDetail> {
  const payload = await parse(await fetch(`${backend}/inquiries/${encodeURIComponent(id)}/messages`, {
    method: "POST",
    cache: "no-store",
    headers: { ...(await protectedHeaders(true)), "content-type": "application/json" },
    body: JSON.stringify({ text }),
  }));
  if (!isCustomerInquiryDetail(payload)) throw new InquiryApiError(502);
  return payload;
}

export async function createInquiry(kind: string, payload: Record<string, string>) {
  const segment = { product: "product", injection: "injection-service", material: "material", contact: "contact" }[kind];
  if (!segment) throw new InquiryApiError(400);
  const response = await fetch(`${backend}/inquiries/${segment}`, { method: "POST", cache: "no-store", headers: { ...(await protectedHeaders(true)), "content-type": "application/json" }, body: JSON.stringify(payload) });
  const body = await parse(response);
  if (!isCustomerInquiry(body)) throw new InquiryApiError(502);
  return body;
}
