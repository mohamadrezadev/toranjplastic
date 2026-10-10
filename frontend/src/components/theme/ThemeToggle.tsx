"use client";

import { useEffect, useState } from "react";
import { applyTheme, isTheme, storeTheme, themeChangeEvent, themeStorageKey, type Theme } from "@/design-system/theme";
import styles from "./ThemeToggle.module.css";

function currentTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : "light";
}

function applyInDocument(theme: Theme) {
  applyTheme(theme, document.documentElement, document.querySelector<HTMLMetaElement>('meta[name="theme-color"]'));
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const syncFromDocument = () => setTheme(currentTheme());
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== themeStorageKey || !isTheme(event.newValue)) return;
      applyInDocument(event.newValue);
      setTheme(event.newValue);
    };
    syncFromDocument();
    window.addEventListener(themeChangeEvent, syncFromDocument);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener(themeChangeEvent, syncFromDocument);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const effectiveTheme = theme ?? "light";
  const nextTheme: Theme = effectiveTheme === "dark" ? "light" : "dark";
  const label = theme === null ? "تغییر پوسته رنگی" : nextTheme === "dark" ? "فعال‌کردن حالت تاریک" : "فعال‌کردن حالت روشن";

  function toggleTheme() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    applyInDocument(next);
    storeTheme(window.localStorage, next);
    setTheme(next);
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  return (
    <button
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      type="button"
      aria-label={label}
      aria-pressed={effectiveTheme === "dark"}
      title={label}
      onClick={toggleTheme}
    >
      <svg className={styles.icon} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {effectiveTheme === "dark" ? <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.64 5.64 7.2 7.2M16.8 16.8l1.56 1.56M18.36 5.64 16.8 7.2M7.2 16.8l-1.56 1.56M16.25 12A4.25 4.25 0 1 1 7.75 12a4.25 4.25 0 0 1 8.5 0Z" /> : <path d="M20.2 15.15A8.5 8.5 0 0 1 8.85 3.8 8.5 8.5 0 1 0 20.2 15.15Z" />}
      </svg>
    </button>
  );
}
