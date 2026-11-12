// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ createInquiryAction: vi.fn() }));

import { createInquiryAction } from "./actions";
import { InquiryForm } from "./InquiryForm";

const createInquiry = vi.mocked(createInquiryAction);
beforeEach(() => { createInquiry.mockReset(); });

async function reachProductFinalStep(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByRole("combobox", { name: "محصول" }), "product-1");
  await user.click(screen.getByRole("button", { name: "مرحله بعد" }));
  await user.type(screen.getByLabelText("شهر یا محل تحویل"), "تهران");
  await user.click(screen.getByRole("button", { name: "مرحله بعد" }));
  await user.type(screen.getByLabelText("توضیحات تکمیلی"), "درخواست آزمون");
}

function getProgressStatus() {
  return within(screen.getByRole("region", { name: "پیشرفت فرم درخواست" })).getByRole("status");
}

describe("InquiryForm", () => {
  it("shows one material step at a time and blocks incomplete required fields", async () => {
    const user = userEvent.setup();
    render(<InquiryForm kind="material" options={[{ id: "material-1", name: "پلیمر نمونه" }]} />);

    expect(screen.getByRole("form", { name: "فرم درخواست مواد اولیه" })).toBeInTheDocument();
    expect(getProgressStatus()).toHaveTextContent("مرحله 1 از 4");
    expect(screen.getAllByRole("group")).toHaveLength(1);
    expect(screen.getByRole("group", { name: /موضوع درخواست/ })).toBeVisible();
    expect(screen.queryByRole("button", { name: "ثبت درخواست" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "مرحله بعد" }));
    expect(getProgressStatus()).toHaveTextContent("مرحله 1 از 4");
    expect(screen.getByLabelText(/نوع درخواست/)).toHaveFocus();
  });

  it("preserves entered values and focuses the active step when navigating", async () => {
    const user = userEvent.setup();
    render(<InquiryForm kind="material" options={[{ id: "material-1", name: "پلیمر نمونه" }]} />);

    await user.selectOptions(screen.getByLabelText(/نوع درخواست/), "SUPPLY_REQUEST");
    await user.type(screen.getByLabelText(/نام ماده یا نوع پلیمر/), "پلی‌اتیلن");
    await user.click(screen.getByRole("button", { name: "مرحله بعد" }));

    const technicalStep = screen.getByRole("group", { name: /مشخصات فنی/ });
    expect(getProgressStatus()).toHaveTextContent("مرحله 2 از 4");
    expect(within(technicalStep).getByText("مشخصات فنی").closest("legend")).toHaveFocus();
    await user.type(screen.getByLabelText(/گرید/), "EX5");
    await user.click(screen.getByRole("button", { name: "مرحله قبل" }));

    expect(screen.getByLabelText(/نام ماده یا نوع پلیمر/)).toHaveValue("پلی‌اتیلن");
    expect(screen.getByRole("group", { name: /موضوع درخواست/ }).querySelector("legend")).toHaveFocus();
  });

  it("keeps the single-step contact form concise and submit-ready", () => {
    render(<InquiryForm kind="contact" />);

    expect(getProgressStatus()).toHaveTextContent("مرحله 1 از 1");
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

    expect(getProgressStatus()).toHaveTextContent("مرحله 3 از 3");
    expect(screen.getByRole("button", { name: "ثبت درخواست" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "مرحله بعد" })).not.toBeInTheDocument();
  });

  it("renders the Astryx stepper as an RTL ordered sequence with only completed steps reachable", async () => {
    const user = userEvent.setup();
    const { container } = render(<InquiryForm kind="product" options={[{ id: "product-1", name: "سبد صنعتی" }]} />);

    const steps = screen.getByRole("list", { name: "مراحل فرم درخواست" });
    expect(steps.tagName).toBe("OL");
    expect(within(steps).getAllByRole("listitem")).toHaveLength(3);
    expect(steps.querySelector('[aria-current="step"]')).toHaveTextContent("موضوع درخواست");
    expect(await axe(container)).toHaveNoViolations();

    await user.selectOptions(screen.getByRole("combobox", { name: "محصول" }), "product-1");
    await user.click(screen.getByRole("button", { name: "مرحله بعد" }));
    expect(steps.querySelector('[aria-current="step"]')).toHaveTextContent("مقدار و تحویل");

    const upcoming = within(steps).getByRole("button", { name: /توضیحات تکمیلی/ });
    expect(upcoming).toHaveAttribute("aria-disabled", "true");
    await user.click(upcoming);
    expect(getProgressStatus()).toHaveTextContent("مرحله 2 از 3");

    await user.click(within(steps).getByRole("button", { name: /موضوع درخواست/ }));
    expect(getProgressStatus()).toHaveTextContent("مرحله 1 از 3");
    expect(screen.getByRole("combobox", { name: "محصول" })).toHaveValue("product-1");
  });

  it("omits the stepper for the single-step contact form", () => {
    render(<InquiryForm kind="contact" />);
    expect(screen.queryByRole("list", { name: "مراحل فرم درخواست" })).not.toBeInTheDocument();
  });

  it("submits once from the keyboard and keeps every value after a service failure without retrying", async () => {
    const user = userEvent.setup();
    createInquiry.mockResolvedValue({ error: "ثبت درخواست فعلاً ممکن نیست. کمی بعد دوباره تلاش کنید." });
    render(<InquiryForm kind="product" options={[{ id: "product-1", name: "سبد صنعتی" }]} />);
    await reachProductFinalStep(user);

    screen.getByRole("button", { name: "ثبت درخواست" }).focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("ثبت درخواست فعلاً ممکن نیست.");
    expect(createInquiry).toHaveBeenCalledTimes(1);
    const submitted = createInquiry.mock.calls[0]?.[1];
    expect(submitted).toBeInstanceOf(FormData);
    expect(submitted?.get("kind")).toBe("product");
    expect(submitted?.get("productId")).toBe("product-1");
    expect(submitted?.get("deliveryCity")).toBe("تهران");

    expect(screen.getByLabelText("توضیحات تکمیلی")).toHaveValue("درخواست آزمون");
    expect(screen.getByLabelText("شهر یا محل تحویل")).toHaveValue("تهران");
    expect(screen.getByRole("combobox", { name: "محصول", hidden: true })).toHaveValue("product-1");
    expect(screen.getByRole("button", { name: "ثبت درخواست" })).toBeEnabled();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(createInquiry).toHaveBeenCalledTimes(1);
  });

  it("disables submission while the request is pending", async () => {
    const user = userEvent.setup();
    let resolve: (value: { error?: string }) => void = () => {};
    createInquiry.mockImplementation(() => new Promise((done) => { resolve = done; }));
    render(<InquiryForm kind="contact" />);
    await user.type(screen.getByLabelText(/متن درخواست/), "پیام آزمون");
    await user.click(screen.getByRole("button", { name: "ثبت درخواست" }));

    const pending = await screen.findByRole("button", { name: "در حال ثبت…" });
    expect(pending).toBeDisabled();
    await user.click(pending);
    expect(createInquiry).toHaveBeenCalledTimes(1);
    resolve({ error: "اطلاعات فرم کامل یا معتبر نیست. لطفاً فیلدهای ضروری را بررسی کنید." });
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("اطلاعات فرم کامل یا معتبر نیست."));
    expect(screen.getByLabelText(/متن درخواست/)).toHaveValue("پیام آزمون");
  });
});
