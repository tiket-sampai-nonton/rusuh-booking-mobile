import type { Href, Router } from "expo-router";

import type { BottomNavRoute } from "./types";

const ROUTE_HREF: Record<BottomNavRoute, Href> = {
  home: "/" as Href,
  browse: "/browse" as Href,
  tickets: "/my-tickets" as Href,
  profile: "/profile" as Href,
};

/**
 * Switch between public destinations without rebuilding the Home/Browse tabs.
 * Routes outside the tab navigator (tickets/profile) are opened by the public
 * stack; returning to a tab focuses its existing route when it is present.
 */
export function navigateBottomTab(
  router: Pick<Router, "navigate">,
  currentRoute: BottomNavRoute | null,
  nextRoute: BottomNavRoute,
): void {
  if (currentRoute === nextRoute) return;

  const href = ROUTE_HREF[nextRoute];
  router.navigate(href);
}
