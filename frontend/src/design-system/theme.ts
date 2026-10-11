export const themeStorageKey = "toranj-theme";
export const themeChangeEvent = "toranj-theme-change";

export const themeColors = {
  light: "#f4f2eb",
  dark: "#111b18",
} as const;

export type Theme = keyof typeof themeColors;

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function resolveTheme(storedTheme: unknown, prefersDark: boolean): Theme {
  return isTheme(storedTheme) ? storedTheme : prefersDark ? "dark" : "light";
}

export function readStoredTheme(storage: Pick<Storage, "getItem">): Theme | null {
  try {
    const value = storage.getItem(themeStorageKey);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeTheme(storage: Pick<Storage, "setItem">, theme: Theme): boolean {
  try {
    storage.setItem(themeStorageKey, theme);
    return true;
  } catch {
    return false;
  }
}

export function applyTheme(theme: Theme, root: HTMLElement, themeColor?: HTMLMetaElement | null) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  themeColor?.setAttribute("content", themeColors[theme]);
}

export const themeBootstrapScript = `(() => {
  const key = ${JSON.stringify(themeStorageKey)};
  const colors = ${JSON.stringify(themeColors)};
  let saved = null;
  try {
    const value = localStorage.getItem(key);
    if (value === "light" || value === "dark") saved = value;
  } catch {}
  let prefersDark = false;
  try { prefersDark = matchMedia("(prefers-color-scheme: dark)").matches; } catch {}
  const theme = saved || (prefersDark ? "dark" : "light");
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.append(meta);
  }
  meta.setAttribute("content", colors[theme]);
})();`;
