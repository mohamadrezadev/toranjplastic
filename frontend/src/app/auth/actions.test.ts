import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock, registerAccountMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  }),
  registerAccountMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/auth", () => ({
  loginAccount: vi.fn(),
  logoutAccount: vi.fn(),
  registerAccount: registerAccountMock,
}));

import { registerAction } from "./actions";

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
});
