import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock, registerAccountMock, loginAccountMock, logoutAccountMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  }),
  registerAccountMock: vi.fn(),
  loginAccountMock: vi.fn(),
  logoutAccountMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/auth", () => ({
  loginAccount: loginAccountMock,
  logoutAccount: logoutAccountMock,
  registerAccount: registerAccountMock,
}));

import { loginAction, logoutAction, registerAction } from "./actions";

function registrationForm(optional: { email?: string; companyName?: string } = {}) {
  const form = new FormData();
  form.set("displayName", "  مشتری آزمایشی  ");
  form.set("mobile", " 09123456789 ");
  form.set("password", "strong-password");
  form.set("email", optional.email ?? "");
  form.set("companyName", optional.companyName ?? "");
  return form;
}

describe("registerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerAccountMock.mockResolvedValue(new Response(null, { status: 201 }));
  });

  it("omits blank optional fields from the registration payload", async () => {
    await expect(registerAction(registrationForm({ email: "   ", companyName: "   " }))).rejects.toThrow("REDIRECT:/auth/login?registered=1");

    expect(registerAccountMock).toHaveBeenCalledWith({
      displayName: "مشتری آزمایشی",
      mobile: "09123456789",
      password: "strong-password",
    });
  });

  it("preserves trimmed non-empty optional fields", async () => {
    await expect(registerAction(registrationForm({ email: " customer@example.com ", companyName: " شرکت نمونه " }))).rejects.toThrow("REDIRECT:/auth/login?registered=1");

    expect(registerAccountMock).toHaveBeenCalledWith({
      displayName: "مشتری آزمایشی",
      mobile: "09123456789",
      password: "strong-password",
      email: "customer@example.com",
      companyName: "شرکت نمونه",
    });
  });

  it("redirects a failed registration without leaking response details", async () => {
    registerAccountMock.mockResolvedValue(new Response(null, { status: 409 }));
    await expect(registerAction(registrationForm())).rejects.toThrow(
      "REDIRECT:/auth/register?error=invalid",
    );
  });
});

describe("loginAction and logoutAction", () => {
  beforeEach(() => vi.clearAllMocks());

  const loginForm = (next = "") => {
    const form = new FormData();
    form.set("mobile", " 09123456789 ");
    form.set("password", " strong-password ");
    form.set("next", next);
    return form;
  };

  it.each([
    ["ADMIN", "/admin"],
    ["SALES", "/admin"],
    ["OPERATOR", "/admin"],
    ["CUSTOMER", "/account"],
  ])("routes %s to its default portal", async (role, destination) => {
    loginAccountMock.mockResolvedValue(
      new Response(JSON.stringify({ role }), { status: 200 }),
    );
    await expect(loginAction(loginForm())).rejects.toThrow(
      `REDIRECT:${destination}`,
    );
  });

  it("accepts only a local next path and handles malformed or denied login", async () => {
    loginAccountMock
      .mockResolvedValueOnce(new Response("not-json", { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ role: "ADMIN" }), { status: 200 }));
    await expect(loginAction(loginForm("//attacker.example"))).rejects.toThrow(
      "REDIRECT:/account",
    );
    await expect(loginAction(loginForm())).rejects.toThrow(
      "REDIRECT:/auth/login?error=invalid",
    );
    await expect(loginAction(loginForm("/admin/staff"))).rejects.toThrow(
      "REDIRECT:/admin/staff",
    );
  });

  it("logs out before redirecting to login", async () => {
    logoutAccountMock.mockResolvedValue(true);
    await expect(logoutAction()).rejects.toThrow("REDIRECT:/auth/login");
    expect(logoutAccountMock).toHaveBeenCalledOnce();
  });
});
