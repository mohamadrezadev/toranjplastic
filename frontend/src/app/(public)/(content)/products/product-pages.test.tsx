import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { contentStyles } from "@/components/content";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { PublicContentError, getProduct, listProducts, type PageResult, type PublicProduct } from "@/lib/public-content";
import ProductDetailPage, { generateMetadata } from "./[slug]/page";
import ProductsPage from "./page";

vi.mock("@/lib/public-content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/public-content")>();
  return { ...actual, listProducts: vi.fn(), getProduct: vi.fn() };
});

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}

const renderPage = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

const product: PublicProduct = {
  id: "product-1",
  name: "سبد صنعتی نمونه",
  slug: "industrial-basket",
  summary: "خلاصه منتشرشده محصول",
  description: "توضیحات منتشرشده محصول.",
  category: { id: "category-1", name: "محصولات صنعتی", slug: "industrial" },
  images: [{ url: "/catalog/refrigerator-organizer.webp", alt: "نظم‌دهنده‌های شفاف در طبقات یخچال", width: 1200, height: 1200 }],
  specifications: [{ label: "کد مرجع", value: "TRJ-P-001" }],
  featured: true,
  publishedAt: "2026-10-15T00:00:00.000Z",
  metaTitle: null,
  metaDescription: null,
};

const collection = (items: PublicProduct[], page = 1, totalPages = items.length ? 1 : 0): PageResult<PublicProduct> => ({
  items,
  pageInfo: { page, pageSize: 12, total: items.length, totalPages },
});

const listPage = (page?: string) => ProductsPage({ searchParams: Promise.resolve(page ? { page } : {}) });
const detailPage = (slug: string) => ProductDetailPage({ params: Promise.resolve({ slug }) });
const commerce = /سبد خرید|پرداخت آنلاین|موجودی لحظه‌ای|افزودن به سبد/;

beforeEach(() => {
  vi.mocked(listProducts).mockReset();
  vi.mocked(getProduct).mockReset();
});

describe("products collection route", () => {
  it("composes the landing hero, Astryx actions and a featured single-product catalog", async () => {
    vi.mocked(listProducts).mockResolvedValue(collection([product]));
    const { container } = renderPage(await listPage());

    expect(listProducts).toHaveBeenCalledWith(1);
    expect(container.querySelectorAll("main")).toHaveLength(1);
    const hero = container.querySelector('section[aria-labelledby="catalog-landing-title"]');
    expect(hero).not.toBeNull();
    expect(within(hero as HTMLElement).getByRole("heading", { level: 1, name: "محصولات را دقیق‌تر ببینید." })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "محصولات پلاستیکی ترنج در فضای آشپزخانه" })).toHaveAttribute("src", "/branding/banners/products.png");
    // Both landing actions are Astryx Buttons rendered as links.
    expect(screen.getByRole("link", { name: "مشاهده محصولات" })).toHaveAttribute("href", "#product-catalog");
    expect(screen.getByRole("link", { name: "ثبت استعلام محصول" })).toHaveAttribute("href", "/inquiry/product");

    const catalog = container.querySelector("#product-catalog");
    expect(catalog).not.toBeNull();
    // The in-page anchor target keeps the shared scroll offset below the sticky header
    // and takes programmatic focus, so keyboard users continue inside the catalog.
    expect(catalog).toHaveClass(contentStyles.catalogSection);
    expect(catalog).toHaveAttribute("tabindex", "-1");
    expect(within(catalog as HTMLElement).getByRole("heading", { level: 2, name: "محصولات" })).toBeInTheDocument();
    expect(catalog?.querySelector('[data-layout="featured"]')).not.toBeNull();
    const card = within(catalog as HTMLElement).getByRole("article");
    // Card titles are level three under the catalog's own level-two heading.
    expect(within(card).getByRole("heading", { level: 3, name: "سبد صنعتی نمونه" })).toBeInTheDocument();
    expect(within(catalog as HTMLElement).getAllByRole("heading").map((heading) => [heading.tagName, heading.textContent])).toEqual([
      ["H2", "محصولات"],
      ["H3", "سبد صنعتی نمونه"],
    ]);
    expect(within(card).getByRole("link", { name: /مشاهده جزئیات/ })).toHaveAttribute("href", "/products/industrial-basket");
    expect(within(card).getByText("محصولات صنعتی")).toBeInTheDocument();
    expect(within(card).getByText("منتخب")).toBeInTheDocument();
    // A single page needs no pagination.
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی" })).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(commerce);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps stable, crawlable page links for multi-page collections", async () => {
    vi.mocked(listProducts).mockResolvedValue(collection([product, { ...product, id: "product-2", slug: "second-basket", name: "سبد دوم", featured: false }], 2, 3));
    const { container } = renderPage(await listPage("2"));

    expect(listProducts).toHaveBeenCalledWith(2);
    expect(container.querySelector('[data-layout="pair"]')).not.toBeNull();
    const pagination = screen.getByRole("navigation", { name: "صفحه‌بندی" });
    expect(within(pagination).getByRole("link", { name: "صفحه قبل" })).toHaveAttribute("href", "/products?page=1");
    expect(within(pagination).getByRole("link", { name: "صفحه بعد" })).toHaveAttribute("href", "/products?page=3");
    expect(within(pagination).getByText("صفحه ۲ از ۳")).toBeInTheDocument();
  });

  it("falls back to the first page for an invalid page query", async () => {
    vi.mocked(listProducts).mockResolvedValue(collection([product]));
    await listPage("not-a-page");
    expect(listProducts).toHaveBeenCalledWith(1);
  });

  it("shows the honest empty state inside the preserved landing hierarchy", async () => {
    vi.mocked(listProducts).mockResolvedValue(collection([]));
    const { container } = renderPage(await listPage());

    expect(screen.getByRole("heading", { level: 1, name: "محصولات را دقیق‌تر ببینید." })).toBeInTheDocument();
    const catalog = container.querySelector("#product-catalog") as HTMLElement;
    expect(within(catalog).getByRole("heading", { level: 2, name: "محصولات" })).toBeInTheDocument();
    expect(within(catalog).getByRole("heading", { level: 2, name: "محصول منتشرشده‌ای وجود ندارد" })).toBeInTheDocument();
    expect(within(catalog).getByText("پس از تأیید و انتشار اطلاعات محصول، فهرست این بخش نمایش داده می‌شود.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی" })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("does not present an unavailable API as an empty catalog", async () => {
    vi.mocked(listProducts).mockRejectedValue(new PublicContentError("upstream", 503));
    await expect(listPage()).rejects.toBeInstanceOf(PublicContentError);
  });
});

describe("product detail route", () => {
  it("renders the record, Product JSON-LD without offers, the inquiry path and LTR codes", async () => {
    vi.mocked(getProduct).mockResolvedValue(product);
    const { container } = renderPage(await detailPage("industrial-basket"));

    expect(getProduct).toHaveBeenCalledWith("industrial-basket");
    expect(container.querySelectorAll("main")).toHaveLength(1);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const jsonLd = JSON.parse(scripts[0].textContent ?? "{}");
    expect(jsonLd).toMatchObject({ "@type": "Product", name: "سبد صنعتی نمونه", category: "محصولات صنعتی" });
    expect(jsonLd).not.toHaveProperty("offers");

    const breadcrumb = screen.getByRole("navigation", { name: "مسیر صفحه" });
    expect(within(breadcrumb).getByRole("link", { name: "محصولات" })).toHaveAttribute("href", "/products");
    expect(within(breadcrumb).getByText("سبد صنعتی نمونه")).toHaveAttribute("aria-current", "page");

    const record = container.querySelector("article") as HTMLElement;
    expect(within(record).getByRole("heading", { level: 1, name: "سبد صنعتی نمونه" })).toBeInTheDocument();
    expect(within(record).getByText("محصولات صنعتی")).toBeInTheDocument();
    expect(within(record).getByText("محصول منتخب")).toBeInTheDocument();
    expect(within(record).getByRole("img", { name: "نظم‌دهنده‌های شفاف در طبقات یخچال" })).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByRole("link", { name: "ثبت استعلام محصول" })).toHaveAttribute("href", "/inquiry/product?slug=industrial-basket");
    expect(screen.getByText("ثبت استعلام به معنی تأیید قیمت یا موجودی نیست.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "مشخصات تأییدشده" })).toBeInTheDocument();
    expect(screen.getByText("TRJ-P-001")).toHaveAttribute("dir", "ltr");
    // The spec sheet keeps its term and definition pairs.
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(["کد مرجع"]);
    expect(screen.getAllByRole("definition").map((definition) => definition.textContent)).toEqual(["TRJ-P-001"]);
    expect(screen.getByRole("link", { name: "ثبت استعلام مستقیم این محصول" })).toHaveAttribute("href", "/inquiry/product?slug=industrial-basket");
    expect(container).not.toHaveTextContent(commerce);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("encodes the slug in inquiry links and omits optional sections the API does not supply", async () => {
    vi.mocked(getProduct).mockResolvedValue({ ...product, slug: "basket & lid", category: null, featured: false, images: [], specifications: [], description: null, summary: null });
    const { container } = renderPage(await detailPage("basket & lid"));

    expect(screen.getByRole("link", { name: "ثبت استعلام محصول" })).toHaveAttribute("href", "/inquiry/product?slug=basket%20%26%20lid");
    expect(screen.getByRole("link", { name: "ثبت استعلام مستقیم این محصول" })).toHaveAttribute("href", "/inquiry/product?slug=basket%20%26%20lid");
    expect(screen.getByText("تصویر محصول ثبت نشده است")).toBeInTheDocument();
    expect(screen.queryByText("محصول منتخب")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "مشخصات تأییدشده" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "توضیحات" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "تصاویر محتوا" })).not.toBeInTheDocument();
    expect(JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}")).not.toHaveProperty("offers");
  });

  it("derives canonical metadata from approved fields", async () => {
    vi.mocked(getProduct).mockResolvedValue({ ...product, metaTitle: "سبد صنعتی", metaDescription: "توضیح تأییدشده" });
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "industrial-basket" }) });
    expect(metadata.alternates?.canonical).toBe("/products/industrial-basket");
    expect(metadata.description).toBe("توضیح تأییدشده");
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("returns the shared not-found experience and noindex metadata for hidden records", async () => {
    vi.mocked(getProduct).mockRejectedValue(new PublicContentError("not_found", 404));
    await expect(detailPage("draft-product")).rejects.toThrow();
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "draft-product" }) });
    expect(metadata).toEqual({ title: "محصول پیدا نشد", robots: { index: false, follow: false } });
  });

  it("lets upstream failures reach the route error boundary", async () => {
    vi.mocked(getProduct).mockRejectedValue(new PublicContentError("upstream", 503));
    await expect(detailPage("industrial-basket")).rejects.toBeInstanceOf(PublicContentError);
    await expect(generateMetadata({ params: Promise.resolve({ slug: "industrial-basket" }) })).rejects.toBeInstanceOf(PublicContentError);
  });
});
