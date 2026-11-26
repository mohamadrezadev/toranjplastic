import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { PublicContentError, getService, listServices, type PageResult, type PublicInjectionService } from "@/lib/public-content";
import ServiceDetailPage, { generateMetadata } from "./[slug]/page";
import ServicesPage from "./page";

vi.mock("@/lib/public-content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/public-content")>();
  return { ...actual, listServices: vi.fn(), getService: vi.fn() };
});

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}

const renderPage = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

const service: PublicInjectionService = {
  id: "service-1",
  name: "تزریق قطعات صنعتی",
  slug: "industrial-parts",
  summary: "خلاصه منتشرشده خدمت",
  description: "توضیحات منتشرشده خدمت.",
  images: [],
  specifications: [],
  ctaLabel: null,
  ctaHref: null,
  publishedAt: "2026-10-15T00:00:00.000Z",
  metaTitle: null,
  metaDescription: null,
};

const collection = (items: PublicInjectionService[]): PageResult<PublicInjectionService> => ({
  items,
  pageInfo: { page: 1, pageSize: 12, total: items.length, totalPages: items.length ? 1 : 0 },
});

const listPage = () => ServicesPage({ searchParams: Promise.resolve({}) });
const detailPage = (slug: string) => ServiceDetailPage({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  vi.mocked(listServices).mockReset();
  vi.mocked(getService).mockReset();
});

describe("injection-service collection route", () => {
  it("shows the landing hero and the honest empty state for an empty catalog", async () => {
    vi.mocked(listServices).mockResolvedValue(collection([]));
    const { container } = renderPage(await listPage());

    expect(container.querySelectorAll("main")).toHaveLength(1);
    // OD-2: the same dual-action hero as /products, with no decorative stamp.
    const hero = screen.getByRole("heading", { level: 1, name: "خدمات تزریق پلاستیک" }).closest("section") as HTMLElement;
    expect(within(hero).getByRole("link", { name: "مشاهده خدمات" })).toHaveAttribute("href", "#service-catalog");
    expect(within(hero).getByRole("link", { name: "ثبت درخواست خدمات تزریق پلاستیک" })).toHaveAttribute("href", "/inquiry/injection");
    expect(hero.textContent).not.toContain("PRODUCT CATALOG");
    expect(screen.getByRole("heading", { level: 2, name: "خدمت منتشرشده‌ای وجود ندارد" })).toBeInTheDocument();
    expect(screen.getByText("اطلاعات خدمات پس از بررسی فنی و انتشار رسمی در این بخش قرار می‌گیرد.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("links each published service card to its stable detail slug", async () => {
    vi.mocked(listServices).mockResolvedValue(collection([service, { ...service, id: "service-2", slug: "custom-mold", name: "تزریق با قالب مشتری" }]));
    const { container } = renderPage(await listPage());

    expect(container.querySelector('[data-layout="pair"]')).not.toBeNull();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(within(cards[1]).getByRole("link", { name: /مشاهده جزئیات/ })).toHaveAttribute("href", "/injection-molding/custom-mold");
  });
});

describe("injection-service detail route", () => {
  it("uses the approved CMS call to action only with a label and a safe destination", async () => {
    vi.mocked(getService).mockResolvedValue({ ...service, ctaLabel: "بررسی قالب و نمونه", ctaHref: "/inquiry/injection?source=service" });
    const { container, unmount } = renderPage(await detailPage("industrial-parts"));

    const record = container.querySelector("article") as HTMLElement;
    expect(within(record).getByRole("heading", { level: 1, name: "تزریق قطعات صنعتی" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "بررسی قالب و نمونه" })).toHaveAttribute("href", "/inquiry/injection?source=service");
    expect(screen.queryByRole("link", { name: "ثبت درخواست بررسی" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت استعلام تزریق با قالب مشتری" })).toHaveAttribute("href", "/inquiry/injection?slug=industrial-parts");
    const breadcrumb = screen.getByRole("navigation", { name: "مسیر صفحه" });
    expect(within(breadcrumb).getByRole("link", { name: "تزریق پلاستیک" })).toHaveAttribute("href", "/injection-molding");
    expect(await axe(container)).toHaveNoViolations();
    unmount();

    for (const unsafe of [{ ctaLabel: "بررسی قالب و نمونه", ctaHref: "javascript:alert(1)" }, { ctaLabel: null, ctaHref: "/inquiry/injection" }]) {
      vi.mocked(getService).mockResolvedValue({ ...service, ...unsafe });
      const view = renderPage(await detailPage("industrial-parts"));
      expect(screen.getByRole("link", { name: "ثبت درخواست بررسی" })).toHaveAttribute("href", "/inquiry/injection?slug=industrial-parts");
      expect(view.container.querySelector('a[href^="javascript:"]')).toBeNull();
      view.unmount();
    }
  });

  it("accepts only an internal path as a call to action, as the backend contract does", async () => {
    // The backend accepts a value only when it starts with "/" and not with "//" (assertSafeHref on write,
    // safeInternalHref on read), so an external address never reaches the page: the frontend never offers one either.
    const offSite = [
      "//evil.example",
      "//evil.example/inquiry",
      "https://example.com",
      "http://example.com/inquiry",
      "javascript:alert(1)",
      "inquiry/injection",
      // The URL parser turns each of these into the same off-site "//evil.example".
      "/\\evil.example",
      "/\t/evil.example",
      "/\n/evil.example",
    ];
    for (const ctaHref of offSite) {
      vi.mocked(getService).mockResolvedValue({ ...service, ctaLabel: "بررسی قالب و نمونه", ctaHref });
      const view = renderPage(await detailPage("industrial-parts"));
      // The hero offers the fallback review action, not the CMS label, and no link leaves the site.
      expect(screen.getByRole("link", { name: "ثبت درخواست بررسی" }), ctaHref).toHaveAttribute("href", "/inquiry/injection?slug=industrial-parts");
      expect(screen.queryByRole("link", { name: "بررسی قالب و نمونه" }), ctaHref).not.toBeInTheDocument();
      for (const link of view.container.querySelectorAll("main a[href]")) expect(link.getAttribute("href"), ctaHref).toMatch(/^\/(?![/\\])/);
      view.unmount();
    }

    // An internal path with a query or a fragment keeps working.
    for (const ctaHref of ["/contact", "/inquiry/injection?source=service", "/inquiry/injection#form"]) {
      vi.mocked(getService).mockResolvedValue({ ...service, ctaLabel: "بررسی قالب و نمونه", ctaHref });
      const view = renderPage(await detailPage("industrial-parts"));
      expect(screen.getByRole("link", { name: "بررسی قالب و نمونه" }), ctaHref).toHaveAttribute("href", ctaHref);
      expect(screen.queryByRole("link", { name: "ثبت درخواست بررسی" }), ctaHref).not.toBeInTheDocument();
      view.unmount();
    }
  });

  it("returns the shared not-found experience and noindex metadata for hidden records", async () => {
    vi.mocked(getService).mockRejectedValue(new PublicContentError("not_found", 404));
    await expect(detailPage("future-service")).rejects.toThrow();
    expect(await generateMetadata({ params: Promise.resolve({ slug: "future-service" }) })).toEqual({ title: "خدمت پیدا نشد", robots: { index: false, follow: false } });
  });
});
