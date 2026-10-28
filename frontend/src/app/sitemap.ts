import type { MetadataRoute } from "next";
import { listMaterials, listProducts, listServices } from "@/lib/public-content";
import { getAllStrapiArticlesForSitemap, getAllStrapiCategoriesForSitemap } from "@/lib/strapi";
import { absoluteUrl } from "@/lib/site";

const stableRoutes = [
  "/",
  "/products",
  "/injection-molding",
  "/materials",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/articles",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = stableRoutes.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  try {
    for (let page = 1; ; page += 1) {
      const result = await listProducts(page);
      entries.push(
        ...result.items.map((item) => ({
          url: absoluteUrl(`/products/${item.slug}`),
          lastModified: new Date(item.publishedAt),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
      );
      if (page >= result.pageInfo.totalPages) break;
    }
  } catch {
    // Stable approved routes remain discoverable when the content API is unavailable.
  }

  try {
    for (let page = 1; ; page += 1) {
      const result = await listServices(page);
      entries.push(
        ...result.items.map((item) => ({
          url: absoluteUrl(`/injection-molding/${item.slug}`),
          lastModified: new Date(item.publishedAt),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
      );
      if (page >= result.pageInfo.totalPages) break;
    }
  } catch {
    // Fail safe
  }

  try {
    for (let page = 1; ; page += 1) {
      const result = await listMaterials(page);
      entries.push(
        ...result.items.map((item) => ({
          url: absoluteUrl(`/materials/${item.slug}`),
          lastModified: new Date(item.publishedAt),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
      );
      if (page >= result.pageInfo.totalPages) break;
    }
  } catch {
    // Fail safe
  }

  try {
    const strapiArticles = await getAllStrapiArticlesForSitemap();
    entries.push(
      ...strapiArticles.map((item) => ({
        url: absoluteUrl(`/articles/${item.slug}`),
        lastModified: new Date(item.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    );
  } catch {
    // Do not guess detail URLs when published content cannot be read.
  }

  try {
    const strapiCategories = await getAllStrapiCategoriesForSitemap();
    entries.push(
      ...strapiCategories.map((item) => ({
        url: absoluteUrl(`/articles/category/${item.slug}`),
        lastModified: new Date(item.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    );
  } catch {
    // Do not guess category URLs when categories cannot be read.
  }

  return entries;
}
