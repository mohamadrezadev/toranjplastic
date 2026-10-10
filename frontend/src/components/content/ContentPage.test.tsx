import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { ContentCard, ContentTag, Pagination, PreservedText } from "./ContentPage";

describe("public content presentation", () => {
  it("renders approved optional data and a valid detail destination", async () => {
    const { container } = render(<ContentCard title="سبد صنعتی" summary="خلاصه تأییدشده" href="/products/industrial-basket" image={null} meta={<ContentTag ltr>PP-H012</ContentTag>} />);
    expect(screen.getByRole("link", { name: "مشاهده جزئیات" })).toHaveAttribute("href", "/products/industrial-basket");
    expect(screen.getByText("PP-H012")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("تصویر ثبت نشده")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders keyboard-operable pagination only when needed", () => {
    const { rerender } = render(<Pagination basePath="/products" pageInfo={{ page: 2, pageSize: 12, total: 30, totalPages: 3 }} />);
    expect(screen.getByRole("link", { name: "صفحه قبل" })).toHaveAttribute("href", "/products?page=1");
    expect(screen.getByRole("link", { name: "صفحه بعد" })).toHaveAttribute("href", "/products?page=3");
    rerender(<Pagination basePath="/products" pageInfo={{ page: 1, pageSize: 12, total: 1, totalPages: 1 }} />);
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی" })).not.toBeInTheDocument();
  });

  it("preserves paragraphs as text without creating an HTML boundary", () => {
    const { container } = render(<PreservedText body={'بند اول\n\n<script>alert("x")</script>'} />);
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(/<script>/)).toBeInTheDocument();
  });
});
