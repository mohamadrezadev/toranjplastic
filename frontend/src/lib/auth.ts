import "server-only";
import { cookies } from "next/headers";

export interface AuthAccount {
  id: string;
  mobile: string;
  displayName: string;
  email: string | null;
  companyName: string | null;
  role: "CUSTOMER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "DISABLED";
  createdAt: string;
  lastLoginAt: string | null;
}

const backend = (process.env.BACKEND_API_URL ?? "http://127.0.0.1:3001/api/v1").replace(/\/$/, "");
const origin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

function isAccount(value: unknown): value is AuthAccount {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.mobile === "string" && typeof item.displayName === "string" && ["CUSTOMER", "ADMIN"].includes(String(item.role)) && ["ACTIVE", "SUSPENDED", "DISABLED"].includes(String(item.status));
}

async function cookieHeader() {
  return (await cookies()).getAll().map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join("; ");
}

async function storeResponseCookies(response: Response) {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const values = headers.getSetCookie?.() ?? (response.headers.get("set-cookie") ? [response.headers.get("set-cookie")!] : []);
  const jar = await cookies();
  for (const value of values) {
    const [pair] = value.split(";");
    const separator = pair.indexOf("=");
    if (separator < 1) continue;
    const name = pair.slice(0, separator);
    const cookieValue = pair.slice(separator + 1);
    jar.set(name, cookieValue, { httpOnly: name === "toranj_session", secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: value.includes("Max-Age=0") ? 0 : undefined });
  }
}

export async function registerAccount(payload: Record<string, string>) {
  return fetch(`${backend}/auth/register`, { method: "POST", cache: "no-store", headers: { "content-type": "application/json", origin }, body: JSON.stringify(payload) });
}

export async function loginAccount(payload: { mobile: string; password: string }) {
  const response = await fetch(`${backend}/auth/login/password`, { method: "POST", cache: "no-store", headers: { "content-type": "application/json", origin }, body: JSON.stringify(payload) });
  if (response.ok) await storeResponseCookies(response);
  return response;
}

export async function getAdminAccess(): Promise<{ status: number; account?: AuthAccount }> {
  const response = await fetch(`${backend}/admin/access`, { cache: "no-store", headers: { cookie: await cookieHeader() } });
  if (!response.ok) return { status: response.status };
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("account" in payload) || !isAccount(payload.account)) return { status: 502 };
  return { status: 200, account: payload.account };
}

export async function logoutAccount() {
  const jar = await cookies();
  const csrf = jar.get("toranj_csrf")?.value ?? "";
  const response = await fetch(`${backend}/auth/logout`, { method: "POST", cache: "no-store", headers: { cookie: await cookieHeader(), origin, "x-csrf-token": csrf } });
  await storeResponseCookies(response);
  jar.delete("toranj_session");
  jar.delete("toranj_csrf");
  return response.ok;
}
