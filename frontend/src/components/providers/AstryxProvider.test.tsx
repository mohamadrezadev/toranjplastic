import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { themeChangeEvent, themeColors, themeStorageKey } from "@/design-system/theme";
import { TextInput } from "@astryxdesign/core/TextInput";
import { AstryxProvider } from "./AstryxProvider";

// The concrete Astryx mode is published only after the streamed document has
// settled (see AstryxProvider), so these assertions wait past that delay.
const afterSettle = { timeout: 3000 };

function astryxWrapper(container: HTMLElement) {
  const wrapper = container.querySelector<HTMLElement>('[data-astryx-theme="neutral"]');
  if (!wrapper) throw new Error("Astryx theme wrapper is missing");
  return wrapper;
}

describe("AstryxProvider", () => {
  let prefersDark = false;

  beforeEach(() => {
    prefersDark = false;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: prefersDark,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    localStorage.clear();
    document.documentElement.dataset.theme = "light";
  });

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.astryxTheme;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
  });

  it("uses the existing persisted Toranj preference for the Astryx mode", async () => {
    localStorage.setItem(themeStorageKey, "dark");
    document.documentElement.dataset.theme = "dark";

    const { container } = render(
      <AstryxProvider>
        <p>محتوای آزمایشی</p>
      </AstryxProvider>,
    );

    expect(screen.getByText("محتوای آزمایشی")).toBeInTheDocument();
    await waitFor(() => expect(astryxWrapper(container)).toHaveAttribute("data-theme", "dark"), afterSettle);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("data-astryx-theme", "neutral");
  });

  it("keeps the pre-paint document theme and defers the concrete mode past hydration", async () => {
    // The pre-paint resolver chose dark although the system preference is light.
    localStorage.setItem(themeStorageKey, "dark");
    document.documentElement.dataset.theme = "dark";

    const { container } = render(
      <AstryxProvider>
        <p>محتوای آزمایشی</p>
      </AstryxProvider>,
    );

    // Astryx starts in "system" mode, which clears <html data-theme>; the
    // provider restores Toranj's value in the same commit and does not publish
    // a context update while streamed content may still be hydrating.
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(astryxWrapper(container)).not.toHaveAttribute("data-theme");

    await waitFor(() => expect(astryxWrapper(container)).toHaveAttribute("data-theme", "dark"), afterSettle);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("follows the existing same-tab theme event without creating another preference", async () => {
    const { container } = render(
      <AstryxProvider>
        <p>محتوای آزمایشی</p>
      </AstryxProvider>,
    );

    document.documentElement.dataset.theme = "dark";
    act(() => window.dispatchEvent(new Event(themeChangeEvent)));

    await waitFor(() => expect(astryxWrapper(container)).toHaveAttribute("data-theme", "dark"), afterSettle);
    expect(localStorage.getItem(themeStorageKey)).toBeNull();

    // After the first publish, later changes are followed immediately.
    document.documentElement.dataset.theme = "light";
    act(() => window.dispatchEvent(new Event(themeChangeEvent)));
    expect(astryxWrapper(container)).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("applies a preference stored by another tab to the document", async () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = themeColors.light;
    document.head.append(meta);

    const { container } = render(
      <AstryxProvider>
        <p>محتوای آزمایشی</p>
      </AstryxProvider>,
    );
    await waitFor(() => expect(astryxWrapper(container)).toHaveAttribute("data-theme", "light"), afterSettle);

    localStorage.setItem(themeStorageKey, "dark");
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: themeStorageKey, newValue: "dark" })));

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(meta).toHaveAttribute("content", themeColors.dark);
    expect(astryxWrapper(container)).toHaveAttribute("data-theme", "dark");
  });

  it("supplies Persian component messages instead of the English fallback", () => {
    render(
      <AstryxProvider>
        <TextInput label="نام" value="" onChange={() => undefined} isRequired />
      </AstryxProvider>,
    );

    expect(screen.getByRole("textbox", { name: "نامالزامی" })).toBeRequired();
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });
});
