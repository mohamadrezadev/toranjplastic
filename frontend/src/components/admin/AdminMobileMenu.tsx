"use client";

import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./AdminPortalShell.module.css";

/*
 * Phone/tablet menu of the admin shell (task 8.1). It stays a native <details>
 * disclosure (works without script; the summary is the toggle button) and
 * gains the behaviour a menu needs: it closes on Escape (focus returns to the
 * summary), on a click outside it, and after navigating to another route.
 */
export function AdminMobileMenu({ displayName, roleLabel, children }: { displayName: string; roleLabel: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const root = useRef<HTMLDetailsElement>(null);

  // Close after a navigation: adjust state while rendering when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setOpen(false); }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      root.current?.querySelector("summary")?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <details ref={root} className={styles.mobileMenu} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>
        <span className={styles.avatar} aria-hidden="true"><Avatar name={displayName} alt="" size="sm" tooltip={false} /></span>
        <Text as="span" weight="bold" color="inherit" className={styles.mobileAccount}>{displayName}</Text>
        <Text as="span" type="supporting" color="secondary" className={styles.menuLabel}>منو</Text>
        <span className={styles.menuIcon} aria-hidden="true" />
      </summary>
      <div className={styles.mobilePanel}>
        <div className={styles.mobilePanelHeading}>
          <Text as="span" weight="bold" color="inherit" className={styles.accountName}>{displayName}</Text>
          <Text as="span" type="supporting" color="secondary">{roleLabel}</Text>
        </div>
        {children}
      </div>
    </details>
  );
}
