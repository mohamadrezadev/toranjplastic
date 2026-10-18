// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock, createMock, roleMock, statusMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  }),
  createMock: vi.fn(),
  roleMock: vi.fn(),
  statusMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("./api", () => ({
  StaffApiError: class StaffApiError extends Error {
    constructor(public status: number, public code = "failed") {
      super("Staff API error");
    }
  },
  createStaff: createMock,
  changeStaffRole: roleMock,
  changeStaffStatus: statusMock,
}));

import {
  changeStaffRoleAction,
  changeStaffStatusAction,
  createStaffAction,
} from "./actions";
import { StaffApiError } from "./api";

describe("admin staff actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a staff account without repopulating secrets", async () => {
    createMock.mockResolvedValue({});
    const form = new FormData();
    form.set("mobile", "09121111111");
    form.set("displayName", "کارشناس فروش");
    form.set("password", "strong-password");
    form.set("role", "SALES");
    await expect(createStaffAction(form)).rejects.toThrow(
      "REDIRECT:/admin/staff?success=created",
    );
    expect(createMock).toHaveBeenCalledWith({
      mobile: "09121111111",
      displayName: "کارشناس فروش",
      password: "strong-password",
      role: "SALES",
    });
  });

  it("redirects create failures with only a stable encoded code", async () => {
    createMock.mockRejectedValue(new StaffApiError(409, "STAFF ACCOUNT"));
    await expect(createStaffAction(new FormData())).rejects.toThrow(
      "REDIRECT:/admin/staff/new?error=STAFF%20ACCOUNT",
    );
    createMock.mockRejectedValue(new Error("sensitive detail"));
    await expect(createStaffAction(new FormData())).rejects.toThrow(
      "REDIRECT:/admin/staff/new?error=failed",
    );
  });

  it("submits versioned role and status changes", async () => {
    roleMock.mockResolvedValue({});
    statusMock.mockResolvedValue({});
    const role = new FormData();
    role.set("role", "OPERATOR");
    role.set("expectedVersion", "2");
    const status = new FormData();
    status.set("status", "DISABLED");
    status.set("expectedVersion", "3");

    await expect(changeStaffRoleAction("staff/1", role)).rejects.toThrow(
      "REDIRECT:/admin/staff/staff/1?success=role",
    );
    await expect(changeStaffStatusAction("staff/1", status)).rejects.toThrow(
      "REDIRECT:/admin/staff/staff/1?success=status",
    );
    expect(roleMock).toHaveBeenCalledWith("staff/1", "OPERATOR", 2);
    expect(statusMock).toHaveBeenCalledWith("staff/1", "DISABLED", 3);
  });

  it("maps role and status mutation failures", async () => {
    roleMock.mockRejectedValue(new StaffApiError(409, "STAFF_VERSION_CONFLICT"));
    statusMock.mockRejectedValue(new Error("private"));
    await expect(changeStaffRoleAction("s1", new FormData())).rejects.toThrow(
      "REDIRECT:/admin/staff/s1?error=STAFF_VERSION_CONFLICT",
    );
    await expect(changeStaffStatusAction("s1", new FormData())).rejects.toThrow(
      "REDIRECT:/admin/staff/s1?error=failed",
    );
  });
});
