import "server-only";
import { cookies } from "next/headers";
import { isAdminInquiry, isAdminInquiryPage, isAdminInquirySummary, isAssignees, isRecord } from "./contracts";
import type { AdminInquiry, AdminInquiryFilters } from "./types";
import { inquiryQuery } from "./query";

export type AdminInquiryErrorKind = "validation" | "not_found" | "conflict" | "forbidden" | "failed";
export class AdminInquiryError extends Error {
  constructor(public kind: AdminInquiryErrorKind, public status: number, public code?: string) { super("Admin inquiry API error"); }
}

const backend = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001/api/v1").replace(/\/$/, "");
const origin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

async function cookieHeader() { return (await cookies()).getAll().map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join("; "); }
async function csrfToken() { return (await cookies()).get("toranj_csrf")?.value ?? ""; }

async function failure(response: Response): Promise<never> {
  let code: string | undefined;
  try { const body: unknown = await response.json(); if (isRecord(body) && typeof body.code === "string") code = body.code; } catch { /* safe generic failure */ }
  const kind: AdminInquiryErrorKind = response.status === 400 ? "validation" : response.status === 404 ? "not_found" : response.status === 409 ? "conflict" : response.status === 401 || response.status === 403 ? "forbidden" : "failed";
  throw new AdminInquiryError(kind, response.status, code);
}

async function request<T>(path: string, parser: (value: unknown) => value is T, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${backend}/admin/inquiries${path}`, { ...init, cache: "no-store", headers: { cookie: await cookieHeader(), Accept: "application/json", ...init.headers } });
  } catch { throw new AdminInquiryError("failed", 0); }
  if (!response.ok) return failure(response);
  let body: unknown;
  try { body = await response.json(); } catch { throw new AdminInquiryError("failed", 502); }
  if (!parser(body)) throw new AdminInquiryError("failed", 502);
  return body;
}

export const listAdminInquiries = (filters: AdminInquiryFilters = {}) => request(`?${inquiryQuery(filters)}`, isAdminInquiryPage);
export const getAdminInquirySummary = () => request("/summary", isAdminInquirySummary);
export const listAdminAssignees = () => request("/assignees", isAssignees);
export const getAdminInquiry = (id: string) => request(`/${encodeURIComponent(id)}`, isAdminInquiry);

async function mutate(path: string, method: "POST" | "PATCH", body: unknown): Promise<AdminInquiry> {
  return request(path, isAdminInquiry, { method, headers: { origin, "content-type": "application/json", "x-csrf-token": await csrfToken() }, body: JSON.stringify(body) });
}

export const updateInquiryStatus = (id: string, toStatus: string, expectedVersion: number) => mutate(`/${encodeURIComponent(id)}/status`, "POST", { toStatus, expectedVersion });
export const updateInquiryAssignment = (id: string, assignedAdminId: string | null, expectedVersion: number) => mutate(`/${encodeURIComponent(id)}/assignment`, "PATCH", { assignedAdminId, expectedVersion });
export const addInquiryNote = (id: string, text: string) => mutate(`/${encodeURIComponent(id)}/notes`, "POST", { text });
export const addCustomerVisibleMessage = (id: string, text: string, requestMoreInfo: boolean, expectedVersion: number) => mutate(`/${encodeURIComponent(id)}/messages`, "POST", { text, requestMoreInfo, expectedVersion });
