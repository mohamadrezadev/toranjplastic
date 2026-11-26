import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Alert, EmptyState, ErrorState, LoadingState } from ".";

describe("feedback patterns", () => {
  it("announces semantic alerts without relying on color", async () => {
    const { container } = render(<Alert variant="warning" title="اطلاعات ناقص است">موارد ضروری را بررسی کنید.</Alert>);
    expect(screen.getByLabelText("هشدار")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("اطلاعات ناقص است");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the plain title for existing callers and draws a heading only when a level is requested", async () => {
    const { container, rerender } = render(<ErrorState title="عنوان آزمایشی" message="پیام آزمایشی" />);
    // Backward compatible: without headingLevel the title is the Banner's plain title text.
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("عنوان آزمایشی");
    expect(screen.getByRole("alert")).toHaveTextContent("پیام آزمایشی");

    rerender(<ErrorState title="عنوان آزمایشی" message="پیام آزمایشی" headingLevel={1} />);
    expect(screen.getByRole("heading", { level: 1, name: "عنوان آزمایشی" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("پیام آزمایشی");
    expect(await axe(container)).toHaveNoViolations();

    // The same opt-in on the underlying alert, at any level and for any status.
    rerender(<Alert variant="warning" title="اطلاعات ناقص است" headingLevel={3}>موارد ضروری را بررسی کنید.</Alert>);
    expect(screen.getByRole("heading", { level: 3, name: "اطلاعات ناقص است" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("موارد ضروری را بررسی کنید.");
    expect(await axe(container)).toHaveNoViolations();

    rerender(<Alert variant="warning" title="اطلاعات ناقص است">موارد ضروری را بررسی کنید.</Alert>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("reserves a busy loading region", () => {
    render(<LoadingState label="در حال دریافت اطلاعات" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("renders only valid empty actions and uses opt-in retry", async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<EmptyState title="موردی نیست" description="هنوز داده‌ای ثبت نشده است." action={{ label: "شروع", href: "/inquiry" }} />);
    expect(screen.getByRole("link", { name: "شروع" })).toHaveAttribute("href", "/inquiry");
    rerender(<ErrorState onRetry={retry} />);
    await user.click(screen.getByRole("button", { name: "تلاش دوباره" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("خطا")).not.toHaveTextContent(/token|password|stack/i);
  });
});
