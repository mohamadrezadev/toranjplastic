import "server-only";
import { PageInfo, PageResult, PublicImage } from "./public-content";

export interface StrapiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface StrapiTag {
  id: string;
  name: string;
  slug: string;
}

export interface StrapiArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  featuredImage: PublicImage | null;
  category: StrapiCategory | null;
  tags: StrapiTag[];
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  publishedAt: string;
}

export type StrapiErrorKind = "not_found" | "upstream" | "invalid_response";

export class StrapiContentError extends Error {
  constructor(public readonly kind: StrapiErrorKind, public readonly status?: number) {
    super(kind === "not_found" ? "Strapi article was not found" : "Strapi CMS is unavailable");
    this.name = "StrapiContentError";
  }
}

export function isStrapiNotFoundError(error: unknown): boolean {
  return error instanceof StrapiContentError && error.kind === "not_found";
}

function getStrapiBaseUrl(): string {
  const url = process.env.STRAPI_API_URL ?? "http://localhost:1337";
  return url.replace(/\/$/, "");
}

function getStrapiTimeoutMs(): number {
  const parsed = Number(process.env.STRAPI_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5000;
}

function getStrapiMediaOrigin(): string {
  const mediaOrigin = process.env.STRAPI_MEDIA_ORIGIN ?? process.env.STRAPI_API_URL ?? "http://localhost:1337";
  return mediaOrigin.replace(/\/$/, "");
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const token = process.env.STRAPI_API_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function formatImageUrl(rawUrl: string, apiOrigin: string): string {
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  return `${apiOrigin}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
}

function mapImage(raw: unknown, apiOrigin: string): PublicImage | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.url !== "string" || !record.url) return null;

  return {
    url: formatImageUrl(record.url, apiOrigin),
    alt: typeof record.alternativeText === "string" && record.alternativeText ? record.alternativeText : (typeof record.name === "string" ? record.name : ""),
    ...(typeof record.width === "number" ? { width: record.width } : {}),
    ...(typeof record.height === "number" ? { height: record.height } : {}),
  };
}

function mapCategory(raw: unknown): StrapiCategory | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const slug = typeof record.slug === "string" ? record.slug : "";
  const name = typeof record.name === "string" ? record.name : "";
  if (!slug || !name) return null;

  return {
    id: String(record.documentId || record.id || slug),
    name,
    slug,
    description: typeof record.description === "string" ? record.description : null,
  };
}

function mapTag(raw: unknown): StrapiTag | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const slug = typeof record.slug === "string" ? record.slug : "";
  const name = typeof record.name === "string" ? record.name : "";
  if (!slug || !name) return null;

  return {
    id: String(record.documentId || record.id || slug),
    name,
    slug,
  };
}

function mapArticle(raw: unknown, apiOrigin: string): StrapiArticle | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title : "";
  const slug = typeof record.slug === "string" ? record.slug : "";
  if (!title || !slug) return null;

  const seo = record.seo && typeof record.seo === "object" ? (record.seo as Record<string, unknown>) : null;

  return {
    id: String(record.documentId || record.id || slug),
    title,
    slug,
    summary: typeof record.summary === "string" ? record.summary : null,
    body: typeof record.body === "string" ? record.body : "",
    featuredImage: mapImage(record.featuredImage, apiOrigin),
    category: mapCategory(record.category),
    tags: Array.isArray(record.tags) ? (record.tags.map(mapTag).filter(Boolean) as StrapiTag[]) : [],
    metaTitle: typeof seo?.metaTitle === "string" ? seo.metaTitle : null,
    metaDescription: typeof seo?.metaDescription === "string" ? seo.metaDescription : null,
    canonicalUrl: typeof seo?.canonicalURL === "string" ? seo.canonicalURL : null,
    publishedAt: typeof record.publishedAt === "string" ? record.publishedAt : new Date().toISOString(),
  };
}

async function fetchFromStrapi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getStrapiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const timeoutMs = getStrapiTimeoutMs();
  const signal = options?.signal ?? AbortSignal.timeout(timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      signal,
      headers: {
        ...getAuthHeaders(),
        ...(options?.headers || {}),
      },
      next: {
        revalidate: 3600,
        tags: ["strapi-articles"],
        ...(options?.next || {}),
      },
    });
  } catch {
    throw new StrapiContentError("upstream");
  }

  if (response.status === 404) {
    throw new StrapiContentError("not_found", 404);
  }

  if (!response.ok) {
    throw new StrapiContentError("upstream", response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new StrapiContentError("invalid_response", response.status);
  }
}

export async function listStrapiArticles({
  page = 1,
  pageSize = 12,
  categorySlug,
}: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
} = {}): Promise<PageResult<StrapiArticle>> {
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 12;

  const params = new URLSearchParams();
  params.set("populate[featuredImage]", "true");
  params.set("populate[category]", "true");
  params.set("populate[tags]", "true");
  params.set("populate[seo]", "true");
  params.set("sort[0]", "publishedAt:desc");
  params.set("pagination[page]", String(safePage));
  params.set("pagination[pageSize]", String(safePageSize));

  if (categorySlug) {
    params.set("filters[category][slug][$eq]", categorySlug);
  }

  const payload = await fetchFromStrapi<{
    data: unknown[];
    meta?: {
      pagination?: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  }>(`/api/articles?${params.toString()}`);

  const mediaOrigin = getStrapiMediaOrigin();
  const items = Array.isArray(payload.data)
    ? (payload.data.map((item) => mapArticle(item, mediaOrigin)).filter(Boolean) as StrapiArticle[])
    : [];

  const pagination = payload.meta?.pagination;
  const pageInfo: PageInfo = {
    page: pagination?.page ?? safePage,
    pageSize: pagination?.pageSize ?? safePageSize,
    total: pagination?.total ?? items.length,
    totalPages: pagination?.pageCount ?? 1,
  };

  return { items, pageInfo };
}

export async function getStrapiArticle(slug: string): Promise<StrapiArticle> {
  if (!slug) throw new StrapiContentError("not_found", 404);

  const params = new URLSearchParams();
  params.set("filters[slug][$eq]", slug);
  params.set("populate[featuredImage]", "true");
  params.set("populate[category]", "true");
  params.set("populate[tags]", "true");
  params.set("populate[seo]", "true");

  const payload = await fetchFromStrapi<{
    data: unknown[];
  }>(`/api/articles?${params.toString()}`);

  if (!Array.isArray(payload.data) || payload.data.length === 0) {
    throw new StrapiContentError("not_found", 404);
  }

  const mediaOrigin = getStrapiMediaOrigin();
  const article = mapArticle(payload.data[0], mediaOrigin);
  if (!article) {
    throw new StrapiContentError("invalid_response");
  }

  return article;
}

export async function listStrapiCategories(): Promise<StrapiCategory[]> {
  const params = new URLSearchParams();
  params.set("sort[0]", "name:asc");
  params.set("pagination[pageSize]", "100");

  const payload = await fetchFromStrapi<{
    data: unknown[];
  }>(`/api/categories?${params.toString()}`);

  if (!Array.isArray(payload.data)) return [];
  return payload.data.map(mapCategory).filter(Boolean) as StrapiCategory[];
}

export async function getStrapiCategory(slug: string): Promise<StrapiCategory> {
  if (!slug) throw new StrapiContentError("not_found", 404);

  const params = new URLSearchParams();
  params.set("filters[slug][$eq]", slug);

  const payload = await fetchFromStrapi<{
    data: unknown[];
  }>(`/api/categories?${params.toString()}`);

  if (!Array.isArray(payload.data) || payload.data.length === 0) {
    throw new StrapiContentError("not_found", 404);
  }

  const cat = mapCategory(payload.data[0]);
  if (!cat) throw new StrapiContentError("not_found", 404);
  return cat;
}

export async function getRelatedStrapiArticles(
  slug: string,
  categorySlug?: string | null,
  tags: StrapiTag[] = [],
  limit = 3,
): Promise<StrapiArticle[]> {
  const params = new URLSearchParams();
  params.set("populate[featuredImage]", "true");
  params.set("populate[category]", "true");
  params.set("populate[tags]", "true");
  params.set("populate[seo]", "true");
  params.set("sort[0]", "publishedAt:desc");
  params.set("pagination[pageSize]", String(limit + 1));
  params.set("filters[slug][$ne]", slug);

  if (categorySlug) {
    params.set("filters[category][slug][$eq]", categorySlug);
  } else if (tags.length > 0) {
    tags.forEach((t, index) => {
      params.set(`filters[tags][slug][$in][${index}]`, t.slug);
    });
  }

  try {
    const payload = await fetchFromStrapi<{
      data: unknown[];
    }>(`/api/articles?${params.toString()}`);

    const mediaOrigin = getStrapiMediaOrigin();
    const articles = Array.isArray(payload.data)
      ? (payload.data.map((item) => mapArticle(item, mediaOrigin)).filter(Boolean) as StrapiArticle[])
      : [];

    return articles.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getAllStrapiArticlesForSitemap(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const params = new URLSearchParams();
    params.set("fields[0]", "slug");
    params.set("fields[1]", "updatedAt");
    params.set("fields[2]", "publishedAt");
    params.set("pagination[pageSize]", "1000");

    const payload = await fetchFromStrapi<{
      data: Array<{ slug?: string; updatedAt?: string; publishedAt?: string }>;
    }>(`/api/articles?${params.toString()}`);

    if (!Array.isArray(payload.data)) return [];
    return payload.data
      .filter((item) => typeof item.slug === "string" && Boolean(item.slug))
      .map((item) => ({
        slug: item.slug as string,
        updatedAt: item.updatedAt || item.publishedAt || new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export async function getAllStrapiCategoriesForSitemap(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const params = new URLSearchParams();
    params.set("fields[0]", "slug");
    params.set("fields[1]", "updatedAt");
    params.set("pagination[pageSize]", "1000");

    const payload = await fetchFromStrapi<{
      data: Array<{ slug?: string; updatedAt?: string }>;
    }>(`/api/categories?${params.toString()}`);

    if (!Array.isArray(payload.data)) return [];
    return payload.data
      .filter((item) => typeof item.slug === "string" && Boolean(item.slug))
      .map((item) => ({
        slug: item.slug as string,
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}
