import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuotationEditor } from "./QuotationEditor";

describe("QuotationEditor", () => {
  it("adds/removes mobile-safe manual items and derives integer totals without ecommerce controls", async () => {
    const user = userEvent.setup();
    render(<QuotationEditor action={vi.fn()} />);
    expect(screen.getAllByRole("group")).toHaveLength(1);
    const price = screen.getByLabelText("قیمت واحد (ریال)");
    await user.clear(price);
    await user.type(price, "2500");
    expect(screen.getAllByText(/۲٬۵۰۰ ریال/)).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "افزودن ردیف" }));
    expect(screen.getAllByRole("group")).toHaveLength(2);
    await user.click(
      screen.getAllByRole("button", { name: "حذف ردیف" }).at(-1)!,
    );
    expect(screen.getAllByRole("group")).toHaveLength(1);
    expect(
      screen.queryByText(/سبد خرید|پرداخت آنلاین|موجودی زنده/),
    ).not.toBeInTheDocument();
  });
});
