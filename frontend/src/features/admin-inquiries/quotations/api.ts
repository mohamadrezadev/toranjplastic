import "server-only";
import { protectedHeaders } from "@/lib/auth";
import { isQuotation, isQuotations } from "./contracts";
import type { Quotation, QuotationDraftInput } from "./types";

export class QuotationApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
  ) {
    super("Quotation API error");
  }
}
const backend = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api/v1"
).replace(/\/$/, "");
async function parse<T>(
  response: Response,
  guard: (value: unknown) => value is T,
): Promise<T> {
  if (!response.ok) {
    let code: string | undefined;
    try {
      const body = (await response.json()) as { code?: unknown };
      if (typeof body.code === "string") code = body.code;
    } catch {}
    throw new QuotationApiError(response.status, code);
  }
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new QuotationApiError(502);
  }
  if (!guard(value)) throw new QuotationApiError(502);
  return value;
}
const base = (inquiryId: string) =>
  `${backend}/admin/inquiries/${encodeURIComponent(inquiryId)}/quotations`;
export const listAdminQuotations = async (inquiryId: string) =>
  parse(
    await fetch(base(inquiryId), {
      cache: "no-store",
      headers: await protectedHeaders(),
    }),
    isQuotations,
  );
async function mutate(
  inquiryId: string,
  path: string,
  method: "POST" | "PUT",
  body: unknown,
): Promise<Quotation> {
  return parse(
    await fetch(`${base(inquiryId)}${path}`, {
      method,
      cache: "no-store",
      headers: {
        ...(await protectedHeaders(true)),
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
    isQuotation,
  );
}
export const createQuotationDraft = (
  inquiryId: string,
  input: QuotationDraftInput,
) => mutate(inquiryId, "", "POST", input);
export const updateQuotationDraft = (
  inquiryId: string,
  quotationId: string,
  input: QuotationDraftInput,
  expectedVersion: number,
) =>
  mutate(inquiryId, `/${encodeURIComponent(quotationId)}`, "PUT", {
    ...input,
    expectedVersion,
  });
export const reviseQuotation = (
  inquiryId: string,
  quotationId: string,
  expectedVersion: number,
) =>
  mutate(inquiryId, `/${encodeURIComponent(quotationId)}/revisions`, "POST", {
    expectedVersion,
  });
export const sendQuotation = (
  inquiryId: string,
  quotationId: string,
  expectedVersion: number,
  inquiryExpectedVersion: number,
) =>
  mutate(inquiryId, `/${encodeURIComponent(quotationId)}/send`, "POST", {
    expectedVersion,
    inquiryExpectedVersion,
  });
export const adminQuotationPdfUrl = (inquiryId: string, quotationId: string) =>
  `${backend}/admin/inquiries/${encodeURIComponent(inquiryId)}/quotations/${encodeURIComponent(quotationId)}/pdf`;
