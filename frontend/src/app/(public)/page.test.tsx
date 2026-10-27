// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home, { LatestArticlesSection } from "./page";
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

describe("Public Home Page", () => {
  it("renders campaign hero with approved heading and primary navigation links", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "محصولات و خدمات ترنج پلاستیک" })).toBeInTheDocument();
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

  it("enforces non-negotiable B2B rules: no cart, online checkout, or live inventory", () => {
    const { container } = render(<Home />);
    const textContent = container.textContent ?? "";

    expect(textContent).not.toMatch(/سبد خرید/);
    expect(textContent).not.toMatch(/پرداخت آنلاین/);
    expect(textContent).not.toMatch(/موجودی لحظه‌ای/);
  });
});
