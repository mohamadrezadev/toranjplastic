import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContentError from "./error";
import ContentLoading from "./loading";

afterEach(() => vi.restoreAllMocks());

describe("public content route error", () => {
  it("keeps a stable busy region while the public read is pending", () => {
    render(<ContentLoading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("در حال دریافت محتوای منتشرشده…");
  });

  it("shows privacy-safe feedback and retries the idempotent read", async () => {
    const retry = vi.fn();
    const error = Object.assign(new Error("postgres://internal-host/private"), { digest: "fixture" });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const user = userEvent.setup();

    render(<ContentError error={error} retry={retry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("محتوای این صفحه اکنون در دسترس نیست");
    expect(screen.getByRole("alert")).not.toHaveTextContent(/postgres|internal-host|private|fixture/i);
    await user.click(screen.getByRole("button", { name: "تلاش دوباره" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
