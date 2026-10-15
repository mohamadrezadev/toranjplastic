import "server-only";
import { protectedHeaders } from "@/lib/auth";
import type { StaffAccount, StaffFilters, StaffPage, StaffRole, StaffStatus } from "./types";

export class StaffApiError extends Error {
  constructor(public status: number, public code = "failed") { super("Staff API error"); }
}

const backend = (process.env.BACKEND_API_URL ?? "http://127.0.0.1:3001/api/v1").replace(/\/$/, "");
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object";
const roles: StaffRole[] = ["ADMIN", "SALES", "OPERATOR"];
const statuses = ["ACTIVE", "SUSPENDED", "DISABLED"];

export function isStaffAccount(value: unknown): value is StaffAccount {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && typeof value.mobile === "string" && typeof value.displayName === "string" && roles.includes(value.role as StaffRole) && statuses.includes(String(value.status)) && Number.isInteger(value.version) && typeof value.createdAt === "string" && typeof value.updatedAt === "string" && (value.lastLoginAt === null || typeof value.lastLoginAt === "string");
}

async function fail(response: Response): Promise<never> {
  let code = response.status === 403 ? "forbidden" : response.status === 409 ? "conflict" : response.status === 400 ? "validation" : "failed";
  try { const body: unknown = await response.json(); if (isRecord(body) && typeof body.code === "string") code = body.code; } catch { /* generic */ }
  throw new StaffApiError(response.status, code);
}

async function request(path: string, init: RequestInit = {}) {
  const mutating = Boolean(init.method && init.method !== "GET");
  const response = await fetch(`${backend}/admin/staff${path}`, { ...init, cache: "no-store", headers: { Accept: "application/json", ...(await protectedHeaders(mutating)), ...init.headers } });
  if (!response.ok) return fail(response);
  return response.json() as Promise<unknown>;
}

export async function listStaff(filters: StaffFilters = {}): Promise<StaffPage> {
  const query = new URLSearchParams({ page: String(filters.page ?? 1), pageSize: String(filters.pageSize ?? 20) });
  if (filters.role) query.set("role", filters.role);
  if (filters.status) query.set("status", filters.status);
  const value = await request(`?${query}`);
  if (!isRecord(value) || !Array.isArray(value.items) || !value.items.every(isStaffAccount) || ![value.page, value.pageSize, value.total, value.pageCount].every(Number.isInteger)) throw new StaffApiError(502);
  return value as unknown as StaffPage;
}

export async function getStaff(id: string): Promise<StaffAccount> {
  const value = await request(`/${encodeURIComponent(id)}`);
  if (!isStaffAccount(value)) throw new StaffApiError(502);
  return value;
}

async function mutate(path: string, method: "POST" | "PATCH", body: unknown) {
  const value = await request(path, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!isStaffAccount(value)) throw new StaffApiError(502);
  return value;
}

export const createStaff = (body: { mobile: string; displayName: string; password: string; role: StaffRole }) => mutate("", "POST", body);
export const changeStaffRole = (id: string, role: StaffRole, expectedVersion: number) => mutate(`/${encodeURIComponent(id)}/role`, "PATCH", { role, expectedVersion });
export const changeStaffStatus = (id: string, status: StaffStatus, expectedVersion: number) => mutate(`/${encodeURIComponent(id)}/status`, "PATCH", { status, expectedVersion });
