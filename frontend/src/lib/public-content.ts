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

export interface PublicImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface PublicSpecification {
  label: string;
  value: string;
}

interface PublicSeo {
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface PublicProduct extends PublicSeo {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  category: { id: string; name: string; slug: string } | null;
  images: PublicImage[];
  specifications: PublicSpecification[];
  featured: boolean;
  publishedAt: string;
}

export interface PublicInjectionService extends PublicSeo {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  images: PublicImage[];
  specifications: PublicSpecification[];
  ctaLabel: string | null;
  ctaHref: string | null;
  publishedAt: string;
}

export interface PublicMaterial extends PublicSeo {
  id: string;
  name: string;
  slug: string;
  family: string | null;
  grade: string | null;
  manufacturer: string | null;
  summary: string | null;
  description: string | null;
  images: PublicImage[];
  specifications: PublicSpecification[];
  inquiryAvailable: boolean;
  publishedAt: string;
}

export interface PublicArticle extends PublicSeo {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  featuredImage: PublicImage | null;
  publishedAt: string;
}

export interface PublicManagedPage extends PublicSeo {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  images: PublicImage[];
  publishedAt: string;
}

export type PublicContentErrorKind = "not_found" | "upstream" | "invalid_response";

export class PublicContentError extends Error {
  constructor(public readonly kind: PublicContentErrorKind, public readonly status?: number) {
    super(kind === "not_found" ? "Public content was not found" : "Public content is unavailable");
    this.name = "PublicContentError";
  }
}

const apiBaseUrl = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001/api/v1").replace(/\/$/, "");

type RecordValue = Record<string, unknown>;
type Parser<T> = (value: unknown) => value is T;

export function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string { return typeof value === "string"; }
export function isNullableString(value: unknown): value is string | null { return value === null || isString(value); }
function isNonNegativeInteger(value: unknown): value is number { return Number.isInteger(value) && Number(value) >= 0; }
function isPositiveInteger(value: unknown): value is number { return Number.isInteger(value) && Number(value) > 0; }

function isSeo(value: RecordValue) {
  return isNullableString(value.metaTitle) && isNullableString(value.metaDescription);
}

export function isImage(value: unknown): value is PublicImage {
  if (!isRecord(value) || !isString(value.url) || !isString(value.alt)) return false;
  return (value.width === undefined || isPositiveInteger(value.width)) && (value.height === undefined || isPositiveInteger(value.height));
}

export function isSpecification(value: unknown): value is PublicSpecification {
  return isRecord(value) && isString(value.label) && isString(value.value);
}

function hasCommonDetail(value: unknown): value is RecordValue {
  return isRecord(value) && isString(value.id) && isString(value.slug) && isString(value.publishedAt) && isSeo(value);
}

export function isPublicProduct(value: unknown): value is PublicProduct {
  if (!hasCommonDetail(value) || !isString(value.name) || !isNullableString(value.summary) || !isNullableString(value.description) || typeof value.featured !== "boolean") return false;
  const categoryIsValid = value.category === null || (isRecord(value.category) && isString(value.category.id) && isString(value.category.name) && isString(value.category.slug));
  return categoryIsValid && Array.isArray(value.images) && value.images.every(isImage) && Array.isArray(value.specifications) && value.specifications.every(isSpecification);
}

export function isPublicInjectionService(value: unknown): value is PublicInjectionService {
  return hasCommonDetail(value) && isString(value.name) && isNullableString(value.summary) && isNullableString(value.description) && isNullableString(value.ctaLabel) && isNullableString(value.ctaHref) && Array.isArray(value.images) && value.images.every(isImage) && Array.isArray(value.specifications) && value.specifications.every(isSpecification);
}

export function isPublicMaterial(value: unknown): value is PublicMaterial {
  return hasCommonDetail(value) && isString(value.name) && isNullableString(value.family) && isNullableString(value.grade) && isNullableString(value.manufacturer) && isNullableString(value.summary) && isNullableString(value.description) && typeof value.inquiryAvailable === "boolean" && Array.isArray(value.images) && value.images.every(isImage) && Array.isArray(value.specifications) && value.specifications.every(isSpecification);
}

export function isPublicArticle(value: unknown): value is PublicArticle {
  return hasCommonDetail(value) && isString(value.title) && isNullableString(value.summary) && isString(value.body) && (value.featuredImage === null || isImage(value.featuredImage));
}

export function isPublicManagedPage(value: unknown): value is PublicManagedPage {
  return hasCommonDetail(value) && isString(value.title) && isNullableString(value.summary) && isString(value.body) && Array.isArray(value.images) && value.images.every(isImage);
}

function pageParser<T>(itemParser: Parser<T>): Parser<PageResult<T>> {
  return (value: unknown): value is PageResult<T> => {
    if (!isRecord(value) || !Array.isArray(value.items) || !value.items.every(itemParser) || !isRecord(value.pageInfo)) return false;
    const info = value.pageInfo;
    return isPositiveInteger(info.page) && isPositiveInteger(info.pageSize) && isNonNegativeInteger(info.total) && isNonNegativeInteger(info.totalPages);
  };
}

async function request<T>(path: string, parser: Parser<T>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/public/content/${path}`, { cache: "no-store", headers: { Accept: "application/json" } });
  } catch {
    throw new PublicContentError("upstream");
  }
  if (response.status === 404) throw new PublicContentError("not_found", 404);
  if (!response.ok) throw new PublicContentError("upstream", response.status);
  let payload: unknown;
  try { payload = await response.json(); } catch { throw new PublicContentError("invalid_response", response.status); }
  if (!parser(payload)) throw new PublicContentError("invalid_response", response.status);
  return payload;
}

function collectionPath(segment: string, page: number) {
  const query = new URLSearchParams({ page: String(page), pageSize: "12" });
  return `${segment}?${query.toString()}`;
}

export function parsePageNumber(value: string | readonly string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const page = Number(candidate ?? "1");
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export const listProducts = (page: number) => request(collectionPath("products", page), pageParser(isPublicProduct));
export const getProduct = (slug: string) => request(`products/${encodeURIComponent(slug)}`, isPublicProduct);
export const listServices = (page: number) => request(collectionPath("services", page), pageParser(isPublicInjectionService));
export const getService = (slug: string) => request(`services/${encodeURIComponent(slug)}`, isPublicInjectionService);
export const listMaterials = (page: number) => request(collectionPath("materials", page), pageParser(isPublicMaterial));
export const getMaterial = (slug: string) => request(`materials/${encodeURIComponent(slug)}`, isPublicMaterial);
export const listArticles = (page: number) => request(collectionPath("articles", page), pageParser(isPublicArticle));
export const getArticle = (slug: string) => request(`articles/${encodeURIComponent(slug)}`, isPublicArticle);
export const getManagedPage = (slug: string) => request(`pages/${encodeURIComponent(slug)}`, isPublicManagedPage);

export function isNotFoundError(error: unknown) {
  return error instanceof PublicContentError && error.kind === "not_found";
}
