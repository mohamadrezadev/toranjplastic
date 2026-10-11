// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoginPage from "./login/page";
import RegisterPage from "./register/page";

describe("authentication pages", () => {
  it("renders an accessible Persian login form and generic error", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ error: "invalid" }) }));
    expect(screen.getByRole("heading", { name: "ورود به حساب" })).toBeInTheDocument();
    expect(screen.getByLabelText(/شماره موبایل/)).toHaveAttribute("dir", "ltr");
    expect(screen.getByLabelText(/رمز عبور/)).toHaveAttribute("type", "password");
    expect(screen.getByRole("alert")).not.toHaveTextContent(/وجود ندارد|غیرفعال|ادمین/);
  });

  it("renders registration without a role selector", async () => {
    render(await RegisterPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { name: "ایجاد حساب مشتری" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/نقش/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ایجاد حساب" })).toBeEnabled();
  });
});
