// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ createInquiryAction: vi.fn() }));

import { InquiryForm } from "./InquiryForm";

describe("InquiryForm", () => {
  it("shows one material step at a time and blocks incomplete required fields", async () => {
    const user = userEvent.setup();
    render(<InquiryForm kind="material" options={[{ id: "material-1", name: "پلیمر نمونه" }]} />);

    expect(screen.getByRole("form", { name: "فرم درخواست مواد اولیه" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("مرحله 1 از 4");
    expect(screen.getAllByRole("group")).toHaveLength(1);
    expect(screen.getByRole("group", { name: /موضوع درخواست/ })).toBeVisible();
    expect(screen.queryByRole("button", { name: "ثبت درخواست" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "مرحله بعد" }));
    expect(screen.getByRole("status")).toHaveTextContent("مرحله 1 از 4");
    expect(screen.getByLabelText(/نوع درخواست/)).toHaveFocus();
  });

  it("preserves entered values and focuses the active step when navigating", async () => {
    const user = userEvent.setup();
    render(<InquiryForm kind="material" options={[{ id: "material-1", name: "پلیمر نمونه" }]} />);

    await user.selectOptions(screen.getByLabelText(/نوع درخواست/), "SUPPLY_REQUEST");
    await user.type(screen.getByLabelText(/نام ماده یا نوع پلیمر/), "پلی‌اتیلن");
    await user.click(screen.getByRole("button", { name: "مرحله بعد" }));

    const technicalStep = screen.getByRole("group", { name: /مشخصات فنی/ });
    expect(screen.getByRole("status")).toHaveTextContent("مرحله 2 از 4");
    expect(within(technicalStep).getByText("مشخصات فنی").closest("legend")).toHaveFocus();
    await user.type(screen.getByLabelText(/گرید/), "EX5");
    await user.click(screen.getByRole("button", { name: "مرحله قبل" }));

    expect(screen.getByLabelText(/نام ماده یا نوع پلیمر/)).toHaveValue("پلی‌اتیلن");
    expect(screen.getByRole("group", { name: /موضوع درخواست/ }).querySelector("legend")).toHaveFocus();
  });

  it("keeps the single-step contact form concise and submit-ready", () => {
    render(<InquiryForm kind="contact" />);

    expect(screen.getByRole("status")).toHaveTextContent("مرحله 1 از 1");
    expect(screen.getAllByRole("group")).toHaveLength(1);
    expect(screen.getByRole("group", { name: /شرح درخواست/ })).toBeVisible();
    expect(screen.getByLabelText(/متن درخواست/)).toBeRequired();
    expect(screen.getByRole("button", { name: "ثبت درخواست" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "مرحله بعد" })).not.toBeInTheDocument();
  });

  it("waits for an explicit final submit after the last next-step click", async () => {
    const user = userEvent.setup();
    render(<InquiryForm kind="product" options={[{ id: "product-1", name: "سبد صنعتی" }]} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "محصول" }), "product-1");
    await user.click(screen.getByRole("button", { name: "مرحله بعد" }));
    await user.click(screen.getByRole("button", { name: "مرحله بعد" }));

    expect(screen.getByRole("status")).toHaveTextContent("مرحله 3 از 3");
    expect(screen.getByRole("button", { name: "ثبت درخواست" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "مرحله بعد" })).not.toBeInTheDocument();
  });
});
