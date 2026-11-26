// @vitest-environment jsdom
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";

vi.mock("./actions", () => ({ createInquiryAction: vi.fn() }));
vi.mock("@/lib/public-content", () => ({
  listProducts: vi.fn(),
  listServices: vi.fn(),
  listMaterials: vi.fn(),
  getProduct: vi.fn(),
  getService: vi.fn(),
  getMaterial: vi.fn(),
}));

import { getProduct, listProducts } from "@/lib/public-content";
import InquiryPage from "./page";
import InquiryTypePage from "./[type]/page";

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}
const renderPage = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });
const notFoundDigest = "NEXT_HTTP_ERROR_FALLBACK;404";

beforeEach(() => {
  vi.mocked(listProducts).mockReset();
  vi.mocked(getProduct).mockReset();
});

describe("inquiry type chooser", () => {
  it("lists the four inquiry types as named links under one heading", async () => {
    const { container } = renderPage(<InquiryPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "چه نوع درخواستی دارید؟" })).toBeInTheDocument();
    const links = [
      ["استعلام محصول", "/inquiry/product"],
      ["خدمات تزریق پلاستیک", "/inquiry/injection"],
      ["تأمین مواد اولیه", "/inquiry/material"],
      ["تماس عمومی", "/inquiry/contact"],
    ] as const;
    for (const [name, href] of links) expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    expect(screen.getAllByRole("link")).toHaveLength(4);
    // Each card keeps its own level-two heading and description.
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("inquiry form page", () => {
  it("renders the header, a way back, the private notice and the guided form", async () => {
    vi.mocked(listProducts).mockResolvedValue({ items: [{ id: "product-1", name: "سبد صنعتی" }], pageInfo: { page: 1, pageSize: 12, total: 1, totalPages: 1 } } as never);
    const { container } = renderPage(await InquiryTypePage({ params: Promise.resolve({ type: "product" }), searchParams: Promise.resolve({}) }));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "استعلام محصول" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "بازگشت به انتخاب نوع درخواست" })).toHaveAttribute("href", "/inquiry");
    expect(screen.getByText("پیش از ثبت درخواست")).toBeInTheDocument();
    const form = screen.getByRole("form", { name: "فرم استعلام محصول" });
    expect(within(form).getByRole("combobox", { name: "محصول" })).toBeRequired();
    // A stepper of three steps in an ordered list, beside the live status line.
    const steps = within(screen.getByRole("list", { name: "مراحل فرم درخواست" })).getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("returns not-found for an unknown inquiry type", async () => {
    await expect(InquiryTypePage({ params: Promise.resolve({ type: "unknown" }), searchParams: Promise.resolve({}) })).rejects.toMatchObject({ digest: notFoundDigest });
  });
});
