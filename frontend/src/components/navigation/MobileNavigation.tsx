"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { inquiryRoute, primaryNavigationRoutes } from "@/design-system/routes";
import { ThemeToggle } from "@/components/theme";
import { ActionLink } from "./ActionLink";
import styles from "./Navigation.module.css";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const background = Array.from(document.querySelectorAll<HTMLElement>("[data-shell-inert]"));
    const trigger = triggerRef.current;
    background.forEach((element) => element.setAttribute("inert", ""));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>("button, a[href]"));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      background.forEach((element) => element.removeAttribute("inert"));
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return <div className={styles.mobileRoot}>
    <button ref={triggerRef} className={styles.menuTrigger} type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label="بازکردن فهرست" onClick={() => setOpen(true)}>
      <svg className={styles.menuIcon} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
    {open ? <>
      <div className={styles.backdrop} aria-hidden="true" onClick={() => setOpen(false)} />
      <div ref={drawerRef} className={styles.drawer} id="mobile-navigation" role="dialog" aria-modal="true" aria-label="فهرست اصلی">
        <div className={styles.drawerHeader}>
          <div className={styles.drawerBrand}>
            <span className={styles.brandSymbol} aria-hidden="true" />
            <strong>منوی دسترسی</strong>
          </div>
          <button className={styles.closeButton} type="button" aria-label="بستن فهرست" onClick={() => setOpen(false)}>
            <svg className={styles.menuIcon} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className={styles.drawerNav} aria-label="ناوبری موبایل"><ul className={styles.navList}>{primaryNavigationRoutes.map((route) => <li key={route.key}><Link className={styles.navLink} href={route.path} onClick={() => setOpen(false)}>{route.label}</Link></li>)}</ul></nav>
        <div className={styles.drawerTheme}><span>پوسته نمایش</span><ThemeToggle /></div>
        <div className={styles.drawerActions}><ActionLink href={inquiryRoute.path} emphasis="primary">{inquiryRoute.label}</ActionLink><Link className={styles.action} href="/account" onClick={() => setOpen(false)}>حساب من</Link></div>
      </div>
    </> : null}
  </div>;
}
