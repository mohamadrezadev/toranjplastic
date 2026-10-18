import 'server-only';
import { cookies } from 'next/headers';
import { AdminMediaError, type AdminMediaErrorKind } from './errors';
import { isAdminMediaAsset, isAdminMediaPage } from './schema';
import type { AdminMediaAsset, AdminMediaQuery } from './types';

const backend = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001/api/v1').replace(/\/$/, '');
const origin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

async function headers(mutating = false): Promise<Record<string, string>> {
  const jar = await cookies();
  return {
    cookie: jar.getAll().map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join('; '),
    Accept: 'application/json',
    ...(mutating ? { origin, 'x-csrf-token': jar.get('toranj_csrf')?.value ?? '' } : {}),
  };
}

function kind(status: number): AdminMediaErrorKind {
  if (status === 400) return 'validation';
  if (status === 401 || status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  return 'failed';
}

async function failure(response: Response): Promise<never> {
  let code: string | undefined;
  try {
    const payload: unknown = await response.json();
    if (payload && typeof payload === 'object' && 'code' in payload && typeof payload.code === 'string') code = payload.code;
  } catch {
    // The UI deliberately exposes only stable status/code information.
  }
  throw new AdminMediaError(kind(response.status), response.status, code);
}

async function parse<T>(response: Response, parser: (value: unknown) => value is T): Promise<T> {
  if (!response.ok) return failure(response);
  const payload: unknown = await response.json();
  if (!parser(payload)) throw new AdminMediaError('failed', response.status);
  return payload;
}

export async function listMedia(query: AdminMediaQuery = {}) {
  const params = new URLSearchParams({ page: String(query.page ?? 1), pageSize: String(query.pageSize ?? 20) });
  if (query.status) params.set('status', query.status);
  if (query.search) params.set('search', query.search);
  const response = await fetch(`${backend}/admin/media?${params}`, { cache: 'no-store', headers: await headers() });
  return parse(response, isAdminMediaPage);
}

export async function getMedia(id: string) {
  const response = await fetch(`${backend}/admin/media/${encodeURIComponent(id)}`, { cache: 'no-store', headers: await headers() });
  return parse(response, isAdminMediaAsset);
}

export async function uploadMedia(form: FormData): Promise<AdminMediaAsset> {
  const response = await fetch(`${backend}/admin/media`, { method: 'POST', cache: 'no-store', headers: await headers(true), body: form });
  return parse(response, isAdminMediaAsset);
}

export async function updateMediaAlt(id: string, defaultAlt: string): Promise<AdminMediaAsset> {
  const response = await fetch(`${backend}/admin/media/${encodeURIComponent(id)}`, {
    method: 'PATCH', cache: 'no-store',
    headers: { ...await headers(true), 'content-type': 'application/json' },
    body: JSON.stringify({ defaultAlt }),
  });
  return parse(response, isAdminMediaAsset);
}

export async function deleteMedia(id: string): Promise<void> {
  const response = await fetch(`${backend}/admin/media/${encodeURIComponent(id)}`, { method: 'DELETE', cache: 'no-store', headers: await headers(true) });
  if (!response.ok) await failure(response);
}
