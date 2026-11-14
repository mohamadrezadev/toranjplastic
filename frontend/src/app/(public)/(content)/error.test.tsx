import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import ContentError from "./error";
import ContentLoading from "./loading";
import ContentNotFound from "./not-found";

afterEach(() => vi.restoreAllMocks());

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}

describe("public content route error", () => {
  it("keeps a stable busy region while the public read is pending", async () => {
    const { container } = render(<ContentLoading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("در حال دریافت محتوای منتشرشده…");
    // Streamed content brings its own <main>; the fallback must not add a second landmark.
    expect(container.querySelector("main")).toBeNull();
    // The fallback carries no heading of its own: the streamed page brings the level-one heading.
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("asks crawlers not to index the error screen (OD-7)", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<ContentError error={new Error("x")} retry={vi.fn()} />);
    const robots = document.querySelector('meta[name="robots"]');
    expect(robots).not.toBeNull();
    expect(robots?.getAttribute("content")).toBe("noindex, nofollow");
  });

  it("shows privacy-safe feedback and retries the idempotent read", async () => {
    const retry = vi.fn();
    const error = Object.assign(new Error("postgres://internal-host/private"), { digest: "fixture" });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const user = userEvent.setup();

    const { container } = render(<ContentError error={error} retry={retry} />);

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.querySelector("[data-error-state] [role='alert']")).toHaveTextContent("محتوای این صفحه اکنون در دسترس نیست");
    expect(screen.getByRole("alert")).toHaveTextContent("محتوای این صفحه اکنون در دسترس نیست");
    expect(screen.getByRole("alert")).toHaveTextContent("ارتباط با سرویس محتوا برقرار نشد. کمی بعد دوباره تلاش کنید.");
    expect(screen.getByRole("alert")).not.toHaveTextContent(/postgres|internal-host|private|fixture/i);
    await user.click(screen.getByRole("button", { name: "تلاش دوباره" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("names the page with one level-one heading, like the not-found screen, without a second landmark", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { container } = render(<ContentError error={new Error("fixture")} retry={vi.fn()} />);

    // The message is the page's only heading: a level-one heading, inside the alert region, with the same Persian copy.
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    const heading = screen.getByRole("heading", { level: 1, name: "محتوای این صفحه اکنون در دسترس نیست" });
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(heading.closest("[role='alert']")).toBe(screen.getByRole("alert"));
    expect(screen.getByRole("alert")).toHaveTextContent("ارتباط با سرویس محتوا برقرار نشد. کمی بعد دوباره تلاش کنید.");
    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("retries from the keyboard", async () => {
    const retry = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<ContentError error={new Error("fixture")} retry={retry} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "تلاش دوباره" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe("public content not-found", () => {
  it("uses one neutral message, a current breadcrumb and a route back home", async () => {
    const { container } = render(<ContentNotFound />, { wrapper: PersianAstryx });

    expect(container.querySelectorAll("main")).toHaveLength(1);
    // The message is the page's one level-one heading.
    expect(screen.getByRole("heading", { level: 1, name: "محتوای موردنظر پیدا نشد" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(screen.getByText("این محتوا وجود ندارد یا هنوز برای نمایش عمومی منتشر نشده است.")).toBeInTheDocument();
    const breadcrumb = screen.getByRole("navigation", { name: "مسیر صفحه" });
    expect(within(breadcrumb).getByRole("link", { name: "خانه" })).toHaveAttribute("href", "/");
    expect(within(breadcrumb).getByText("صفحه پیدا نشد")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "بازگشت به خانه" })).toHaveAttribute("href", "/");
    expect(await axe(container)).toHaveNoViolations();
  });
});
