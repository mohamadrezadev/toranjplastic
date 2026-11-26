import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { PublicContentError, getMaterial, listMaterials, type PageResult, type PublicMaterial } from "@/lib/public-content";
import MaterialDetailPage, { generateMetadata } from "./[slug]/page";
import MaterialsPage from "./page";

vi.mock("@/lib/public-content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/public-content")>();
  return { ...actual, listMaterials: vi.fn(), getMaterial: vi.fn() };
});

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}

const renderPage = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

const material: PublicMaterial = {
  id: "material-1",
  name: "پلی‌پروپیلن هموپلیمر",
  slug: "pp-homopolymer",
  family: "پلی‌پروپیلن",
  grade: "PP-H012",
  manufacturer: "تأمین‌کننده ثبت‌شده",
  summary: "خلاصه منتشرشده ماده",
  description: "توضیحات منتشرشده ماده.",
  images: [],
  specifications: [{ label: "شاخص جریان مذاب", value: "12 g/10min" }],
  inquiryAvailable: true,
  publishedAt: "2026-10-15T00:00:00.000Z",
  metaTitle: null,
  metaDescription: null,
};

const collection = (items: PublicMaterial[]): PageResult<PublicMaterial> => ({
  items,
  pageInfo: { page: 1, pageSize: 12, total: items.length, totalPages: items.length ? 1 : 0 },
});

const listPage = () => MaterialsPage({ searchParams: Promise.resolve({}) });
const detailPage = (slug: string) => MaterialDetailPage({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  vi.mocked(listMaterials).mockReset();
  vi.mocked(getMaterial).mockReset();
});

describe("materials collection route", () => {
  it("opens with the structured landing hero and keeps LTR grade tags in the Astryx card grid", async () => {
    vi.mocked(listMaterials).mockResolvedValue(collection([material]));
    const { container } = renderPage(await listPage());

    expect(container.querySelectorAll("main")).toHaveLength(1);
    // OD-2: the same dual-action hero as /products, with no decorative stamp.
    const hero = screen.getByRole("heading", { level: 1, name: "مواد اولیه" }).closest("section") as HTMLElement;
    expect(within(hero).getByRole("link", { name: "مشاهده مواد اولیه" })).toHaveAttribute("href", "#material-catalog");
    expect(within(hero).getByRole("link", { name: "ثبت استعلام مواد اولیه" })).toHaveAttribute("href", "/inquiry/material");
    expect(within(hero).getByRole("img", { name: "معرفی تأمین مواد اولیه ترنج پلاستیک" })).toHaveAttribute("width", "1122");
    expect(hero.textContent).not.toContain("PRODUCT CATALOG");
    expect(container.querySelector("#material-catalog")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "مواد اولیه" })).toBeInTheDocument();
    expect(container.querySelector('[data-layout="single"]')).not.toBeNull();
    const card = screen.getByRole("article");
    expect(within(card).getByRole("link", { name: /مشاهده جزئیات/ })).toHaveAttribute("href", "/materials/pp-homopolymer");
    expect(within(card).getByText("پلی‌پروپیلن")).toBeInTheDocument();
    expect(within(card).getByText("PP-H012")).toHaveAttribute("dir", "ltr");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the honest empty state without sample materials", async () => {
    vi.mocked(listMaterials).mockResolvedValue(collection([]));
    const { container } = renderPage(await listPage());

    expect(screen.getByRole("heading", { level: 1, name: "مواد اولیه" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "ماده منتشرشده‌ای وجود ندارد" })).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی" })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("does not present an unavailable API as an empty catalog", async () => {
    vi.mocked(listMaterials).mockRejectedValue(new PublicContentError("upstream", 503));
    await expect(listPage()).rejects.toBeInstanceOf(PublicContentError);
  });
});

describe("material detail route", () => {
  it("offers the hero action only for open materials and always shows the inquiry card", async () => {
    vi.mocked(getMaterial).mockResolvedValue(material);
    const { container, unmount } = renderPage(await detailPage("pp-homopolymer"));

    const record = container.querySelector("article") as HTMLElement;
    expect(within(record).getByRole("heading", { level: 1, name: "پلی‌پروپیلن هموپلیمر" })).toBeInTheDocument();
    expect(within(record).getByText("PP-H012")).toHaveAttribute("dir", "ltr");
    expect(within(record).getByText("تأمین‌کننده ثبت‌شده")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت استعلام ماده" })).toHaveAttribute("href", "/inquiry/material?slug=pp-homopolymer");
    expect(screen.getByRole("link", { name: "ثبت استعلام مستقیم این ماده" })).toHaveAttribute("href", "/inquiry/material?slug=pp-homopolymer");
    expect(screen.getByText("12 g/10min")).toHaveAttribute("dir", "ltr");
    const breadcrumb = screen.getByRole("navigation", { name: "مسیر صفحه" });
    expect(within(breadcrumb).getByRole("link", { name: "مواد اولیه" })).toHaveAttribute("href", "/materials");
    expect(within(breadcrumb).getByText("پلی‌پروپیلن هموپلیمر")).toHaveAttribute("aria-current", "page");
    expect(await axe(container)).toHaveNoViolations();
    unmount();

    vi.mocked(getMaterial).mockResolvedValue({ ...material, inquiryAvailable: false, family: null, grade: null, manufacturer: null });
    const { container: closed } = renderPage(await detailPage("pp-homopolymer"));
    expect(screen.queryByRole("link", { name: "ثبت استعلام ماده" })).not.toBeInTheDocument();
    expect(screen.queryByText("PP-H012")).not.toBeInTheDocument();
    // OD-1 option B: the card is shown for every material (as before the
    // migration); only the hero action follows the editor's switch.
    expect(screen.getByRole("link", { name: "ثبت استعلام مستقیم این ماده" })).toHaveAttribute("href", "/inquiry/material?slug=pp-homopolymer");
    expect(screen.getByRole("region", { name: "نیاز به تأمین تناژ یا فرمولاسیون این گرید دارید؟" })).toBeInTheDocument();
    expect(closed.querySelectorAll('a[href^="/inquiry"]')).toHaveLength(1);
    // The approved record itself stays.
    expect(screen.getByRole("heading", { level: 1, name: "پلی‌پروپیلن هموپلیمر" })).toBeInTheDocument();
    expect(screen.getByText("12 g/10min")).toHaveAttribute("dir", "ltr");
  });

  it("returns the shared not-found experience and noindex metadata for hidden records", async () => {
    vi.mocked(getMaterial).mockRejectedValue(new PublicContentError("not_found", 404));
    await expect(detailPage("archived-grade")).rejects.toThrow();
    expect(await generateMetadata({ params: Promise.resolve({ slug: "archived-grade" }) })).toEqual({ title: "ماده پیدا نشد", robots: { index: false, follow: false } });
  });

  it("derives canonical metadata from the material record", async () => {
    vi.mocked(getMaterial).mockResolvedValue(material);
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "pp-homopolymer" }) });
    expect(metadata.alternates?.canonical).toBe("/materials/pp-homopolymer");
    expect(metadata.description).toBe("خلاصه منتشرشده ماده");
  });
});
