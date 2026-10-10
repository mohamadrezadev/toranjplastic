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
    expect(screen.getByText(/اطلاعات تماس.*پس از تأیید رسمی/)).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/@|۰۹\d{9}|021[- ]?\d+/);
    expect(await axe(container)).toHaveNoViolations();
  });
});
