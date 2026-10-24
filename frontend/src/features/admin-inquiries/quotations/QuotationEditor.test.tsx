import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuotationEditor } from "./QuotationEditor";
import type { Quotation } from "./types";

const draft: Quotation = {
  id: "quotation-1",
  inquiryId: "inquiry-1",
  quotationNumber: "TRJ-1405-0001",
  version: 1,
  editVersion: 0,
  status: "DRAFT",
  items: [{ id: "item-1", position: 1, description: "قطعه", quantity: "1", unit: "عدد", unitPriceRials: "2500", lineTotalRials: "2500" }],
  subtotalRials: "2500",
  discountRials: "0",
  taxRials: "0",
  additionalCostRials: "0",
  totalRials: "2500",
  validUntil: "2026-10-19T11:00:00.000Z",
  deliveryTerms: "تحویل توافقی",
  paymentTerms: "پرداخت توافقی",
  notes: null,
  sentAt: null,
  respondedAt: null,
  rejectionReason: null,
  createdAt: "2026-10-19T08:00:00.000Z",
  updatedAt: "2026-10-19T08:00:00.000Z",
};

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

  it("shows a saved UTC expiry using Iran local time", () => {
    render(<QuotationEditor draft={draft} action={vi.fn()} />);
    expect(screen.getByLabelText(/اعتبار تا/)).toHaveValue("2026-10-19T14:30");
    expect(screen.getByText("تاریخ و ساعت براساس منطقه زمانی ایران ثبت می‌شود.")).toBeVisible();
  });
});
