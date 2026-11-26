"use client";

import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import Link from "next/link";
import { startTransition, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import {
  applyTheme,
  isTheme,
  readStoredTheme,
  resolveTheme,
  themeChangeEvent,
  themeStorageKey,
  type Theme as ToranjTheme,
} from "@/design-system/theme";

type AstryxMode = ToranjTheme | "system";

/**
 * React reveals streamed Suspense boundaries in batches that are throttled to
 * 300 ms, so content can still be waiting for its reveal shortly after `load`.
 * The first concrete Astryx mode is published only after that window.
 */
const STREAMED_REVEAL_SETTLE_MS = 500;

/** The theme the pre-paint resolver (or a later Toranj change) put on `<html>`. */
function readDocumentTheme(): ToranjTheme | null {
  if (typeof document === "undefined") return null;
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : null;
}

/** Same resolution as the pre-paint script: stored preference first, then the system preference. */
function resolvePreferredTheme(): ToranjTheme {
  let storedTheme: ToranjTheme | null = null;
  let prefersDark = false;
  try {
    storedTheme = readStoredTheme(window.localStorage);
  } catch {
    // Storage can be unavailable; the system preference still applies.
  }
  try {
    prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    // matchMedia can be unavailable; light is the documented default.
  }
  return resolveTheme(storedTheme, prefersDark);
}

function applyDocumentTheme(theme: ToranjTheme) {
  applyTheme(theme, document.documentElement, document.querySelector<HTMLMetaElement>('meta[name="theme-color"]'));
}

/**
 * The single client boundary that connects Astryx to the Toranj document.
 *
 * `<html data-theme>` stays owned by Toranj's pre-paint resolver and theme
 * control. Astryx receives that resolved value as its mode, never the other
 * way around:
 *
 * - The server and the hydration render use `mode="system"`, the only value
 *   that is known on both sides. Astryx's root Theme clears `<html data-theme>`
 *   in that mode, so the attribute is restored in the same commit, before paint.
 * - The concrete mode is published after the streamed document has settled and
 *   inside a transition. A context update that reaches a Suspense boundary
 *   whose server content has not been revealed yet makes React discard that
 *   content and render it again on the client.
 */
export function AstryxProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AstryxMode>("system");
  // Read during the first client render, before Astryx's root Theme can clear it.
  const [bootTheme] = useState(readDocumentTheme);

  useLayoutEffect(() => {
    if (readDocumentTheme() === null) applyDocumentTheme(bootTheme ?? resolvePreferredTheme());
  }, [bootTheme]);

  useEffect(() => {
    let isSettled = false;
    let settleTimer: number | undefined;
    let settleFrame: number | undefined;
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

    const publishMode = () => setMode(readDocumentTheme() ?? resolvePreferredTheme());
    const settle = () => {
      isSettled = true;
      startTransition(publishMode);
    };
    // The animation frame keeps this behind reveals React queued for the next
    // paint, and paused together with them while the tab is in the background.
    const scheduleSettle = () => {
      settleTimer = window.setTimeout(() => { settleFrame = window.requestAnimationFrame(settle); }, STREAMED_REVEAL_SETTLE_MS);
    };

    // Before the first publish only the document changes; `settle` reads it.
    const syncFromDocument = () => { if (isSettled) publishMode(); };
    const syncFromPreference = () => {
      applyDocumentTheme(resolvePreferredTheme());
      syncFromDocument();
    };
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === themeStorageKey) syncFromPreference();
    };

    if (document.readyState === "complete") scheduleSettle();
    else window.addEventListener("load", scheduleSettle, { once: true });
    window.addEventListener(themeChangeEvent, syncFromDocument);
    window.addEventListener("storage", syncFromStorage);
    colorScheme.addEventListener("change", syncFromPreference);

    return () => {
      window.removeEventListener("load", scheduleSettle);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      if (settleFrame !== undefined) window.cancelAnimationFrame(settleFrame);
      window.removeEventListener(themeChangeEvent, syncFromDocument);
      window.removeEventListener("storage", syncFromStorage);
      colorScheme.removeEventListener("change", syncFromPreference);
    };
  }, []);

  return (
    <Theme theme={neutralTheme} mode={mode}>
      <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </InternationalizationProvider>
    </Theme>
  );
}
