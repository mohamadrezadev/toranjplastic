// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

const formStatus = vi.hoisted(() => ({ pending: false }));
vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, useFormStatus: () => ({ pending: formStatus.pending, data: null, method: null, action: null }) };
});

import { AuthLayout, SecureLogoutForm } from "@/components/auth";
import LoginPage from "./login/page";
import RegisterPage from "./register/page";

afterEach(() => { formStatus.pending = false; });

describe("authentication pages", () => {
  it("renders an accessible Persian login form and generic error", async () => {
    const { container } = render(await LoginPage({ searchParams: Promise.resolve({ error: "invalid" }) }));
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "ورود به حساب" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "ورود به حساب" })).toBeInTheDocument();
    expect(screen.getByLabelText(/شماره موبایل/)).toHaveAttribute("dir", "ltr");
    expect(screen.getByLabelText(/رمز عبور/)).toHaveAttribute("type", "password");
    expect(screen.getByLabelText(/رمز عبور/)).toBeRequired();
    expect(screen.getByRole("alert")).toHaveTextContent("شماره موبایل یا رمز عبور صحیح نیست.");
    expect(screen.getByRole("alert")).not.toHaveTextContent(/وجود ندارد|غیرفعال|ادمین/);
    expect(screen.getByRole("link", { name: "ثبت‌نام کنید" })).toHaveAttribute("href", "/auth/register");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the requested destination and announces a completed registration", async () => {
    const { container } = render(await LoginPage({ searchParams: Promise.resolve({ registered: "1", next: "/inquiry/product" }) }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: "موفق" })).toHaveTextContent("حساب شما ساخته شد. اکنون وارد شوید.");
    expect(container.querySelector('input[type="hidden"][name="next"]')).toHaveValue("/inquiry/product");
  });

  it("submits login from the keyboard", async () => {
    const user = userEvent.setup();
    render(await LoginPage({ searchParams: Promise.resolve({}) }));
    const form = screen.getByRole("button", { name: "ورود" }).closest("form");
    expect(form).not.toBeNull();
    const submitted = vi.fn((event: SubmitEvent) => event.preventDefault());
    form?.addEventListener("submit", submitted);
    await user.type(screen.getByLabelText(/شماره موبایل/), "09123456789");
    await user.type(screen.getByLabelText(/رمز عبور/), "strong-password{Enter}");
    expect(submitted).toHaveBeenCalledTimes(1);
  });

  it("disables the submit action while the server action is pending", async () => {
    formStatus.pending = true;
    render(await LoginPage({ searchParams: Promise.resolve({}) }));
    const submit = screen.getByRole("button", { name: "در حال ورود…" });
    expect(submit).toBeDisabled();
    expect(screen.queryByRole("button", { name: "ورود" })).not.toBeInTheDocument();
  });

  it("renders registration without a role selector", async () => {
    const { container } = render(await RegisterPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { name: "ایجاد حساب مشتری" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/نقش/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ایجاد حساب" })).toBeEnabled();
    expect(screen.getByLabelText(/ایمیل/)).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("link", { name: "وارد شوید" })).toHaveAttribute("href", "/auth/login");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a generic registration failure", async () => {
    render(await RegisterPage({ searchParams: Promise.resolve({ error: "invalid" }) }));
    expect(screen.getByRole("alert")).toHaveTextContent("امکان ایجاد حساب با اطلاعات واردشده وجود ندارد.");
  });
});

describe("authorization failure and secure logout", () => {
  it("renders the forbidden screen without the brand panel and with a POST logout", async () => {
    const logout = vi.fn(async () => {});
    const { container } = render(<AuthLayout hasShowcase={false} eyebrow="پنل مدیریت" title="دسترسی مجاز نیست" titleId="forbidden-title">
      <SecureLogoutForm action={logout} label="خروج" />
    </AuthLayout>);
    expect(screen.getByRole("heading", { level: 1, name: "دسترسی مجاز نیست" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "معرفی ترنج پلاستیک" })).not.toBeInTheDocument();
    const logoutButton = screen.getByRole("button", { name: "خروج" });
    expect(logoutButton).toHaveAttribute("type", "submit");
    expect(logoutButton.closest("form")).not.toBeNull();
    expect(screen.queryByRole("link", { name: /خروج/ })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("prevents a second logout submission while revocation is pending", () => {
    formStatus.pending = true;
    render(<SecureLogoutForm action={vi.fn(async () => {})} />);
    expect(screen.getByRole("button", { name: "در حال خروج…" })).toBeDisabled();
  });

  it("keeps the showcase landmark and home link on the split layout", async () => {
    render(await RegisterPage({ searchParams: Promise.resolve({}) }));
    const showcase = screen.getByRole("complementary", { name: "معرفی ترنج پلاستیک" });
    expect(within(showcase).getByRole("link", { name: "ترنج پلاستیک — صفحه اصلی" })).toHaveAttribute("href", "/");
    expect(within(showcase).getByRole("link", { name: /بازگشت به صفحهٔ اصلی/ })).toHaveAttribute("href", "/");
  });
});
