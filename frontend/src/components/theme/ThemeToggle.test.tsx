import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { themeColors, themeStorageKey } from "@/design-system/theme";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = themeColors.light;
    document.head.append(meta);
  });

  afterEach(() => {
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
    vi.restoreAllMocks();
  });

  it("switches immediately, persists the choice and exposes the next action", async () => {
    const user = userEvent.setup();
    const { container } = render(<ThemeToggle />);
    const toggle = await screen.findByRole("button", { name: "فعال‌کردن حالت تاریک" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute("content", themeColors.dark);
    expect(localStorage.getItem(themeStorageKey)).toBe("dark");
    expect(toggle).toHaveAccessibleName("فعال‌کردن حالت روشن");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps DOM switching available when persistence is blocked", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(await screen.findByRole("button", { name: "فعال‌کردن حالت تاریک" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("synchronizes a supported theme from another same-origin tab", async () => {
    render(<ThemeToggle />);
    await screen.findByRole("button", { name: "فعال‌کردن حالت تاریک" });
    window.dispatchEvent(new StorageEvent("storage", { key: themeStorageKey, newValue: "dark" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "dark"));
    expect(screen.getByRole("button", { name: "فعال‌کردن حالت روشن" })).toHaveAttribute("aria-pressed", "true");
  });
});
