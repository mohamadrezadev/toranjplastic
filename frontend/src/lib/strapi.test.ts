// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  StrapiContentError,
  getAllStrapiArticlesForSitemap,
  getAllStrapiCategoriesForSitemap,
  getRelatedStrapiArticles,
  getStrapiArticle,
  getStrapiCategory,
  isStrapiNotFoundError,
  listStrapiArticles,
  listStrapiCategories,
} from "./strapi";

const rawArticle = {
  id: 1,
  documentId: "doc-1",
  title: "اصول قالب‌گیری تزریق",
  slug: "injection-molding-principles",
  summary: "خلاصه مقاله درباره قالب‌گیری تزریق پلاستیک.",
  body: "متن کامل مقاله تزریق پلاستیک در تیراژ صنعتی.",
  createdAt: "2026-10-27T10:00:00.000Z",
  updatedAt: "2026-10-27T10:00:00.000Z",
  publishedAt: "2026-10-27T10:00:00.000Z",
  featuredImage: {
    id: 10,
    documentId: "img-1",
    url: "/uploads/sample.jpg",
    alternativeText: "تصویر مقاله",
    width: 800,
    height: 600,
  },
  category: {
    id: 5,
    documentId: "cat-1",
    name: "تولید",
    slug: "manufacturing",
    description: "دسته‌بندی تولید",
  },
  tags: [
    {
      id: 8,
      documentId: "tag-1",
      name: "پلیمر",
      slug: "polymer",
    },
  ],
  seo: {
    id: 2,
    metaTitle: "عنوان سئو مقاله",
    metaDescription: "توضیحات سئو مقاله",
    canonicalURL: "https://toranjplastic.com/articles/injection-molding-principles",
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("strapi client", () => {
  it("lists articles and maps pagination and relations correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [rawArticle],
          meta: {
            pagination: {
              page: 1,
              pageSize: 12,
              pageCount: 1,
              total: 1,
            },
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await listStrapiArticles({ page: 1, pageSize: 12 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: "doc-1",
      title: "اصول قالب‌گیری تزریق",
      slug: "injection-molding-principles",
      category: { slug: "manufacturing" },
      tags: [{ slug: "polymer" }],
      metaTitle: "عنوان سئو مقاله",
      canonicalUrl: "https://toranjplastic.com/articles/injection-molding-principles",
    });
    expect(result.items[0].featuredImage?.url).toContain("/uploads/sample.jpg");
    expect(result.pageInfo).toEqual({
      page: 1,
      pageSize: 12,
      total: 1,
      totalPages: 1,
    });
  });

  it("filters articles by category when categorySlug is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [rawArticle],
          meta: { pagination: { page: 1, pageSize: 12, pageCount: 1, total: 1 } },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await listStrapiArticles({ categorySlug: "manufacturing" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("filters%5Bcategory%5D%5Bslug%5D%5B%24eq%5D=manufacturing"),
      expect.anything(),
    );
  });

  it("fetches single article by slug and maps detail correctly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [rawArticle],
          }),
          { status: 200 },
        ),
      ),
    );

    const article = await getStrapiArticle("injection-molding-principles");
    expect(article.title).toBe("اصول قالب‌گیری تزریق");
    expect(article.body).toContain("متن کامل مقاله");
    expect(article.category?.name).toBe("تولید");
  });

  it("throws not_found error when article does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              data: [],
            }),
            { status: 200 },
          ),
        ),
      ),
    );

    await expect(getStrapiArticle("non-existent")).rejects.toBeInstanceOf(StrapiContentError);
    await expect(getStrapiArticle("non-existent")).rejects.toMatchObject({ kind: "not_found", status: 404 });
  });

  it("lists categories correctly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [rawArticle.category],
          }),
          { status: 200 },
        ),
      ),
    );

    const categories = await listStrapiCategories();
    expect(categories).toHaveLength(1);
    expect(categories[0].slug).toBe("manufacturing");
  });

  it("gets single category by slug and rejects missing category", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: [rawArticle.category] }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: [] }), { status: 200 }),
        ),
    );

    const cat = await getStrapiCategory("manufacturing");
    expect(cat.name).toBe("تولید");

    await expect(getStrapiCategory("unknown-cat")).rejects.toMatchObject({ kind: "not_found" });
  });

  it("fetches related articles without throwing on error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: [rawArticle] }), { status: 200 }),
      ),
    );

    const related = await getRelatedStrapiArticles("other-slug", "manufacturing", [{ id: "tag-1", name: "پلیمر", slug: "polymer" }]);
    expect(related).toHaveLength(1);
  });

  it("fetches articles and categories for sitemap safely", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: [{ slug: "article-1", updatedAt: "2026-10-27T00:00:00Z" }] }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: [{ slug: "cat-1", updatedAt: "2026-10-27T00:00:00Z" }] }), { status: 200 }),
        ),
    );

    const articlesSitemap = await getAllStrapiArticlesForSitemap();
    expect(articlesSitemap).toEqual([{ slug: "article-1", updatedAt: "2026-10-27T00:00:00Z" }]);

    const categoriesSitemap = await getAllStrapiCategoriesForSitemap();
    expect(categoriesSitemap).toEqual([{ slug: "cat-1", updatedAt: "2026-10-27T00:00:00Z" }]);
  });

  it("passes an AbortSignal timeout to fetch requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [], meta: { pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 } } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await listStrapiArticles();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("handles upstream network failures by raising upstream kind", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    await expect(listStrapiArticles()).rejects.toMatchObject({ kind: "upstream" });
  });

  it("isStrapiNotFoundError correctly identifies 404 errors", () => {
    expect(isStrapiNotFoundError(new StrapiContentError("not_found", 404))).toBe(true);
    expect(isStrapiNotFoundError(new StrapiContentError("upstream", 500))).toBe(false);
    expect(isStrapiNotFoundError(new Error("random"))).toBe(false);
  });
});
