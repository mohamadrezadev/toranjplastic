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
    expect(screen.getByRole("alert")).not.toHaveTextContent(/token|password|stack/i);
  });
});
