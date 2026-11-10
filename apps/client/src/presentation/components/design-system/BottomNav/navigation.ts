import type { Href, Router } from "expo-router";

import type { BottomNavRoute } from "./types";

const ROUTE_HREF: Record<BottomNavRoute, Href> = {
  home: "/" as Href,
  browse: "/browse" as Href,
  tickets: "/my-tickets" as Href,
  profile: "/profile" as Href,
};

/**
 * Keep bottom-navigation destinations from accumulating duplicate stack screens.
 * Home pushes the first tab destination so Back can return Home; other tabs
 * dismiss to an existing destination or replace the current route if absent.
 */
export function navigateBottomTab(
  router: Pick<Router, "push" | "dismissTo">,
  currentRoute: BottomNavRoute | null,
  nextRoute: BottomNavRoute,
): void {
  if (currentRoute === nextRoute) return;

  const href = ROUTE_HREF[nextRoute];
  if (currentRoute === "home") {
    router.push(href);
    return;
  }

  router.dismissTo(href);
}
