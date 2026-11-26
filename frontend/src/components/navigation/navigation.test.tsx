import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import type { ReactElement } from "react";
import { beforeAll, describe, expect, it } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { primaryNavigationRoutes, publicRoutes } from "@/design-system/routes";
import { Breadcrumb, Footer, Header } from ".";

function renderShell(ui: ReactElement) {
  return render(<InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{ui}</InternationalizationProvider>);
}

describe("public navigation", () => {
  beforeAll(() => {
    // jsdom does not implement the modal dialog methods used by Astryx MobileNav.
    HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) { this.setAttribute("open", ""); };
    HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); };
  });

  it("uses only implemented internal destinations and excludes commerce actions", () => {
    for (const route of publicRoutes) {
      expect(route.path).toMatch(/^\/(?!\/|#)/);
      expect(route.path).not.toContain("#");
    }
    expect(publicRoutes.map((route) => route.key).join(" ")).not.toMatch(/cart|checkout|payment|inventory/);
  });

  it("exposes one labelled primary navigation with brand, destinations and actions", async () => {
    const { container } = renderShell(<Header />);
    const navigation = screen.getByRole("navigation", { name: "ناوبری اصلی" });
    expect(within(navigation).getByRole("link", { name: "ترنج پلاستیک — صفحه اصلی" })).toHaveAttribute("href", "/");
    for (const route of primaryNavigationRoutes) {
      expect(within(navigation).getAllByRole("link", { name: route.label }).some((link) => link.getAttribute("href") === route.path)).toBe(true);
    }
    expect(within(navigation).getAllByRole("link", { name: "ثبت استعلام" })[0]).toHaveAttribute("href", "/inquiry");
    expect(within(navigation).getAllByRole("link", { name: "حساب من" })[0]).toHaveAttribute("href", "/account");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens and closes the labelled mobile navigation dialog from its trigger", async () => {
    const user = userEvent.setup();
    renderShell(<><Header /><main>محتوا</main><Footer /></>);
    const trigger = screen.getByRole("button", { name: "بازکردن فهرست" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "mobile-navigation");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const dialog = screen.getByRole("dialog", { name: "فهرست اصلی" });
    expect(dialog).toHaveAttribute("id", "mobile-navigation");
    const mobileNavigation = within(dialog).getByRole("navigation", { name: "ناوبری موبایل" });
    expect(within(mobileNavigation).getByRole("link", { name: "محصولات" })).toHaveAttribute("href", "/products");
    expect(within(dialog).getByRole("link", { name: "ثبت استعلام" })).toHaveAttribute("href", "/inquiry");

    // Native top-layer inertness, focus trap and focus return are browser
    // behaviour and are covered by e2e/public-shell.spec.ts.
    await user.click(within(dialog).getByRole("button", { name: "بستن فهرست" }));
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
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

  it("keeps primary contact visible and folds lower-priority links into labelled collapsible groups", async () => {
    const user = userEvent.setup();
    const { container } = renderShell(<Footer />);
    expect(screen.getByRole("contentinfo")).toHaveAttribute("data-toranj-surface", "inverse");
    expect(screen.getByRole("link", { name: "info@toranjplastic.com" })).toHaveAttribute("href", "mailto:info@toranjplastic.com");
    expect(screen.getByRole("link", { name: "۰۹۱۳ ۲۰۷ ۵۹۲۵" })).toHaveAttribute("href", "tel:09132075925");

    const productsTrigger = screen.getByRole("button", { name: "محصولات و خدمات" });
    expect(productsTrigger).toHaveAttribute("aria-expanded", "false");
    // Astryx hides collapsed content with its stylesheet, which jsdom does not
    // apply; e2e/public-shell.spec.ts asserts the hidden state in a browser.

    productsTrigger.focus();
    await user.keyboard("{Enter}");
    expect(productsTrigger).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(productsTrigger.getAttribute("aria-controls") ?? "");
    if (!panel) throw new Error("collapsible panel is not linked to its trigger");
    const mobileLinks = within(panel).getByRole("navigation", { name: "محصولات و خدمات فوتر موبایل" });
    expect(within(mobileLinks).getByRole("link", { name: "محصولات کاتالوگ" })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("button", { name: "دسترسی و راهنما" })).toHaveAttribute("aria-expanded", "false");
    expect(await axe(container)).toHaveNoViolations();
  });
});
