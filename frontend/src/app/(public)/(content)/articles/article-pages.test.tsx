// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ArticleDetailPage, { generateMetadata } from "./[slug]/page";
import ArticlesIndexPage from "./page";
import * as strapiClient from "@/lib/strapi";

const mockArticle: strapiClient.StrapiArticle = {
  id: "art-1",
  title: "راهنمای جامع تزریق پلاستیک در تیراژ بالا",
  slug: "injection-molding-guide",
  summary: "توضیحات و خلاصه مقاله در مورد اصول تزریق پلاستیک.",
  body: "متن کامل مقاله درباره فرایندهای صنعتی و کنترل کیفیت قالب‌ها.",
  publishedAt: "2026-10-27T10:00:00.000Z",
  featuredImage: {
    url: "http://localhost:1337/uploads/molding.webp",
    alt: "قالب تزریق پلاستیک",
    width: 1200,
    height: 800,
  },
  category: {
    id: "cat-1",
    name: "فنی و مهندسی",
    slug: "engineering",
    description: "دسته‌بندی فنی",
  },
  tags: [
    { id: "tag-1", name: "پلیمر", slug: "polymer" },
  ],
  metaTitle: "راهنمای تزریق پلاستیک",
  metaDescription: "توضیحات سئو برای مقاله تزریق پلاستیک.",
  canonicalUrl: "https://toranjplastic.com/articles/injection-molding-guide",
};

describe("article public pages and draft isolation", () => {
  it("renders published article details with relations, metadata, and breadcrumbs", async () => {
    vi.spyOn(strapiClient, "getStrapiArticle").mockResolvedValue(mockArticle);
    vi.spyOn(strapiClient, "getRelatedStrapiArticles").mockResolvedValue([]);

    const page = await ArticleDetailPage({
      params: Promise.resolve({ slug: "injection-molding-guide" }),
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1, name: "راهنمای جامع تزریق پلاستیک در تیراژ بالا" })).toBeInTheDocument();
    expect(screen.getAllByText("فنی و مهندسی").length).toBeGreaterThan(0);
    expect(screen.getByText(/پلیمر/)).toBeInTheDocument();
    expect(screen.getByText(/متن کامل مقاله/)).toBeInTheDocument();

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "injection-molding-guide" }),
    });
    expect(meta.title).toBe("راهنمای تزریق پلاستیک | ترنج پلاستیک");
    expect(meta.alternates?.canonical).toBe("https://toranjplastic.com/articles/injection-molding-guide");
  });

  it("enforces draft isolation: unpublished or draft articles invoke notFound() and noindex", async () => {
    // When an article is draft, Strapi Content API returns 404 / empty data to public requests
    vi.spyOn(strapiClient, "getStrapiArticle").mockRejectedValue(
      new strapiClient.StrapiContentError("not_found", 404),
    );

    // Metadata returns noindex robots
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "draft-article-hidden" }),
    });
    expect(meta.title).toBe("مقاله پیدا نشد");
    expect(meta.robots).toEqual({ index: false, follow: false });

    // Detail page throws notFound()
    await expect(
      ArticleDetailPage({
        params: Promise.resolve({ slug: "draft-article-hidden" }),
      }),
    ).rejects.toThrow();
  });

  it("renders article index listing safely without disclosing unpublished content", async () => {
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({
      items: [mockArticle],
      pageInfo: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
    });
    vi.spyOn(strapiClient, "listStrapiCategories").mockResolvedValue([mockArticle.category!]);

    const page = await ArticlesIndexPage({
      searchParams: Promise.resolve({ page: "1" }),
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1, name: "مقالات تخصصی" })).toBeInTheDocument();
    expect(screen.getByText("راهنمای جامع تزریق پلاستیک در تیراژ بالا")).toBeInTheDocument();
  });
});
