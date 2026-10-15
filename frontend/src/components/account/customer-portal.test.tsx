// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomerPortalShell } from "./CustomerPortalShell";

vi.mock("next/navigation", () => ({ usePathname: () => "/account/inquiries" }));

const account = {
  id: "customer-1",
  mobile: "+989121234567",
  displayName: "مشتری نمونه",
  email: null,
  companyName: null,
  role: "CUSTOMER" as const,
  status: "ACTIVE" as const,
  createdAt: "2026-10-12T00:00:00.000Z",
  lastLoginAt: null,
  capabilities: [],
};

describe("CustomerPortalShell", () => {
  it("renders account context, private navigation and the main workspace", () => {
    render(<CustomerPortalShell account={account} logoutAction={async () => undefined}><h1>محتوای پنل</h1></CustomerPortalShell>);

    expect(screen.getByRole("navigation", { name: "بخش‌های پنل مشتری" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "نمای کلی" })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("link", { name: "درخواست‌های من" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "درخواست جدید" })).toHaveAttribute("href", "/inquiry");
    expect(screen.getAllByText("مشتری نمونه")).toHaveLength(2);
    expect(screen.getByText("+989121234567")).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { name: "محتوای پنل" }));
    expect(screen.getByRole("button", { name: "خروج امن" })).toBeEnabled();
  });
});
