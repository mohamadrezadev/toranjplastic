// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: cookiesMock }));

import {
  cookieHeader,
  getAccountAccess,
  getAdminAccess,
  hasCapability,
  loginAccount,
  logoutAccount,
  protectedHeaders,
  registerAccount,
  type AuthAccount,
} from "./auth";

const account: AuthAccount = {
  id: "u1",
  mobile: "+989121111111",
  displayName: "کاربر تست",
  email: null,
  companyName: null,
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: "2026-10-17T00:00:00.000Z",
  lastLoginAt: null,
  capabilities: ["MANAGEMENT_ACCESS", "STAFF_MANAGEMENT"],
};

function cookieJar(values: Record<string, string> = {}) {
  return {
    getAll: vi.fn(() =>
      Object.entries(values).map(([name, value]) => ({ name, value })),
    ),
    get: vi.fn((name: string) =>
      values[name] === undefined ? undefined : { name, value: values[name] },
    ),
    set: vi.fn(),
    delete: vi.fn(),
  };
}

function response(status: number, body?: unknown, setCookies?: string[]) {
  const headers = new Headers();
  if (setCookies === undefined) headers.set("x-test", "true");
  const result = new Response(
    body === undefined ? null : JSON.stringify(body),
    { status, headers },
  );
  if (setCookies)
    Object.defineProperty(result.headers, "getSetCookie", {
      value: () => setCookies,
    });
  return result;
}

describe("server auth transport", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("checks bounded capabilities", () => {
    expect(hasCapability(account, "STAFF_MANAGEMENT")).toBe(true);
    expect(hasCapability(account, "CONTENT_MANAGEMENT")).toBe(false);
  });

  it("serializes server cookies with encoded values", async () => {
    cookiesMock.mockResolvedValue(
      cookieJar({ toranj_session: "a b", toranj_csrf: "c/d" }),
    );
    await expect(cookieHeader()).resolves.toBe(
      "toranj_session=a%20b; toranj_csrf=c%2Fd",
    );
  });

  it("sends registration and password login through the configured backend", async () => {
    const jar = cookieJar();
    cookiesMock.mockResolvedValue(jar);
    vi.mocked(fetch)
      .mockResolvedValueOnce(response(201))
      .mockResolvedValueOnce(response(401));
    await registerAccount({
      mobile: "09121111111",
      password: "strong-password",
    });
    await loginAccount({ mobile: "09121111111", password: "wrong-password" });
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://127.0.0.1:3001/api/v1/auth/register",
      expect.objectContaining({ method: "POST", cache: "no-store" }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://127.0.0.1:3001/api/v1/auth/login/password",
      expect.objectContaining({ method: "POST" }),
    );
    expect(jar.set).not.toHaveBeenCalled();
  });

  it("stores bounded cookies from a successful login", async () => {
    const jar = cookieJar();
    cookiesMock.mockResolvedValue(jar);
    vi.mocked(fetch).mockResolvedValue(
      response(200, undefined, [
        "toranj_session=session-value; Path=/; HttpOnly; Max-Age=0",
        "toranj_csrf=csrf-value; Path=/",
        "malformed-cookie",
      ]),
    );
    await loginAccount({ mobile: "09121111111", password: "strong-password" });
    expect(jar.set).toHaveBeenCalledWith(
      "toranj_session",
      "session-value",
      expect.objectContaining({ httpOnly: true, maxAge: 0 }),
    );
    expect(jar.set).toHaveBeenCalledWith(
      "toranj_csrf",
      "csrf-value",
      expect.objectContaining({ httpOnly: false, maxAge: undefined }),
    );
    expect(jar.set).toHaveBeenCalledTimes(2);
  });

  it.each([
    null,
    "invalid",
    { ...account, id: 1 },
    { ...account, mobile: 1 },
    { ...account, displayName: 1 },
    { ...account, role: "OWNER" },
    { ...account, status: "DELETED" },
    { ...account, capabilities: "STAFF_MANAGEMENT" },
    { ...account, capabilities: ["UNBOUNDED"] },
  ])("rejects invalid account payload %#", async (payload) => {
    const jar = cookieJar();
    cookiesMock.mockResolvedValue(jar);
    vi.mocked(fetch).mockResolvedValue(response(200, { account: payload }));
    await expect(getAdminAccess()).resolves.toEqual({ status: 502 });
  });

  it("handles denied, malformed, and valid admin access responses", async () => {
    cookiesMock.mockResolvedValue(cookieJar());
    vi.mocked(fetch)
      .mockResolvedValueOnce(response(403))
      .mockResolvedValueOnce(response(200, null))
      .mockResolvedValueOnce(response(200, {}))
      .mockResolvedValueOnce(response(200, { account }));
    await expect(getAdminAccess()).resolves.toEqual({ status: 403 });
    await expect(getAdminAccess()).resolves.toEqual({ status: 502 });
    await expect(getAdminAccess()).resolves.toEqual({ status: 502 });
    await expect(getAdminAccess()).resolves.toEqual({ status: 200, account });
  });

  it("handles denied, malformed, and valid account access responses", async () => {
    cookiesMock.mockResolvedValue(cookieJar());
    vi.mocked(fetch)
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200, { nope: true }))
      .mockResolvedValueOnce(response(200, account));
    await expect(getAccountAccess()).resolves.toEqual({ status: 401 });
    await expect(getAccountAccess()).resolves.toEqual({ status: 502 });
    await expect(getAccountAccess()).resolves.toEqual({ status: 200, account });
  });

  it("builds read and mutation headers with optional CSRF", async () => {
    cookiesMock.mockResolvedValue(
      cookieJar({ toranj_session: "s1", toranj_csrf: "csrf" }),
    );
    await expect(protectedHeaders()).resolves.toEqual({
      cookie: "toranj_session=s1; toranj_csrf=csrf",
    });
    await expect(protectedHeaders(true)).resolves.toEqual({
      cookie: "toranj_session=s1; toranj_csrf=csrf",
      origin: "http://localhost:3000",
      "x-csrf-token": "csrf",
    });
    cookiesMock.mockResolvedValue(cookieJar());
    await expect(protectedHeaders(true)).resolves.toMatchObject({
      "x-csrf-token": "",
    });
  });

  it("logs out, consumes fallback Set-Cookie, and clears the local jar", async () => {
    const jar = cookieJar({ toranj_session: "s1", toranj_csrf: "csrf" });
    cookiesMock.mockResolvedValue(jar);
    const logoutResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue("toranj_session=; Max-Age=0; Path=/"),
      },
    } as unknown as Response;
    vi.mocked(fetch).mockResolvedValue(logoutResponse);
    await expect(logoutAccount()).resolves.toBe(true);
    expect(jar.set).toHaveBeenCalledWith(
      "toranj_session",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
    expect(jar.delete).toHaveBeenCalledWith("toranj_session");
    expect(jar.delete).toHaveBeenCalledWith("toranj_csrf");
  });

  it("returns false for a failed logout without response cookies", async () => {
    const jar = cookieJar();
    cookiesMock.mockResolvedValue(jar);
    const logoutResponse = {
      ok: false,
      headers: { get: vi.fn().mockReturnValue(null) },
    } as unknown as Response;
    vi.mocked(fetch).mockResolvedValue(logoutResponse);
    await expect(logoutAccount()).resolves.toBe(false);
  });
});
