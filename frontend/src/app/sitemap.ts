import type { MetadataRoute } from "next";
import { listArticles, listProducts } from "@/lib/public-content";
import { absoluteUrl } from "@/lib/site";

const stableRoutes = ["/", "/products", "/injection-molding", "/materials", "/articles"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = stableRoutes.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  try {
    for (let page = 1; ; page += 1) {
      const result = await listProducts(page);
      entries.push(...result.items.map((item) => ({ url: absoluteUrl(`/products/${item.slug}`), lastModified: new Date(item.publishedAt), changeFrequency: "monthly" as const, priority: 0.7 })));
      if (page >= result.pageInfo.totalPages) break;
    }
  } catch {
    // Stable approved routes remain discoverable when the content API is unavailable.
  }

  try {
    for (let page = 1; ; page += 1) {
      const result = await listArticles(page);
      entries.push(...result.items.map((item) => ({ url: absoluteUrl(`/articles/${item.slug}`), lastModified: new Date(item.publishedAt), changeFrequency: "monthly" as const, priority: 0.6 })));
      if (page >= result.pageInfo.totalPages) break;
    }
  } catch {
    // Do not guess detail URLs when published content cannot be read.
  }

  return entries;
}
