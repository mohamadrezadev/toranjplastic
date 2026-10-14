// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminPortalShell } from "./AdminPortalShell";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/inquiries" }));

const account = { id: "admin-1", mobile: "+989121234567", displayName: "مدیر نمونه", email: null, companyName: null, role: "ADMIN" as const, status: "ACTIVE" as const, createdAt: "2026-10-14T00:00:00.000Z", lastLoginAt: null };

describe("AdminPortalShell", () => {
  it("renders the management identity, active route, breadcrumbs and workspace", () => {
    render(<AdminPortalShell account={account} logoutAction={async () => undefined}><h1>کارتابل</h1></AdminPortalShell>);
    expect(screen.getByRole("navigation", { name: "بخش‌های پنل مدیریت" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "استعلام‌ها" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "محصولات" })).toHaveAttribute("href", "/admin/products");
    expect(screen.getByRole("navigation", { name: "مسیر صفحه" })).toHaveTextContent("استعلام‌ها");
    expect(screen.getAllByText("مدیر نمونه")).toHaveLength(2);
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { name: "کارتابل" }));
    expect(screen.getByRole("button", { name: "خروج امن" })).toBeEnabled();
  });
});
