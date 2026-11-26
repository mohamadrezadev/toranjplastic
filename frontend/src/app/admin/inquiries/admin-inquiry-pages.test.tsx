// @vitest-environment jsdom
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";

vi.mock("@/features/admin-inquiries/api", async () => {
  class AdminInquiryError extends Error {
    constructor(readonly kind: string, readonly status: number) { super(kind); }
  }
  return { AdminInquiryError, listAdminInquiries: vi.fn(), getAdminInquirySummary: vi.fn(), listAdminAssignees: vi.fn(), getAdminInquiry: vi.fn() };
});
vi.mock("@/features/admin-inquiries/actions", () => ({
  updateInquiryStatusAction: vi.fn(), updateInquiryAssignmentAction: vi.fn(), addInquiryNoteAction: vi.fn(), addCustomerVisibleMessageAction: vi.fn(),
}));
vi.mock("@/features/admin-inquiries/quotations/api", () => ({
  listAdminQuotations: vi.fn(), adminQuotationPdfUrl: (inquiryId: string, quotationId: string) => `/admin-pdf/${inquiryId}/${quotationId}`,
}));
vi.mock("@/features/admin-inquiries/quotations/actions", () => ({
  saveQuotationDraftAction: vi.fn(), reviseQuotationAction: vi.fn(), sendQuotationAction: vi.fn(),
}));

import { getAdminInquiry, getAdminInquirySummary, listAdminAssignees, listAdminInquiries } from "@/features/admin-inquiries/api";
import { listAdminQuotations } from "@/features/admin-inquiries/quotations/api";
import type { AdminInquiry, AdminInquiryListItem } from "@/features/admin-inquiries";
import InboxPage from "./page";
import DetailPage from "./[id]/page";
import InquiriesError from "./error";

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}
const renderPage = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

const owner = { id: "customer-1", displayName: "مشتری نمونه", mobile: "09121234567", companyName: "شرکت نمونه" };
const listItem = (over: Partial<AdminInquiryListItem> = {}): AdminInquiryListItem => ({
  id: "inquiry-abcdefghij1234", type: "PRODUCT", status: "SUBMITTED", version: 0, catalogItemName: "سبد صنعتی نمونه",
  createdAt: "2026-10-10T08:00:00.000Z", updatedAt: "2026-10-10T08:00:00.000Z", ownerSummary: owner, assigneeSummary: null, ...over,
});
const detail = (over: Partial<AdminInquiry> = {}): AdminInquiry => ({
  ...listItem({ status: "UNDER_REVIEW", version: 3 }),
  description: "درخواست آزمون", approximateQuantity: "100", quantityUnit: "عدد", deliveryCity: "تهران", requestedTiming: null,
  partDescription: null, moldStatus: null, materialName: null, color: null, materialRequestKind: null, polymerName: null,
  grade: null, brand: null, materialCondition: null, application: null, specifications: null,
  allowedTransitions: ["REJECTED", "COMPLETED"],
  statusHistory: [{ id: "h1", fromStatus: null, toStatus: "SUBMITTED", createdAt: "2026-10-10T08:00:00.000Z", actorSummary: { id: "a1", displayName: "مدیر نمونه" } }],
  assignmentHistory: [],
  internalNotes: [{ id: "n1", text: "یادداشت فقط برای کارکنان", authorSummary: { id: "a1", displayName: "مدیر نمونه" }, createdAt: "2026-10-11T08:00:00.000Z" }],
  messages: [{ id: "m1", senderType: "CUSTOMER", authorDisplayName: "مشتری نمونه", text: "سلام", createdAt: "2026-10-11T09:00:00.000Z" }],
  ...over,
}) as AdminInquiry;

beforeEach(() => {
  vi.mocked(listAdminInquiries).mockReset();
  vi.mocked(getAdminInquirySummary).mockResolvedValue({ total: 12, unassigned: 4, submitted: 5, underReview: 3 });
  vi.mocked(listAdminAssignees).mockResolvedValue([{ id: "admin-1", displayName: "مدیر نمونه", mobile: "09120000000" }]);
  vi.mocked(getAdminInquiry).mockReset();
  vi.mocked(listAdminQuotations).mockResolvedValue([]);
});

describe("admin inquiry inbox (task 8.4)", () => {
  it("shows the real summary, the filters, a table and cards, and page links that keep every filter", async () => {
    vi.mocked(listAdminInquiries).mockResolvedValue({ items: [listItem(), listItem({ id: "inquiry-2zzzzzzzzzzzz", status: "REJECTED", catalogItemName: null })], page: 2, pageSize: 20, total: 45, pageCount: 3 });
    const { container } = renderPage(await InboxPage({ searchParams: Promise.resolve({ page: "2", q: "سبد", status: "SUBMITTED", assignment: "admin-1" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "کارتابل استعلام‌ها" })).toBeInTheDocument();
    const summary = screen.getByRole("group", { name: "خلاصه استعلام‌ها" });
    expect(within(summary).getByText("۱۲")).toBeInTheDocument();
    expect(within(summary).getByText("بدون مسئول")).toBeInTheDocument();
    const filters = screen.getByRole("form", { name: "جست‌وجو و فیلتر" });
    expect(within(filters).getByLabelText("وضعیت")).toHaveValue("SUBMITTED");
    expect(within(filters).getByLabelText("مسئول")).toHaveValue("admin-1");
    expect(within(filters).getByLabelText(/شناسه، عنوان یا موبایل/)).toHaveValue("سبد");
    const table = screen.getByRole("table", { name: "فهرست استعلام‌ها" });
    expect(within(table).getAllByRole("link", { name: "سبد صنعتی نمونه" })[0]).toHaveAttribute("href", "/admin/inquiries/inquiry-abcdefghij1234");
    expect(within(table).getAllByText("ردشده").length).toBeGreaterThan(0);
    expect(screen.getByRole("list", { name: "فهرست استعلام‌ها (کارت)" }).querySelectorAll("li")).toHaveLength(2);
    const pages = screen.getByRole("navigation", { name: "صفحه‌بندی فهرست" });
    const previous = within(pages).getByRole("link", { name: "قبلی" }).getAttribute("href") ?? "";
    expect(previous).toContain("assignment=admin-1");
    expect(previous).toContain("status=SUBMITTED");
    expect(previous).toContain("page=1");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the empty state with a clear action only when filters are set", async () => {
    vi.mocked(listAdminInquiries).mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0, pageCount: 0 });
    const { unmount } = renderPage(await InboxPage({ searchParams: Promise.resolve({ q: "هیچ" }) }));
    expect(screen.getByText("استعلامی با این فیلترها پیدا نشد.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "پاک‌کردن فیلترها" })).toHaveAttribute("href", "/admin/inquiries");
    unmount();
    renderPage(await InboxPage({ searchParams: Promise.resolve({}) }));
    expect(screen.queryByRole("link", { name: "پاک‌کردن فیلترها" })).not.toBeInTheDocument();
  });

  it("renders the bounded error state with a retry and no error detail", () => {
    const retry = vi.fn();
    renderPage(<InquiriesError error={new Error("secret stack detail")} retry={retry} />);
    expect(screen.getByRole("heading", { level: 1, name: "کارتابل در دسترس نیست" })).toBeInTheDocument();
    expect(screen.queryByText(/secret stack detail/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "تلاش دوباره" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "بازگشت به پنل" })).toHaveAttribute("href", "/admin");
  });
});

describe("admin inquiry detail (task 8.4)", () => {
  const open = async (over: Partial<AdminInquiry> = {}, search: { error?: string; success?: string } = {}) => {
    vi.mocked(getAdminInquiry).mockResolvedValue(detail(over));
    return renderPage(await DetailPage({ params: Promise.resolve({ id: "inquiry-abcdefghij1234" }), searchParams: Promise.resolve(search) }));
  };

  it("separates submitted data from staff-only operations and carries the version in every mutation", async () => {
    const { container } = await open();
    expect(screen.getByRole("heading", { level: 1, name: "سبد صنعتی نمونه" })).toBeInTheDocument();
    for (const name of ["اطلاعات ثبت‌شده مشتری", "پیشنهاد قیمت", "گفتگو با مشتری", "تاریخچه وضعیت", "یادداشت‌های داخلی", "مسئول رسیدگی", "تغییر وضعیت", "تاریخچه تخصیص"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByText("فقط کارکنان مجاز؛ برای مشتری ارسال نمی‌شود")).toBeInTheDocument();
    expect(screen.getByText("یادداشت فقط برای کارکنان")).toBeInTheDocument();
    const versions = Array.from(container.querySelectorAll('input[name="expectedVersion"]')).map((node) => (node as HTMLInputElement).value);
    expect(versions.length).toBeGreaterThanOrEqual(4);
    expect(new Set(versions)).toEqual(new Set(["3"]));
    expect(screen.getByRole("button", { name: "ردشده" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "تکمیل‌شده" })).toBeInTheDocument();
    expect(screen.getByLabelText("کارمند فعال")).toHaveValue("");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("offers only the allowed status changes and says so when there are none", async () => {
    await open({ allowedTransitions: [] });
    expect(screen.getByText("انتقال دستی دیگری برای وضعیت فعلی وجود ندارد.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ردشده" })).not.toBeInTheDocument();
  });

  it("allows the more-information request only while the inquiry is under review", async () => {
    const { unmount } = await open();
    expect(screen.getByRole("checkbox", { name: /درخواست اطلاعات تکمیلی/ })).not.toHaveAttribute("aria-disabled", "true");
    unmount();
    await open({ status: "SUBMITTED" });
    // Astryx keeps a disabled checkbox focusable and marks it aria-disabled; it submits nothing.
    expect(screen.getByRole("checkbox", { name: /درخواست اطلاعات تکمیلی/ })).toHaveAttribute("aria-disabled", "true");
  });

  it("states a version conflict with an explicit refresh action and does not retry", async () => {
    await open({}, { error: "INQUIRY_VERSION_CONFLICT" });
    expect(screen.getAllByText("این درخواست هم‌زمان تغییر کرده است. صفحه را تازه‌سازی کنید.").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "تازه‌سازی" })).toHaveAttribute("href", "/admin/inquiries/inquiry-abcdefghij1234");
    expect(vi.mocked(getAdminInquiry)).toHaveBeenCalledTimes(1);
  });

  it("shows a result banner for a success and a plain danger alert for another failure", async () => {
    const { unmount } = await open({}, { success: "note" });
    expect(screen.getAllByText("یادداشت داخلی ثبت شد.").length).toBeGreaterThan(0);
    unmount();
    await open({}, { error: "INQUIRY_INVALID_TRANSITION" });
    expect(screen.getAllByText("این تغییر وضعیت دیگر مجاز نیست.").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "تازه‌سازی" })).not.toBeInTheDocument();
  });

  it("shows the empty conversation state and the empty notes text", async () => {
    await open({ messages: [], internalNotes: [] });
    expect(screen.getByText("هنوز پیامی در این گفتگو ثبت نشده است.")).toBeInTheDocument();
    expect(screen.getByText("یادداشت داخلی ثبت نشده است.")).toBeInTheDocument();
    expect(screen.getByText("تغییر مسئولی ثبت نشده است.")).toBeInTheDocument();
  });
});
