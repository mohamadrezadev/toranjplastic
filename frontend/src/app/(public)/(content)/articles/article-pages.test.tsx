// @vitest-environment jsdom
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import * as strapiClient from "@/lib/strapi";
import ArticleDetailPage, { generateMetadata } from "./[slug]/page";
import ArticleCategoryPage, { generateMetadata as generateCategoryMetadata } from "./category/[slug]/page";
import ArticlesIndexPage from "./page";

const notFoundDigest = "NEXT_HTTP_ERROR_FALLBACK;404";

function PersianAstryx({ children }: { children: ReactNode }) {
  return (
    <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>
      <div dir="rtl" style={{ direction: "rtl" }}>{children}</div>
    </InternationalizationProvider>
  );
}

const renderPage = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

const engineering: strapiClient.StrapiCategory = {
  id: "cat-1",
  name: "فنی و مهندسی",
  slug: "engineering",
  description: "دسته‌بندی فنی",
};

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
  category: engineering,
  tags: [
    { id: "tag-1", name: "پلیمر", slug: "polymer" },
  ],
  metaTitle: "راهنمای تزریق پلاستیک",
  metaDescription: "توضیحات سئو برای مقاله تزریق پلاستیک.",
  canonicalUrl: "https://toranjplastic.com/articles/injection-molding-guide",
};

const relatedArticle: strapiClient.StrapiArticle = {
  ...mockArticle,
  id: "art-2",
  title: "انتخاب گرید پلی‌پروپیلن برای قطعات صنعتی",
  slug: "polypropylene-grade-selection",
  summary: "خلاصه مقاله مرتبط.",
  featuredImage: null,
  tags: [],
  metaTitle: null,
  metaDescription: null,
  canonicalUrl: null,
};

const onePage = { page: 1, pageSize: 12, total: 1, totalPages: 1 };
const emptyPage = { page: 1, pageSize: 12, total: 0, totalPages: 0 };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("article public pages and draft isolation", () => {
  it("renders published article details with relations, metadata, and breadcrumbs", async () => {
    vi.spyOn(strapiClient, "getStrapiArticle").mockResolvedValue(mockArticle);
    vi.spyOn(strapiClient, "getRelatedStrapiArticles").mockResolvedValue([]);

    const page = await ArticleDetailPage({
      params: Promise.resolve({ slug: "injection-molding-guide" }),
    });

    renderPage(page);

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
    ).rejects.toMatchObject({ digest: notFoundDigest });
  });

  it("keeps CMS outages on the error boundary instead of a not-found page", async () => {
    vi.spyOn(strapiClient, "getStrapiArticle").mockRejectedValue(new strapiClient.StrapiContentError("upstream", 503));

    await expect(generateMetadata({ params: Promise.resolve({ slug: "injection-molding-guide" }) })).rejects.toMatchObject({ kind: "upstream" });
    await expect(ArticleDetailPage({ params: Promise.resolve({ slug: "injection-molding-guide" }) })).rejects.toMatchObject({ kind: "upstream" });
  });

  it("names the article trail, links its category, dates it and publishes Article JSON-LD", async () => {
    vi.spyOn(strapiClient, "getStrapiArticle").mockResolvedValue(mockArticle);
    vi.spyOn(strapiClient, "getRelatedStrapiArticles").mockResolvedValue([]);

    const { container } = renderPage(await ArticleDetailPage({ params: Promise.resolve({ slug: "injection-molding-guide" }) }));

    const trail = screen.getByRole("navigation", { name: "مسیر صفحه" });
    expect(within(trail).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["خانه", "/"],
      ["مقالات", "/articles"],
      ["فنی و مهندسی", "/articles/category/engineering"],
    ]);
    expect(within(trail).getByText("راهنمای جامع تزریق پلاستیک در تیراژ بالا").closest("[aria-current='page']")).not.toBeNull();

    // The hero keeps the approved image and the category tag opens the category collection.
    expect(screen.getByRole("img", { name: "قالب تزریق پلاستیک" })).toHaveAttribute("src", "http://localhost:1337/uploads/molding.webp");
    const categoryLinks = screen.getAllByRole("link", { name: "فنی و مهندسی" });
    expect(categoryLinks).toHaveLength(2);
    expect(categoryLinks.every((link) => link.getAttribute("href") === "/articles/category/engineering")).toBe(true);
    expect(container.querySelector("time")).toHaveAttribute("datetime", "2026-10-27T10:00:00.000Z");
    expect(screen.getByRole("heading", { level: 2, name: "متن مقاله" })).toBeInTheDocument();

    const tags = screen.getByRole("list", { name: "برچسب‌ها:" });
    expect(within(tags).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["#پلیمر"]);
    // The tag list has no markers, so it keeps an explicit role for Safari/VoiceOver.
    expect(tags).toHaveAttribute("role", "list");
    // Each tag is the shared wrapping badge around an isolated run, so the "#" stays beside the tag's first letter.
    for (const item of within(tags).getAllByRole("listitem")) {
      expect(item.querySelector(".astryx-badge")).not.toBeNull();
      expect(item.querySelector(".astryx-badge bdi")).toHaveTextContent(/^#/);
      // The list never takes the Astryx Token, which cuts a long label with an ellipsis.
      expect(item.querySelector(".astryx-token")).toBeNull();
    }
    // The hero category link is a link, not a clickable badge; the date is supporting text, not a badge.
    expect(categoryLinks[1].closest(".astryx-badge")).toBeNull();
    expect(container.querySelector("time")?.closest(".astryx-badge")).toBeNull();

    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0].textContent || "{}")).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "راهنمای جامع تزریق پلاستیک در تیراژ بالا",
      description: "توضیحات و خلاصه مقاله در مورد اصول تزریق پلاستیک.",
      url: expect.stringMatching(/\/articles\/injection-molding-guide$/),
      datePublished: "2026-10-27T10:00:00.000Z",
      image: ["http://localhost:1337/uploads/molding.webp"],
      author: { "@type": "Organization", name: "ترنج پلاستیک" },
      publisher: { "@type": "Organization", name: "ترنج پلاستیک", url: expect.any(String) },
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps every tag whole: a Latin tag is an isolated run and a very long one is a wrapping badge", async () => {
    const longTag = `${"برچسب-بسیار-طولانی-".repeat(8)}TRJ-FIXTURE-TAG-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
    vi.spyOn(strapiClient, "getStrapiArticle").mockResolvedValue({
      ...mockArticle,
      tags: [
        { id: "tag-1", name: "پلیمر", slug: "polymer" },
        { id: "tag-2", name: "TRJ-FIXTURE-TAG-0123", slug: "latin" },
        { id: "tag-3", name: longTag, slug: "long" },
      ],
    });
    vi.spyOn(strapiClient, "getRelatedStrapiArticles").mockResolvedValue([]);

    const { container } = renderPage(await ArticleDetailPage({ params: Promise.resolve({ slug: "injection-molding-guide" }) }));

    const items = within(screen.getByRole("list", { name: "برچسب‌ها:" })).getAllByRole("listitem");
    // The accessible text keeps the hash first: "#" plus the tag name, nothing shortened or reordered.
    expect(items.map((item) => item.textContent)).toEqual(["#پلیمر", "#TRJ-FIXTURE-TAG-0123", `#${longTag}`]);
    for (const item of items) expect(item.querySelectorAll("bdi")).toHaveLength(1);
    // The badge is the shared ContentTag: no ellipsis label, so the whole value can wrap (Content.module.css .tag).
    for (const item of items) expect(item.querySelector(".astryx-badge")).toHaveTextContent(item.textContent ?? "");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("lists up to three related articles that share the category or tags", async () => {
    vi.spyOn(strapiClient, "getStrapiArticle").mockResolvedValue(mockArticle);
    const related = vi.spyOn(strapiClient, "getRelatedStrapiArticles").mockResolvedValue([relatedArticle]);

    const { container } = renderPage(await ArticleDetailPage({ params: Promise.resolve({ slug: "injection-molding-guide" }) }));

    expect(related).toHaveBeenCalledWith("injection-molding-guide", "engineering", mockArticle.tags, 3);
    const region = screen.getByRole("region", { name: "مقاله‌های مرتبط" });
    expect(within(region).getByRole("heading", { level: 2, name: "مقاله‌های مرتبط" })).toHaveAttribute("id", "related-articles-title");
    expect(within(region).getAllByRole("article")).toHaveLength(1);
    // Related card titles are level three under the region's own level-two heading.
    expect(within(region).getAllByRole("heading").map((heading) => [heading.tagName, heading.textContent])).toEqual([
      ["H2", "مقاله‌های مرتبط"],
      ["H3", "انتخاب گرید پلی‌پروپیلن برای قطعات صنعتی"],
    ]);
    expect(within(region).getByRole("link", { name: "انتخاب گرید پلی‌پروپیلن برای قطعات صنعتی" })).toHaveAttribute("href", "/articles/polypropylene-grade-selection");
    expect(within(region).queryByRole("link", { name: "راهنمای جامع تزریق پلاستیک در تیراژ بالا" })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("omits empty tag and related sections and falls back to the encyclopedia eyebrow", async () => {
    vi.spyOn(strapiClient, "getStrapiArticle").mockResolvedValue({ ...mockArticle, category: null, tags: [], featuredImage: null });
    vi.spyOn(strapiClient, "getRelatedStrapiArticles").mockRejectedValue(new Error("related articles unavailable"));

    const { container } = renderPage(await ArticleDetailPage({ params: Promise.resolve({ slug: "injection-molding-guide" }) }));

    expect(screen.getByText("مقاله دانشنامه")).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "مسیر صفحه" })).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["/", "/articles"]);
    expect(screen.queryByRole("list", { name: "برچسب‌ها:" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "مقاله‌های مرتبط" })).not.toBeInTheDocument();
    expect(JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent || "{}")).not.toHaveProperty("image");
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

    renderPage(page);

    expect(screen.getByRole("heading", { level: 1, name: "مقالات تخصصی" })).toBeInTheDocument();
    expect(screen.getByText("راهنمای جامع تزریق پلاستیک در تیراژ بالا")).toBeInTheDocument();
  });

  it("navigates article categories through one labelled tab strip of stable links", async () => {
    const materials: strapiClient.StrapiCategory = { id: "cat-2", name: "انتخاب مواد", slug: "materials-selection", description: null };
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({ items: [mockArticle], pageInfo: onePage });
    vi.spyOn(strapiClient, "listStrapiCategories").mockResolvedValue([engineering, materials]);
    const user = userEvent.setup();

    const { container } = renderPage(await ArticlesIndexPage({ searchParams: Promise.resolve({}) }));

    const categories = screen.getByRole("navigation", { name: "دسته‌بندی مقالات" });
    const links = within(categories).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/articles", "/articles/category/engineering", "/articles/category/materials-selection"]);
    expect(["همه مقالات", "فنی و مهندسی", "انتخاب مواد"].map((name) => within(categories).getByRole("link", { name }))).toEqual(links);
    expect(within(categories).getByRole("link", { name: "همه مقالات" })).toHaveAttribute("aria-current");
    expect(links.filter((link) => link.hasAttribute("aria-current"))).toHaveLength(1);
    // The strip is one Tab stop; the arrow keys move along it in reading (RTL) order.
    expect(links.filter((link) => link.tabIndex === 0)).toHaveLength(1);
    links[0].focus();
    await user.keyboard("{ArrowLeft}");
    expect(links[1]).toHaveFocus();
    await user.keyboard("{End}");
    expect(links[2]).toHaveFocus();

    // Cards keep their detail destination and link their category collection.
    const card = screen.getByRole("article");
    expect(within(card).getByRole("link", { name: "راهنمای جامع تزریق پلاستیک در تیراژ بالا" })).toHaveAttribute("href", "/articles/injection-molding-guide");
    expect(within(card).getByRole("link", { name: "فنی و مهندسی" })).toHaveAttribute("href", "/articles/category/engineering");
    expect(within(card).getByRole("link", { name: "مشاهده جزئیات" })).toHaveAttribute("href", "/articles/injection-molding-guide");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("pages the article collection with stable, crawlable page URLs", async () => {
    const list = vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({ items: [mockArticle], pageInfo: { page: 2, pageSize: 12, total: 30, totalPages: 3 } });
    vi.spyOn(strapiClient, "listStrapiCategories").mockResolvedValue([]);

    renderPage(await ArticlesIndexPage({ searchParams: Promise.resolve({ page: "2" }) }));

    expect(list).toHaveBeenCalledWith({ page: 2 });
    const pagination = screen.getByRole("navigation", { name: "صفحه‌بندی" });
    expect(within(pagination).getByRole("link", { name: "صفحه قبل" })).toHaveAttribute("href", "/articles?page=1");
    expect(within(pagination).getByRole("link", { name: "صفحه بعد" })).toHaveAttribute("href", "/articles?page=3");
    expect(screen.queryByRole("navigation", { name: "دسته‌بندی مقالات" })).not.toBeInTheDocument();
  });

  it("shows an honest empty state and no category navigation when nothing is published", async () => {
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({ items: [], pageInfo: emptyPage });
    vi.spyOn(strapiClient, "listStrapiCategories").mockRejectedValue(new strapiClient.StrapiContentError("upstream", 503));

    const { container } = renderPage(await ArticlesIndexPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { level: 2, name: "مقاله منتشرشده‌ای وجود ندارد" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "دسته‌بندی مقالات" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی" })).not.toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("article category pages", () => {
  it("keeps the category strip and marks the open category as the current view", async () => {
    const materials: strapiClient.StrapiCategory = { id: "cat-2", name: "انتخاب مواد", slug: "materials-selection", description: null };
    vi.spyOn(strapiClient, "getStrapiCategory").mockResolvedValue(materials);
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({ items: [mockArticle], pageInfo: onePage });
    vi.spyOn(strapiClient, "listStrapiCategories").mockResolvedValue([engineering, materials]);
    const user = userEvent.setup();

    const { container } = renderPage(await ArticleCategoryPage({ params: Promise.resolve({ slug: "materials-selection" }), searchParams: Promise.resolve({}) }));

    const strip = screen.getByRole("navigation", { name: "دسته‌بندی مقالات" });
    const links = within(strip).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/articles", "/articles/category/engineering", "/articles/category/materials-selection"]);
    // This category, not "all articles", is the current view and the strip's one Tab stop.
    const current = within(strip).getByRole("link", { name: "انتخاب مواد" });
    expect(current).toHaveAttribute("aria-current");
    expect(links.filter((link) => link.hasAttribute("aria-current"))).toEqual([current]);
    expect(links.filter((link) => link.tabIndex === 0)).toEqual([current]);
    current.focus();
    await user.keyboard("{Home}");
    expect(links[0]).toHaveFocus();
    // The way back stays after the strip.
    expect(screen.getByRole("link", { name: "مشاهده همه دسته‌بندی‌ها و مقالات" })).toHaveAttribute("href", "/articles");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("omits the strip without a category list and still marks a category missing from it", async () => {
    vi.spyOn(strapiClient, "getStrapiCategory").mockResolvedValue(engineering);
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({ items: [mockArticle], pageInfo: onePage });
    const categories = vi.spyOn(strapiClient, "listStrapiCategories").mockRejectedValue(new strapiClient.StrapiContentError("upstream", 503));

    const { unmount } = renderPage(await ArticleCategoryPage({ params: Promise.resolve({ slug: "engineering" }), searchParams: Promise.resolve({}) }));
    expect(screen.queryByRole("navigation", { name: "دسته‌بندی مقالات" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "مشاهده همه دسته‌بندی‌ها و مقالات" })).toHaveAttribute("href", "/articles");
    unmount();

    categories.mockResolvedValue([{ id: "cat-9", name: "اخبار", slug: "news", description: null }]);
    renderPage(await ArticleCategoryPage({ params: Promise.resolve({ slug: "engineering" }), searchParams: Promise.resolve({}) }));
    const strip = screen.getByRole("navigation", { name: "دسته‌بندی مقالات" });
    expect(within(strip).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["/articles", "/articles/category/news", "/articles/category/engineering"]);
    expect(within(strip).getByRole("link", { name: "فنی و مهندسی" })).toHaveAttribute("aria-current");
  });

  it("renders the category collection with its trail, a way back and paged cards", async () => {
    vi.spyOn(strapiClient, "getStrapiCategory").mockResolvedValue({ ...engineering, description: null });
    vi.spyOn(strapiClient, "listStrapiCategories").mockResolvedValue([engineering]);
    const list = vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({ items: [mockArticle], pageInfo: { page: 2, pageSize: 12, total: 30, totalPages: 3 } });

    const { container } = renderPage(await ArticleCategoryPage({
      params: Promise.resolve({ slug: "engineering" }),
      searchParams: Promise.resolve({ page: "2" }),
    }));

    expect(list).toHaveBeenCalledWith({ page: 2, categorySlug: "engineering" });
    expect(screen.getByRole("heading", { level: 1, name: "فنی و مهندسی" })).toBeInTheDocument();
    expect(screen.getByText("مجموعه مقالات و مطالب آموزشی منتشرشده در دسته‌بندی فنی و مهندسی.")).toBeInTheDocument();

    const trail = screen.getByRole("navigation", { name: "مسیر صفحه" });
    expect(within(trail).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["/", "/articles"]);
    expect(within(trail).getByText("فنی و مهندسی").closest("[aria-current='page']")).not.toBeNull();

    const back = screen.getByRole("link", { name: "مشاهده همه دسته‌بندی‌ها و مقالات" });
    expect(back).toHaveAttribute("href", "/articles");
    expect(back).toHaveTextContent("← مشاهده همه دسته‌بندی‌ها و مقالات");

    const card = screen.getByRole("article");
    expect(within(card).getByRole("link", { name: "راهنمای جامع تزریق پلاستیک در تیراژ بالا" })).toHaveAttribute("href", "/articles/injection-molding-guide");
    expect(within(card).getByText("فنی و مهندسی")).toBeInTheDocument();

    const pagination = screen.getByRole("navigation", { name: "صفحه‌بندی" });
    expect(within(pagination).getByRole("link", { name: "صفحه قبل" })).toHaveAttribute("href", "/articles/category/engineering?page=1");
    expect(within(pagination).getByRole("link", { name: "صفحه بعد" })).toHaveAttribute("href", "/articles/category/engineering?page=3");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("states factually that a category has no published articles", async () => {
    vi.spyOn(strapiClient, "getStrapiCategory").mockResolvedValue(engineering);
    vi.spyOn(strapiClient, "listStrapiCategories").mockResolvedValue([engineering]);
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({ items: [], pageInfo: emptyPage });

    renderPage(await ArticleCategoryPage({ params: Promise.resolve({ slug: "engineering" }), searchParams: Promise.resolve({}) }));

    expect(screen.getByText("دسته‌بندی فنی")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "مقاله‌ای در دسته‌بندی «فنی و مهندسی» منتشر نشده است" })).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی" })).not.toBeInTheDocument();
  });

  it("returns not-found for a missing category and keeps CMS outages on the error boundary", async () => {
    const category = vi.spyOn(strapiClient, "getStrapiCategory").mockRejectedValue(new strapiClient.StrapiContentError("not_found", 404));

    await expect(generateCategoryMetadata({ params: Promise.resolve({ slug: "missing" }) })).resolves.toEqual({
      title: "دسته‌بندی پیدا نشد",
      robots: { index: false, follow: false },
    });
    await expect(ArticleCategoryPage({ params: Promise.resolve({ slug: "missing" }), searchParams: Promise.resolve({}) })).rejects.toMatchObject({ digest: notFoundDigest });

    category.mockRejectedValue(new strapiClient.StrapiContentError("upstream", 503));
    await expect(generateCategoryMetadata({ params: Promise.resolve({ slug: "engineering" }) })).rejects.toMatchObject({ kind: "upstream" });
    await expect(ArticleCategoryPage({ params: Promise.resolve({ slug: "engineering" }), searchParams: Promise.resolve({}) })).rejects.toMatchObject({ kind: "upstream" });
  });

  it("builds canonical category metadata from the approved category fields", async () => {
    vi.spyOn(strapiClient, "getStrapiCategory").mockResolvedValue(engineering);

    const meta = await generateCategoryMetadata({ params: Promise.resolve({ slug: "engineering" }) });

    expect(meta.title).toBe("مقالات دسته‌بندی فنی و مهندسی | ترنج پلاستیک");
    expect(meta.description).toBe("دسته‌بندی فنی");
    expect(meta.alternates?.canonical).toBe("/articles/category/engineering");
    expect(meta.robots).toEqual({ index: true, follow: true });
  });
});

describe("article route styles", () => {
  it("compose Toranj tokens and mapped Astryx roles only", () => {
    const stylesheet = readFileSync(join(process.cwd(), "src", "app", "(public)", "(content)", "articles", "articles.module.css"), "utf8");
    expect(stylesheet).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    expect(stylesheet).not.toMatch(/\.x[0-9a-z]{5,}\b/);
  });
});
