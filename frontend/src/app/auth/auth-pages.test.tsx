// @vitest-environment jsdom
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { AuthStatus } from "./AuthFrame";
import LoginPage from "./login/page";
import RegisterPage from "./register/page";

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}

const renderPage = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

describe("authentication pages", () => {
  it("renders an accessible Persian login form and generic error", async () => {
    const { container } = renderPage(await LoginPage({ searchParams: Promise.resolve({ error: "invalid" }) }));
    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "ورود به حساب" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "ورود به حساب" })).toBeInTheDocument();
    expect(screen.getByLabelText(/شماره موبایل/)).toHaveAttribute("dir", "ltr");
    expect(screen.getByLabelText(/رمز عبور/)).toHaveAttribute("type", "password");
    expect(screen.getByRole("alert")).toHaveTextContent("شماره موبایل یا رمز عبور صحیح نیست.");
    expect(screen.getByRole("alert")).not.toHaveTextContent(/وجود ندارد|غیرفعال|ادمین/);
    expect(screen.getByRole("link", { name: "ثبت‌نام کنید" })).toHaveAttribute("href", "/auth/register");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("announces a created account politely and keeps the next destination hidden", async () => {
    const { container } = renderPage(await LoginPage({ searchParams: Promise.resolve({ registered: "1", next: "/account" }) }));
    expect(screen.getByRole("status", { name: "موفق" })).toHaveTextContent("حساب شما ساخته شد. اکنون وارد شوید.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="hidden"][name="next"]')).toHaveValue("/account");
  });

  it("renders registration without a role selector", async () => {
    const { container } = renderPage(await RegisterPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 1, name: "ایجاد حساب مشتری" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/نقش/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ایجاد حساب" })).toBeEnabled();
    expect(screen.getByLabelText(/ایمیل/)).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("link", { name: "وارد شوید" })).toHaveAttribute("href", "/auth/login");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("states a registration failure without revealing why", async () => {
    renderPage(await RegisterPage({ searchParams: Promise.resolve({ error: "invalid" }) }));
    expect(screen.getByRole("alert")).toHaveTextContent("امکان ایجاد حساب با اطلاعات واردشده وجود ندارد.");
  });
});

describe("authorization status screen", () => {
  it("names the failure as the page heading and offers the logout action", async () => {
    const { container } = renderPage(
      <AuthStatus title="دسترسی مجاز نیست" actions={<form action="/auth/logout"><button type="submit">خروج</button></form>}>
        این حساب مجوز ورود به پنل مدیریت را ندارد.
      </AuthStatus>,
    );
    expect(container.querySelectorAll("main")).toHaveLength(1);
    const region = screen.getByRole("region", { name: "دسترسی مجاز نیست" });
    expect(within(region).getByRole("heading", { level: 1 })).toHaveTextContent("دسترسی مجاز نیست");
    expect(within(region).getByText("این حساب مجوز ورود به پنل مدیریت را ندارد.")).toBeInTheDocument();
    expect(within(region).getByRole("button", { name: "خروج" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
