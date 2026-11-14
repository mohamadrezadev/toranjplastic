// @vitest-environment jsdom
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import Home, { LatestArticlesSection, metadata } from "./page";
import * as strapiClient from "@/lib/strapi";

const mockArticles: strapiClient.StrapiArticle[] = [
  {
    id: "art-1",
    title: "راهنمای جامع تزریق پلاستیک صنعتی",
    slug: "industrial-injection-guide",
    summary: "آشنایی با پارامترهای کلیدی فرایند قالب‌گیری و تزریق قطعات پلیمری.",
    body: "متن کامل مقاله...",
    publishedAt: "2026-10-27T10:00:00.000Z",
    featuredImage: {
      url: "http://localhost:1337/uploads/injection-hero.webp",
      alt: "تزریق پلاستیک",
      width: 800,
      height: 600,
    },
    category: {
      id: "cat-1",
      name: "فنی و مهندسی",
      slug: "engineering",
      description: null,
    },
    tags: [],
    metaTitle: null,
    metaDescription: null,
    canonicalUrl: null,
  },
  {
    id: "art-2",
    title: "مقایسه پلی‌پروپیلن و پلی‌اتیلن در تولید ظروف",
    slug: "pp-vs-pe-containers",
    summary: "بررسی خواص مکانیکی و حرارتی گریدهای مختلف پلیمری در کاربردهای خانگی.",
    body: "متن کامل مقاله دوم...",
    publishedAt: "2026-10-26T08:00:00.000Z",
    featuredImage: null,
    category: {
      id: "cat-2",
      name: "مواد اولیه",
      slug: "materials",
      description: null,
    },
    tags: [],
    metaTitle: null,
    metaDescription: null,
    canonicalUrl: null,
  },
];

const capabilityCards = [
  {
    title: "خدمات تزریق پلاستیک",
    description: "پذیرش قالب و انجام تزریق کارمزدی با دستگاه‌های ۸۰ تا ۴۵۰ تن در کهریزک، با متریال ارسالی مشتری یا متریال تأمینی ترنج.",
    href: "/injection-molding",
    alt: "خدمات تزریق پلاستیک کارمزدی در کهریزک",
  },
  {
    title: "محصولات کاتالوگ",
    description: "مجموعه محصولات آماده و کاربردی تولیدشده با قالب‌های اختصاصی ترنج؛ آماده سفارش عمده و در تیراژهای گوناگون.",
    href: "/products",
    alt: "نمک‌پاش و ادویه‌پاش ترنج، از محصولات کاتالوگ",
  },
  {
    title: "مواد اولیه و پلیمرها",
    description: "تأمین انواع گریدهای پلیمری صنعتی (PP, PE و...) متناسب با نیاز تولیدکنندگان و کارگاه‌ها.",
    href: "/materials",
    alt: "تأمین انواع مواد اولیه پلیمری صنعتی",
  },
];

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}

const renderHome = (ui: ReactNode = <Home />) => render(ui, { wrapper: PersianAstryx });

describe("Public Home Page", () => {
  beforeEach(() => {
    // No test reaches a real CMS; each one decides what Strapi returns.
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({
      items: [],
      pageInfo: { page: 1, pageSize: 3, total: 0, totalPages: 0 },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders campaign hero with approved heading and primary navigation links", () => {
    render(<Home />);

    expect(screen.getAllByRole("heading", { level: 1, name: "محصولات و خدمات ترنج پلاستیک" })).toHaveLength(1);
    expect(screen.getByRole("img", { name: "نمونه محصولات پلاستیکی ترنج" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "مشاهده محصولات" })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: "ثبت استعلام" })).toHaveAttribute("href", "/inquiry");
  });

  it("renders the 3 core B2B capabilities with links to their sections", () => {
    render(<Home />);

    expect(screen.getByText("خدمات تزریق پلاستیک")).toBeInTheDocument();
    expect(screen.getByText("محصولات کاتالوگ")).toBeInTheDocument();
    expect(screen.getByText("مواد اولیه و پلیمرها")).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links.some((link) => link.getAttribute("href") === "/injection-molding")).toBe(true);
    expect(links.some((link) => link.getAttribute("href") === "/products")).toBe(true);
    expect(links.some((link) => link.getAttribute("href") === "/materials")).toBe(true);
  });

  it("renders the industrial inquiry workflow strip and CTA button", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 2, name: "مراحل استعلام و بررسی قطعات سفارشی" })).toBeInTheDocument();
    expect(screen.getByText("ارسال مشخصات یا نمونه")).toBeInTheDocument();
    expect(screen.getByText("بررسی مهندسی و امکان‌سنجی")).toBeInTheDocument();
    expect(screen.getByText("صدور پیش‌فاکتور رسمی")).toBeInTheDocument();

    const inquiryCta = screen.getByRole("link", { name: /ورود به فرم استعلام و ثبت مشخصات قطعه/ });
    expect(inquiryCta).toHaveAttribute("href", "/inquiry");
  });

  it("renders latest published articles from Strapi CMS when available", async () => {
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({
      items: mockArticles,
      pageInfo: { page: 1, pageSize: 3, total: 2, totalPages: 1 },
    });

    const articlesNode = await LatestArticlesSection();
    render(articlesNode);

    expect(screen.getByRole("heading", { level: 2, name: "آخرین مقالات و یادداشت‌های تخصصی" })).toBeInTheDocument();
    expect(screen.getByText("راهنمای جامع تزریق پلاستیک صنعتی")).toBeInTheDocument();
    expect(screen.getByText("مقایسه پلی‌پروپیلن و پلی‌اتیلن در تولید ظروف")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /مشاهده همه مقالات/ })).toHaveAttribute("href", "/articles");
  });

  it("gracefully degrades when Strapi CMS throws an error without crashing or showing fake data", async () => {
    vi.spyOn(strapiClient, "listStrapiArticles").mockRejectedValue(new Error("CMS timeout"));

    const articlesNode = await LatestArticlesSection();
    expect(articlesNode).toBeNull();
  });

  it("omits the articles band when the CMS has no published article", async () => {
    expect(await LatestArticlesSection()).toBeNull();
  });

  it("enforces non-negotiable B2B rules: no cart, online checkout, or live inventory", () => {
    const { container } = render(<Home />);
    const textContent = container.textContent ?? "";

    expect(textContent).not.toMatch(/سبد خرید/);
    expect(textContent).not.toMatch(/پرداخت آنلاین/);
    expect(textContent).not.toMatch(/موجودی لحظه‌ای/);
  });

  it("labels the campaign region by its heading and keeps the artwork as bounded supporting media", () => {
    renderHome();

    const campaign = screen.getByTestId("home-campaign");
    expect(campaign.tagName).toBe("SECTION");
    expect(screen.getByRole("region", { name: "محصولات و خدمات ترنج پلاستیک" })).toBe(campaign);
    expect(within(campaign).getByRole("heading", { level: 1 })).toHaveAttribute("id", "home-title");
    expect(within(campaign).getByText("ترنج پلاستیک / تولید و تأمین محصولات پلاستیکی")).toBeInTheDocument();

    const artwork = within(campaign).getByRole("img", { name: "نمونه محصولات پلاستیکی ترنج" });
    expect(artwork).toHaveAttribute("width", "1916");
    expect(artwork).toHaveAttribute("height", "821");
    expect(artwork).toHaveAttribute("sizes", "(max-width: 48rem) 100vw, 50vw");
    // The campaign artwork is the above-the-fold image: never lazy-loaded.
    expect(artwork).not.toHaveAttribute("loading", "lazy");

    // One semantic set of actions: the artwork never replaces them.
    expect(within(campaign).getAllByRole("link")).toHaveLength(2);
    expect(within(campaign).getByRole("link", { name: "مشاهده محصولات" })).toHaveAttribute("href", "/products");
    expect(within(campaign).getByRole("link", { name: "ثبت استعلام" })).toHaveAttribute("href", "/inquiry");
  });

  it("keeps the three capability links as the region's direct children, each named by its title", () => {
    renderHome();

    const region = screen.getByRole("region", { name: "حوزه‌های ترنج پلاستیک" });
    // e2e/public-shell.spec.ts measures `section[aria-label="حوزه‌های ترنج پلاستیک"] > a`.
    expect(region.tagName).toBe("SECTION");
    expect(Array.from(region.children).map((child) => [child.tagName, child.getAttribute("href")])).toEqual(
      capabilityCards.map(({ href }) => ["A", href]),
    );

    for (const { title, description, href } of capabilityCards) {
      const link = within(region).getByRole("link", { name: title });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAccessibleDescription(description);
      expect(within(link).getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
      // The whole card is one target: nothing interactive is nested inside it.
      expect(link.querySelectorAll("a, button, input, select, textarea, [tabindex]")).toHaveLength(0);
    }

    // Card artwork is decorative inside the named link but keeps its approved alt text.
    expect(within(region).queryAllByRole("img")).toHaveLength(0);
    expect(Array.from(region.querySelectorAll("img")).map((image) => image.getAttribute("alt"))).toEqual(capabilityCards.map(({ alt }) => alt));
  });

  it("presents the inquiry workflow as one ordered list of three numbered steps", () => {
    renderHome();

    const region = screen.getByRole("region", { name: "مراحل استعلام و بررسی قطعات سفارشی" });
    const list = within(region).getByRole("list");
    expect(list.tagName).toBe("OL");
    // The list has no markers, so it keeps an explicit role for Safari/VoiceOver.
    expect(list).toHaveAttribute("role", "list");
    const steps = within(list).getAllByRole("listitem");
    expect(steps.map((step) => within(step).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "ارسال مشخصات یا نمونه",
      "بررسی مهندسی و امکان‌سنجی",
      "صدور پیش‌فاکتور رسمی",
    ]);
    expect(steps.map((step) => step.textContent?.charAt(0))).toEqual(["۱", "۲", "۳"]);
    expect(within(region).getAllByRole("link")).toHaveLength(1);
    expect(within(region).getByRole("link", { name: "ورود به فرم استعلام و ثبت مشخصات قطعه" })).toHaveAttribute("href", "/inquiry");
  });

  it("requests at most three published articles and renders each as a linked card", async () => {
    const listArticles = vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({
      items: mockArticles,
      pageInfo: { page: 1, pageSize: 3, total: 2, totalPages: 1 },
    });

    const { container } = renderHome(await LatestArticlesSection());

    expect(listArticles).toHaveBeenCalledWith({ pageSize: 3 });
    const region = screen.getByRole("region", { name: "آخرین مقالات و یادداشت‌های تخصصی" });
    const cards = within(region).getAllByRole("article");
    expect(cards).toHaveLength(mockArticles.length);
    // Two articles share the row instead of leaving an empty third track.
    expect(container.querySelector('[data-layout="pair"]')).toBeInTheDocument();
    mockArticles.forEach((article, index) => {
      expect(within(cards[index]).getByRole("link", { name: article.title })).toHaveAttribute("href", `/articles/${article.slug}`);
      expect(within(cards[index]).getByText(article.category?.name ?? "")).toBeInTheDocument();
    });
    expect(cards[0].textContent).toMatch(/[۰-۹]/);
    expect(within(region).getByRole("link", { name: "مشاهده همه مقالات" })).toHaveAttribute("href", "/articles");
  });

  it("closes with a labelled contact region and its single contact action", () => {
    renderHome();

    const region = screen.getByRole("region", { name: "جزئیات، مسیر تصمیم‌گیری را روشن‌تر می‌کنند." });
    expect(within(region).getAllByRole("link")).toHaveLength(1);
    expect(within(region).getByRole("link", { name: "صفحه تماس" })).toHaveAttribute("href", "/contact");
  });

  it("keeps one h1, a sequential outline and labelled regions without axe violations", async () => {
    const { container } = renderHome();

    expect(screen.getAllByRole("heading").map((heading) => heading.tagName)).toEqual(["H1", "H2", "H3", "H3", "H3", "H2", "H3", "H3", "H3", "H2"]);
    for (const id of ["home-title", "intro-title", "inquiry-strip-title", "closing-title"]) {
      expect(container.querySelector(`section[aria-labelledby="${id}"]`), id).toBeInTheDocument();
      expect(container.querySelector(`#${id}`)?.tagName, id).toMatch(/^H[12]$/);
    }
    expect(await axe(container)).toHaveNoViolations();
  });

  it("nests three article card titles under the band heading in the balanced card grid", async () => {
    const thirdArticle: strapiClient.StrapiArticle = {
      ...mockArticles[1],
      id: "art-3",
      title: "نکات نگهداری قالب‌های تزریق",
      slug: "mold-maintenance-notes",
      category: null,
      publishedAt: "not-a-date",
    };
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({
      items: [...mockArticles, thirdArticle],
      pageInfo: { page: 1, pageSize: 3, total: 3, totalPages: 1 },
    });

    const { container } = renderHome(await LatestArticlesSection());

    const region = screen.getByRole("region", { name: "آخرین مقالات و یادداشت‌های تخصصی" });
    // The band's h2 owns the cards: their titles are h3, not sibling h2s.
    expect(within(region).getAllByRole("heading").map((heading) => [heading.tagName, heading.textContent])).toEqual([
      ["H2", "آخرین مقالات و یادداشت‌های تخصصی"],
      ["H3", "راهنمای جامع تزریق پلاستیک صنعتی"],
      ["H3", "مقایسه پلی‌پروپیلن و پلی‌اتیلن در تولید ظروف"],
      ["H3", "نکات نگهداری قالب‌های تزریق"],
    ]);
    // Three cards take the balanced steps instead of auto-fill tracks that leave the third card beside an empty track.
    expect(container.querySelector('[data-layout="grid"]')).toBeInTheDocument();
    // Dates are machine-readable supporting text; a malformed CMS date is dropped instead of failing the band.
    const cards = within(region).getAllByRole("article");
    expect(cards[0].querySelector("time")).toHaveAttribute("datetime", "2026-10-27T10:00:00.000Z");
    expect(cards[0].querySelector("time")?.textContent).toMatch(/[۰-۹]/);
    expect(cards[2].querySelector("time")).toBeNull();
    // The home band shows the category as a read-only tag: no extra link stop in each card.
    expect(within(cards[0]).queryByRole("link", { name: "فنی و مهندسی" })).not.toBeInTheDocument();
    expect(within(cards[0]).getByText("فنی و مهندسی")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("passes axe with the latest articles band", async () => {
    vi.spyOn(strapiClient, "listStrapiArticles").mockResolvedValue({
      items: mockArticles,
      pageInfo: { page: 1, pageSize: 3, total: 2, totalPages: 1 },
    });

    const { container } = renderHome(await LatestArticlesSection());
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the organisation JSON-LD graph and the canonical home metadata", () => {
    const { container } = render(<Home />);

    const script = container.querySelector('script[type="application/ld+json"]');
    const graph = JSON.parse(script?.textContent ?? "{}")["@graph"] as Array<Record<string, unknown>>;
    expect(graph.map((node) => node["@type"])).toEqual(["Organization", "WebSite"]);
    expect(graph[1]).toMatchObject({ name: "ترنج پلاستیک", inLanguage: "fa-IR" });
    expect(metadata).toMatchObject({ alternates: { canonical: "/" }, robots: { index: true, follow: true } });
  });

  it("composes the home layout from Toranj tokens without targeting Astryx internals", () => {
    const stylesheet = readFileSync(join(process.cwd(), "src", "app", "(public)", "page.module.css"), "utf8");

    expect(stylesheet).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    expect(stylesheet).not.toMatch(/\.x[0-9a-z]{5,}\b/);
  });
});
