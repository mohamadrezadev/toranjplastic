import "server-only";
import { cookies } from "next/headers";
import { isNullableString, isRecord, isString } from './value-guards';
import { AdminContentError } from './errors';
import type { AdminListQuery, ContentStatus, PageResult } from './contracts';
import type { AdminContentErrorKind } from './errors';

function errorKindForStatus(status: number): AdminContentErrorKind {
  if (status === 400) return "validation";
  if (status === 409) return "conflict";
  if (status === 404) return "not_found";
  return "failed";
}

export function isContentStatus(value: unknown): value is ContentStatus {
  return value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED";
}

export function hasLifecycle(value: Record<string, unknown>): boolean {
  return (
    isString(value.id) &&
    isContentStatus(value.status) &&
    (value.publishedAt === null || isString(value.publishedAt)) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    typeof value.displayOrder === "number" &&
    isNullableString(value.metaTitle) &&
    isNullableString(value.metaDescription)
  );
}

export function isPage<T>(itemParser: (value: unknown) => value is T) {
  return (value: unknown): value is PageResult<T> => {
    if (!isRecord(value) || !Array.isArray(value.items) || !value.items.every(itemParser) || !isRecord(value.pageInfo)) return false;
    const info = value.pageInfo;
    return typeof info.page === "number" && typeof info.pageSize === "number" && typeof info.total === "number" && typeof info.totalPages === "number";
  };
}

const backend = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001/api/v1").replace(/\/$/, "");
const origin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

async function cookieHeader() {
  return (await cookies()).getAll().map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join("; ");
}

async function csrfToken() {
  return (await cookies()).get("toranj_csrf")?.value ?? "";
}

async function parseOrFail<T>(response: Response, parser: (value: unknown) => value is T): Promise<T> {
  if (!response.ok) {
    let code: string | undefined;
    try {
      const payload: unknown = await response.json();
      if (payload && typeof payload === "object" && "code" in payload && typeof payload.code === "string") {
        code = payload.code;
      }
    } catch {
      // response might not be JSON
    }
    throw new AdminContentError(errorKindForStatus(response.status), response.status, code);
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AdminContentError("failed", response.status);
  }
  if (!parser(payload)) throw new AdminContentError("failed", response.status);
  return payload;
}

export async function adminRequest<T>(path: string, parser: (value: unknown) => value is T): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${backend}/admin/content/${path}`, { cache: "no-store", headers: { cookie: await cookieHeader(), Accept: "application/json" } });
  } catch {
    throw new AdminContentError("failed", 0);
  }
  return parseOrFail(response, parser);
}

export async function adminMutate<T>(path: string, method: "POST" | "PATCH", body: unknown, parser: (value: unknown) => value is T): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${backend}/admin/content/${path}`, {
      method,
      cache: "no-store",
      headers: {
        cookie: await cookieHeader(),
        origin,
        "content-type": "application/json",
        "x-csrf-token": await csrfToken(),
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AdminContentError("failed", 0);
  }
  return parseOrFail(response, parser);
}

export function listQueryString(query: AdminListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 20));
  if (query.status) params.set("status", query.status);
  return params;
}
