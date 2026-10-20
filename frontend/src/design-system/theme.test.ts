import { describe, expect, it, vi } from "vitest";
import { applyTheme, isTheme, readStoredTheme, resolveTheme, storeTheme, themeColors, themeStorageKey } from "./theme";

describe("theme preference foundation", () => {
  it("accepts only supported themes and resolves explicit choice before the system", () => {
    expect(themeColors).toEqual({ light: "#f3f1ec", dark: "#0f1a1c" });
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme("invalid", false)).toBe("light");
  });

  it("fails safely when storage cannot be read or written", () => {
    const blockedStorage = {
      getItem: vi.fn(() => { throw new Error("blocked"); }),
      setItem: vi.fn(() => { throw new Error("blocked"); }),
    };
    expect(readStoredTheme(blockedStorage)).toBeNull();
    expect(storeTheme(blockedStorage, "dark")).toBe(false);
  });

  it("reads, stores and applies a supported theme with browser chrome color", () => {
    const storage = { getItem: vi.fn(() => "dark"), setItem: vi.fn() };
    const meta = document.createElement("meta");
    expect(readStoredTheme(storage)).toBe("dark");
    expect(storeTheme(storage, "light")).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(themeStorageKey, "light");
    applyTheme("dark", document.documentElement, meta);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(meta).toHaveAttribute("content", themeColors.dark);
  });
});
