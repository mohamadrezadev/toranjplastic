import "server-only";
import { cookies } from "next/headers";
import { isImage, isNullableString, isRecord, isSpecification, isString, type PublicImage, type PublicSpecification } from "./public-content";

export interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PageResult<T> {
  items: T[];
  pageInfo: PageInfo;
}

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface AdminLifecycle {
  id: string;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  displayOrder: number;
}

interface AdminSeo {
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface AdminCategory extends AdminLifecycle, AdminSeo {
  name: string;
  slug: string;
  description: string | null;
  image: PublicImage | null;
}

export interface AdminProduct extends AdminLifecycle, AdminSeo {
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  categoryId: string | null;
  images: PublicImage[];
  specifications: PublicSpecification[];
  featured: boolean;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: PublicImage | null;
  displayOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface ProductInput {
  name: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  categoryId?: string | null;
  images?: PublicImage[];
  specifications?: PublicSpecification[];
  featured?: boolean;
  displayOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface AdminListQuery {
  page?: number;
  pageSize?: number;
  status?: ContentStatus;
}

export interface AdminProductListQuery extends AdminListQuery {
  featured?: boolean;
}

export type AdminContentErrorKind = "validation" | "conflict" | "not_found" | "failed";

export class AdminContentError extends Error {
  constructor(public readonly kind: AdminContentErrorKind, public readonly status: number) {
    super(`Admin content request failed with status ${status}`);
    this.name = "AdminContentError";
  }
}

function errorKindForStatus(status: number): AdminContentErrorKind {
  if (status === 400) return "validation";
  if (status === 409) return "conflict";
  if (status === 404) return "not_found";
  return "failed";
}

function isContentStatus(value: unknown): value is ContentStatus {
  return value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED";
}

function hasLifecycle(value: Record<string, unknown>): boolean {
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

function isAdminCategory(value: unknown): value is AdminCategory {
  if (!isRecord(value) || !hasLifecycle(value)) return false;
  return isString(value.name) && isString(value.slug) && isNullableString(value.description) && (value.image === null || isImage(value.image));
}

function isAdminProduct(value: unknown): value is AdminProduct {
  if (!isRecord(value) || !hasLifecycle(value)) return false;
  return (
    isString(value.name) &&
    isString(value.slug) &&
    isNullableString(value.summary) &&
    isNullableString(value.description) &&
    (value.categoryId === null || isString(value.categoryId)) &&
    typeof value.featured === "boolean" &&
    Array.isArray(value.images) &&
    value.images.every(isImage) &&
    Array.isArray(value.specifications) &&
    value.specifications.every(isSpecification)
  );
}

function isPage<T>(itemParser: (value: unknown) => value is T) {
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
  if (!response.ok) throw new AdminContentError(errorKindForStatus(response.status), response.status);
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AdminContentError("failed", response.status);
  }
  if (!parser(payload)) throw new AdminContentError("failed", response.status);
  return payload;
}

async function adminRequest<T>(path: string, parser: (value: unknown) => value is T): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${backend}/admin/content/${path}`, { cache: "no-store", headers: { cookie: await cookieHeader(), Accept: "application/json" } });
  } catch {
    throw new AdminContentError("failed", 0);
  }
  return parseOrFail(response, parser);
}

async function adminMutate<T>(path: string, method: "POST" | "PATCH", body: unknown, parser: (value: unknown) => value is T): Promise<T> {
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

function listQueryString(query: AdminListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 20));
  if (query.status) params.set("status", query.status);
  return params;
}

export const listCategories = (query: AdminListQuery = {}) => adminRequest(`categories?${listQueryString(query)}`, isPage(isAdminCategory));
export const getCategory = (id: string) => adminRequest(`categories/${encodeURIComponent(id)}`, isAdminCategory);
export const createCategory = (input: CategoryInput) => adminMutate("categories", "POST", input, isAdminCategory);
export const updateCategory = (id: string, input: Partial<CategoryInput>) => adminMutate(`categories/${encodeURIComponent(id)}`, "PATCH", input, isAdminCategory);
export const publishCategory = (id: string) => adminMutate(`categories/${encodeURIComponent(id)}/publish`, "POST", {}, isAdminCategory);
export const archiveCategory = (id: string) => adminMutate(`categories/${encodeURIComponent(id)}/archive`, "POST", {}, isAdminCategory);

export function listProducts(query: AdminProductListQuery = {}) {
  const params = listQueryString(query);
  if (query.featured !== undefined) params.set("featured", String(query.featured));
  return adminRequest(`products?${params}`, isPage(isAdminProduct));
}
export const getProduct = (id: string) => adminRequest(`products/${encodeURIComponent(id)}`, isAdminProduct);
export const createProduct = (input: ProductInput) => adminMutate("products", "POST", input, isAdminProduct);
export const updateProduct = (id: string, input: Partial<ProductInput>) => adminMutate(`products/${encodeURIComponent(id)}`, "PATCH", input, isAdminProduct);
export const publishProduct = (id: string) => adminMutate(`products/${encodeURIComponent(id)}/publish`, "POST", {}, isAdminProduct);
export const archiveProduct = (id: string) => adminMutate(`products/${encodeURIComponent(id)}/archive`, "POST", {}, isAdminProduct);
