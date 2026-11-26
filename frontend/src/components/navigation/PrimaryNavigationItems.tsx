"use client";

import { SideNavItem } from "@astryxdesign/core/SideNav";
import { TopNavItem } from "@astryxdesign/core/TopNav";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { primaryNavigationRoutes } from "@/design-system/routes";

type Placement = "bar" | "drawer";
type LinksProps = { placement: Placement; onNavigate?: () => void };

function isCurrentRoute(pathname: string | null, path: string) {
  if (!pathname) return false;
  return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
}

function Links({ placement, pathname, onNavigate }: LinksProps & { pathname: string | null }) {
  return <>{primaryNavigationRoutes.map((route) => {
    const isSelected = isCurrentRoute(pathname, route.path);
    return placement === "bar"
      ? <TopNavItem key={route.key} label={route.label} href={route.path} isSelected={isSelected} />
      : <SideNavItem key={route.key} label={route.label} href={route.path} isSelected={isSelected} onClick={onNavigate} />;
  })}</>;
}

function CurrentLinks(props: LinksProps) {
  return <Links {...props} pathname={usePathname()} />;
}

const subscribeToNothing = () => () => {};

/**
 * Primary public destinations. Every link is part of the prerendered shell;
 * the current-page marker is URL data, so it is resolved only after hydration.
 * Reading the pathname during prerendering would block the shared public
 * layout on dynamic `[slug]` routes.
 */
export function PrimaryNavigationItems(props: LinksProps) {
  const isHydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  return isHydrated ? <CurrentLinks {...props} /> : <Links {...props} pathname={null} />;
}
