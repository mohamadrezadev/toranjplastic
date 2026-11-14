// @vitest-environment jsdom
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";

vi.mock("@/lib/inquiries", async () => {
  const actual = await vi.importActual<typeof import("@/lib/inquiries")>("@/lib/inquiries");
  return { ...actual, listInquiries: vi.fn(), getInquiry: vi.fn(), addInquiryMessage: vi.fn() };
});
vi.mock("@/lib/customer-quotations", async () => {
  const actual = await vi.importActual<typeof import("@/lib/customer-quotations")>("@/lib/customer-quotations");
  return { ...actual, listCustomerQuotations: vi.fn() };
});
vi.mock("./inquiries/[id]/actions", () => ({
  addCustomerInquiryMessageAction: vi.fn(),
  acceptCustomerQuotationAction: vi.fn(),
  rejectCustomerQuotationAction: vi.fn(),
}));

import { InquiryApiError, getInquiry, listInquiries, type CustomerInquiryDetail } from "@/lib/inquiries";
import { listCustomerQuotations } from "@/lib/customer-quotations";
import AccountPage from "./page";
import AccountError from "./error";
import AccountNotFound from "./not-found";
import InquiryListPage from "./inquiries/page";
import InquiryDetailPage from "./inquiries/[id]/page";

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}
const renderPage = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });
const notFoundDigest = "NEXT_HTTP_ERROR_FALLBACK;404";

const base = {
  id: "inquiry-1", type: "PRODUCT", status: "UNDER_REVIEW", version: 1, catalogItemName: "سبد صنعتی نمونه",
  description: "درخواست آزمون", approximateQuantity: "100", quantityUnit: null, deliveryCity: "تهران", requestedTiming: null,
  partDescription: null, moldStatus: null, materialName: null, color: null, materialRequestKind: null, polymerName: null,
  grade: null, brand: null, materialCondition: null, application: null, specifications: null,
  createdAt: "2026-10-10T08:00:00.000Z", updatedAt: "2026-10-10T08:00:00.000Z",
  statusHistory: [
    { id: "h1", fromStatus: null, toStatus: "SUBMITTED", createdAt: "2026-10-10T08:00:00.000Z" },
    { id: "h2", fromStatus: "SUBMITTED", toStatus: "UNDER_REVIEW", createdAt: "2026-10-11T08:00:00.000Z" },
  ],
} as const;
const detail = (overrides: Partial<CustomerInquiryDetail> = {}): CustomerInquiryDetail => ({
  ...base,
  statusHistory: [...base.statusHistory],
  messages: [
    { id: "m1", senderType: "STAFF", authorDisplayName: "کارشناس", text: "لطفاً مقدار دقیق را بنویسید.", createdAt: "2026-10-11T09:00:00.000Z" },
    { id: "m2", senderType: "CUSTOMER", authorDisplayName: "شما", text: "۱۰۰ عدد.", createdAt: "2026-10-11T10:00:00.000Z" },
  ],
  ...overrides,
}) as CustomerInquiryDetail;

beforeEach(() => {
  vi.mocked(listInquiries).mockReset();
  vi.mocked(getInquiry).mockReset();
  vi.mocked(listCustomerQuotations).mockReset();
  vi.mocked(listCustomerQuotations).mockResolvedValue([]);
});

describe("customer overview", () => {
  it("shows one heading, a hero action, two named destination links and the privacy note", async () => {
    const { container } = renderPage(<AccountPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "مدیریت درخواست‌ها، ساده و شفاف" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت درخواست جدید" })).toHaveAttribute("href", "/inquiry");
    expect(screen.getByRole("link", { name: "درخواست‌های من" })).toHaveAttribute("href", "/account/inquiries");
    expect(screen.getByRole("link", { name: "درخواست تازه" })).toHaveAttribute("href", "/inquiry");
    expect(screen.getByText(/فقط در نشست معتبر شما نمایش داده می‌شود/)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("owned request list", () => {
  it("lists each request with its approved status label, date and a named link, with a GET filter", async () => {
    vi.mocked(listInquiries).mockResolvedValue({ items: [detail() as never], page: 1, pageSize: 20, total: 1, pageCount: 1 });
    const { container } = renderPage(await InquiryListPage({ searchParams: Promise.resolve({ status: "UNDER_REVIEW" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "درخواست‌های من" })).toBeInTheDocument();
    const form = screen.getByRole("form", { name: "فیلتر درخواست‌ها" });
    expect(within(form).getByRole("combobox", { name: "وضعیت پیگیری" })).toHaveValue("UNDER_REVIEW");
    expect(within(form).getByRole("button", { name: "اعمال فیلتر" })).toBeEnabled();
    const row = screen.getAllByRole("listitem")[0];
    expect(within(row).getByRole("link", { name: "سبد صنعتی نمونه" })).toHaveAttribute("href", "/account/inquiries/inquiry-1");
    expect(within(row).getByText("در حال بررسی")).toBeInTheDocument();
    expect(row.querySelector("time")).toHaveAttribute("datetime", "2026-10-10T08:00:00.000Z");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a factual empty state with a way to start a request", async () => {
    vi.mocked(listInquiries).mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0, pageCount: 0 });
    const { container } = renderPage(await InquiryListPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 2, name: "درخواستی با این شرایط پیدا نشد" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت درخواست جدید" })).toHaveAttribute("href", "/inquiry");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("request detail", () => {
  it("shows the header, submitted data, a chronological conversation, the composer and the status history", async () => {
    vi.mocked(getInquiry).mockResolvedValue(detail());
    const { container } = renderPage(await InquiryDetailPage({ params: Promise.resolve({ id: "inquiry-1" }), searchParams: Promise.resolve({ success: "message" }) }));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "سبد صنعتی نمونه" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "موفق" })).toHaveTextContent("پیام شما برای کارشناس ثبت شد.");
    const data = screen.getByRole("region", { name: "اطلاعات ثبت‌شده" });
    expect(within(data).getByText("مقدار تقریبی")).toBeInTheDocument();
    expect(within(data).getByText("تهران")).toBeInTheDocument();
    const conversation = screen.getByRole("region", { name: "گفتگو با کارشناس" });
    const messages = within(conversation).getAllByRole("article");
    expect(messages.map((message) => message.getAttribute("data-sender"))).toEqual(["STAFF", "CUSTOMER"]);
    expect(within(messages[1]).getByText("شما")).toBeInTheDocument();
    const composer = within(conversation).getByRole("form", { name: "پیام جدید" });
    expect(within(composer).getByLabelText(/پیام شما/)).toBeRequired();
    expect(within(composer).getByRole("button", { name: "ارسال پیام" })).toBeEnabled();
    const history = screen.getByRole("region", { name: "تاریخچه وضعیت" });
    expect(within(history).getAllByRole("listitem")).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("closes the conversation for a finished request and announces failures assertively", async () => {
    vi.mocked(getInquiry).mockResolvedValue(detail({ status: "COMPLETED" }));
    renderPage(await InquiryDetailPage({ params: Promise.resolve({ id: "inquiry-1" }), searchParams: Promise.resolve({ error: "message", conflict: "quotation" }) }));
    expect(screen.queryByRole("form", { name: "پیام جدید" })).not.toBeInTheDocument();
    expect(screen.getByText("این درخواست بسته شده و امکان ارسال پیام جدید ندارد.")).toBeInTheDocument();
    const alerts = screen.getAllByRole("alert").map((alert) => alert.textContent);
    expect(alerts.some((text) => text?.includes("ارسال پیام انجام نشد"))).toBe(true);
    expect(alerts.some((text) => text?.includes("نسخه پیشنهاد قیمت یا وضعیت درخواست تغییر کرده"))).toBe(true);
  });

  it("returns the same not-found for a request that is missing or not owned", async () => {
    vi.mocked(getInquiry).mockRejectedValue(new InquiryApiError(404));
    await expect(InquiryDetailPage({ params: Promise.resolve({ id: "other" }), searchParams: Promise.resolve({}) })).rejects.toMatchObject({ digest: notFoundDigest });
  });
});

describe("portal error and not-found screens", () => {
  it("never exposes the underlying error and offers the retry", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const retry = vi.fn();
    const { container } = renderPage(<AccountError error={Object.assign(new Error("postgres://internal"), { digest: "x" })} retry={retry} />);
    expect(screen.getByRole("heading", { level: 1, name: "اطلاعات این بخش اکنون در دسترس نیست" })).toBeInTheDocument();
    expect(container.textContent).not.toContain("postgres");
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex, nofollow");
    expect(screen.getByRole("button", { name: "تلاش دوباره" })).toBeEnabled();
  });

  it("uses one ownership-safe message for a missing or foreign request", async () => {
    const { container } = renderPage(<AccountNotFound />);
    expect(screen.getByRole("heading", { level: 1, name: "درخواست موردنظر پیدا نشد" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "بازگشت به درخواست‌ها" })).toHaveAttribute("href", "/account/inquiries");
    expect(await axe(container)).toHaveNoViolations();
  });
});
