// @vitest-environment jsdom
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { AdminPortalShell } from "./AdminPortalShell";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/inquiries" }));

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}
const renderShell = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

const account = { id: "admin-1", mobile: "+989121234567", displayName: "مدیر نمونه", email: null, companyName: null, role: "ADMIN" as const, status: "ACTIVE" as const, createdAt: "2026-10-14T00:00:00.000Z", lastLoginAt: null, capabilities: ["MANAGEMENT_ACCESS", "STAFF_MANAGEMENT", "INQUIRY_OPERATIONS", "CONTENT_MANAGEMENT"] as Array<"MANAGEMENT_ACCESS" | "STAFF_MANAGEMENT" | "INQUIRY_OPERATIONS" | "CONTENT_MANAGEMENT"> };

describe("AdminPortalShell", () => {
  it("renders the management identity, active route, breadcrumbs and workspace", () => {
    renderShell(<AdminPortalShell account={account} logoutAction={async () => undefined}><h1>کارتابل</h1></AdminPortalShell>);
    expect(screen.getAllByRole("navigation", { name: "بخش‌های پنل مدیریت" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "استعلام‌ها" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "استعلام‌ها" })[0]).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { name: "محصولات" })[0]).toHaveAttribute("href", "/admin/products");
    expect(screen.getByRole("navigation", { name: "مسیر صفحه" })).toHaveTextContent("استعلام‌ها");
    expect(screen.getAllByText("مدیر نمونه")).toHaveLength(3);
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { name: "کارتابل" }));
    expect(screen.getAllByRole("button", { name: "خروج امن" })).toHaveLength(2);
    expect(screen.getByText("منو")).toBeInTheDocument();
  });

  it("shows only inquiry navigation to Sales", () => {
    const sales = { ...account, role: "SALES" as const, capabilities: ["MANAGEMENT_ACCESS", "INQUIRY_OPERATIONS"] as Array<"MANAGEMENT_ACCESS" | "INQUIRY_OPERATIONS"> };
    renderShell(<AdminPortalShell account={sales} logoutAction={async () => undefined}><h1>فروش</h1></AdminPortalShell>);
    expect(screen.getAllByRole("link", { name: "استعلام‌ها" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "محصولات" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "کاربران سازمانی" })).not.toBeInTheDocument();
  });

  it("shows only content navigation to Operator", () => {
    const operator = { ...account, role: "OPERATOR" as const, capabilities: ["MANAGEMENT_ACCESS", "CONTENT_MANAGEMENT"] as Array<"MANAGEMENT_ACCESS" | "CONTENT_MANAGEMENT"> };
    renderShell(<AdminPortalShell account={operator} logoutAction={async () => undefined}><h1>محتوا</h1></AdminPortalShell>);
    expect(screen.getAllByRole("link", { name: "محصولات" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "استعلام‌ها" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "کاربران سازمانی" })).not.toBeInTheDocument();
  });

  it("has one main landmark, a skip link to it, and a breadcrumb trail ending in the current page", async () => {
    const { container } = renderShell(<AdminPortalShell account={account} logoutAction={async () => undefined}><h1>کارتابل</h1></AdminPortalShell>);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "رفتن به محتوای اصلی" })).toHaveAttribute("href", "#admin-content");
    expect(screen.getByRole("main")).toHaveAttribute("id", "admin-content");
    const trail = screen.getByRole("navigation", { name: "مسیر صفحه" });
    expect(trail.querySelector('[aria-current="page"]')).toHaveTextContent("استعلام‌ها");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens the phone menu from its summary and closes it with Escape, returning focus", async () => {
    const user = userEvent.setup();
    renderShell(<AdminPortalShell account={account} logoutAction={async () => undefined}><h1>کارتابل</h1></AdminPortalShell>);
    const summary = screen.getByText("منو").closest("summary") as HTMLElement;
    const details = summary.closest("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    await user.click(summary);
    expect(details.open).toBe(true);
    await user.keyboard("{Escape}");
    expect(details.open).toBe(false);
    expect(summary).toHaveFocus();
  });

  it("closes the phone menu on a click outside it", async () => {
    const user = userEvent.setup();
    renderShell(<AdminPortalShell account={account} logoutAction={async () => undefined}><h1>کارتابل</h1></AdminPortalShell>);
    const summary = screen.getByText("منو").closest("summary") as HTMLElement;
    const details = summary.closest("details") as HTMLDetailsElement;
    await user.click(summary);
    expect(details.open).toBe(true);
    await user.click(screen.getByRole("heading", { name: "کارتابل" }));
    expect(details.open).toBe(false);
  });
});
