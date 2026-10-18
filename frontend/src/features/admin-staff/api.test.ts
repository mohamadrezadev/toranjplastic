// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { protectedHeadersMock } = vi.hoisted(() => ({
  protectedHeadersMock: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ protectedHeaders: protectedHeadersMock }));

import {
  changeStaffRole,
  changeStaffStatus,
  createStaff,
  getStaff,
  isStaffAccount,
  listStaff,
  StaffApiError,
} from "./api";

const staff = {
  id: "staff/1",
  mobile: "+989121111111",
  displayName: "کارشناس فروش",
  role: "SALES",
  status: "ACTIVE",
  version: 2,
  createdAt: "2026-10-15T00:00:00.000Z",
  updatedAt: "2026-10-16T00:00:00.000Z",
  lastLoginAt: null,
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

describe("admin staff API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    protectedHeadersMock.mockResolvedValue({ cookie: "toranj_session=s1" });
  });

  it.each([
    null,
    "invalid",
    { ...staff, id: 1 },
    { ...staff, mobile: 1 },
    { ...staff, displayName: 1 },
    { ...staff, role: "CUSTOMER" },
    { ...staff, status: "DELETED" },
    { ...staff, version: 1.5 },
    { ...staff, createdAt: 1 },
    { ...staff, updatedAt: 1 },
    { ...staff, lastLoginAt: 1 },
  ])("rejects an invalid staff payload %#", (value) => {
    expect(isStaffAccount(value)).toBe(false);
  });

  it("accepts all bounded staff variants", () => {
    expect(isStaffAccount(staff)).toBe(true);
    expect(isStaffAccount({ ...staff, role: "ADMIN", status: "SUSPENDED", lastLoginAt: staff.createdAt })).toBe(true);
    expect(isStaffAccount({ ...staff, role: "OPERATOR", status: "DISABLED" })).toBe(true);
  });

  it("lists staff with bounded filters and validates pagination", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ items: [staff], page: 2, pageSize: 10, total: 1, pageCount: 1 }),
    );
    await expect(
      listStaff({ page: 2, pageSize: 10, role: "SALES", status: "ACTIVE" }),
    ).resolves.toMatchObject({ items: [staff], page: 2 });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("page=2&pageSize=10&role=SALES&status=ACTIVE"),
      expect.objectContaining({ cache: "no-store" }),
    );

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ items: [staff], page: "1", pageSize: 20, total: 1, pageCount: 1 }),
    );
    await expect(listStaff()).rejects.toMatchObject({ status: 502 });
  });

  it("reads one staff account and rejects malformed success payloads", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(staff))
      .mockResolvedValueOnce(jsonResponse({ nope: true }));
    await expect(getStaff("staff/1")).resolves.toEqual(staff);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/staff%2F1"),
      expect.any(Object),
    );
    await expect(getStaff("missing")).rejects.toMatchObject({ status: 502 });
  });

  it("sends CSRF-protected create, role, and status mutations", async () => {
    protectedHeadersMock.mockResolvedValue({
      cookie: "toranj_session=s1",
      origin: "http://localhost:3000",
      "x-csrf-token": "csrf",
    });
    vi.mocked(fetch).mockImplementation(async () => jsonResponse(staff));

    await createStaff({
      mobile: "09121111111",
      displayName: "کارشناس فروش",
      password: "strong-password",
      role: "SALES",
    });
    await changeStaffRole("staff/1", "OPERATOR", 2);
    await changeStaffStatus("staff/1", "DISABLED", 3);

    expect(protectedHeadersMock).toHaveBeenCalledTimes(3);
    expect(protectedHeadersMock).toHaveBeenCalledWith(true);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/admin\/staff$/),
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/staff%2F1/role"),
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("/staff%2F1/status"),
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it.each([
    [403, undefined, "forbidden"],
    [409, undefined, "conflict"],
    [400, undefined, "validation"],
    [500, undefined, "failed"],
    [409, { code: "STAFF_VERSION_CONFLICT" }, "STAFF_VERSION_CONFLICT"],
  ])("maps API failure %s to a stable code", async (status, body, code) => {
    vi.mocked(fetch).mockResolvedValue(
      body === undefined
        ? new Response("not-json", { status })
        : jsonResponse(body, status),
    );
    await expect(getStaff("staff-1")).rejects.toEqual(
      expect.objectContaining<Partial<StaffApiError>>({ status, code }),
    );
  });
});
