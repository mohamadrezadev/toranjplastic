// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminPortalShell } from "./AdminPortalShell";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/inquiries" }));

const account = { id: "admin-1", mobile: "+989121234567", displayName: "مدیر نمونه", email: null, companyName: null, role: "ADMIN" as const, status: "ACTIVE" as const, createdAt: "2026-10-14T00:00:00.000Z", lastLoginAt: null, capabilities: ["MANAGEMENT_ACCESS", "STAFF_MANAGEMENT", "INQUIRY_OPERATIONS", "CONTENT_MANAGEMENT"] as Array<"MANAGEMENT_ACCESS" | "STAFF_MANAGEMENT" | "INQUIRY_OPERATIONS" | "CONTENT_MANAGEMENT"> };

describe("AdminPortalShell", () => {
  it("renders the management identity, active route, breadcrumbs and workspace", () => {
    render(<AdminPortalShell account={account} logoutAction={async () => undefined}><h1>کارتابل</h1></AdminPortalShell>);
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
    render(<AdminPortalShell account={sales} logoutAction={async () => undefined}><h1>فروش</h1></AdminPortalShell>);
    expect(screen.getAllByRole("link", { name: "استعلام‌ها" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "محصولات" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "کاربران سازمانی" })).not.toBeInTheDocument();
  });

  it("shows only content navigation to Operator", () => {
    const operator = { ...account, role: "OPERATOR" as const, capabilities: ["MANAGEMENT_ACCESS", "CONTENT_MANAGEMENT"] as Array<"MANAGEMENT_ACCESS" | "CONTENT_MANAGEMENT"> };
    render(<AdminPortalShell account={operator} logoutAction={async () => undefined}><h1>محتوا</h1></AdminPortalShell>);
    expect(screen.getAllByRole("link", { name: "محصولات" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "استعلام‌ها" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "کاربران سازمانی" })).not.toBeInTheDocument();
  });
});
