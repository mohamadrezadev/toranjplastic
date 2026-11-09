import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { publicRoutes } from "@/design-system/routes";
import { Breadcrumb, Footer, Header } from ".";

describe("public navigation", () => {
  it("uses only implemented internal destinations and excludes commerce actions", () => {
    for (const route of publicRoutes) {
      expect(route.path).toMatch(/^\/(?!\/|#)/);
      expect(route.path).not.toContain("#");
    }
    expect(publicRoutes.map((route) => route.key).join(" ")).not.toMatch(/cart|checkout|payment|inventory/);
  });

  it("opens an accessible mobile drawer, blocks the background and returns focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<><Header /><main data-shell-inert>محتوا</main><Footer /></>);
    const trigger = screen.getByRole("button", { name: "بازکردن فهرست" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "فهرست اصلی" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "بستن فهرست" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).not.toHaveAttribute("inert");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders approved-only footer copy and an aria-current breadcrumb", async () => {
    const { container } = render(<><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "محصولات" }]} /><Footer /></>);
    expect(screen.getByText("محصولات")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText(/تهران، کهریزک/)).toBeInTheDocument();
    expect(screen.getByText(/۰۹۱۳ ۲۰۷ ۵۹۲۵/)).toBeInTheDocument();
    expect(screen.getByText(/info@toranjplastic\.com/)).toBeInTheDocument();
    expect(screen.getByText(/۰۹۱۳ ۲۰۷ ۵۹۲۵/).closest("[dir='ltr']")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps primary contact visible and exposes lower-priority links through native disclosures", async () => {
    const user = userEvent.setup();
    render(<Footer />);
    const productsSummary = screen.getAllByText("محصولات و خدمات").find((element) => element.tagName === "SUMMARY");
    if (!productsSummary) throw new Error("mobile footer disclosure summary is missing");
    const productsDisclosure = productsSummary.closest("details");

    expect(productsDisclosure).not.toHaveAttribute("open");
    expect(screen.getByText(/info@toranjplastic\.com/)).toBeInTheDocument();
    await user.click(productsSummary);
    expect(productsDisclosure).toHaveAttribute("open");
    expect(screen.getAllByRole("link", { name: "محصولات کاتالوگ" }).some((link) => link.getAttribute("href") === "/products")).toBe(true);
  });
});
