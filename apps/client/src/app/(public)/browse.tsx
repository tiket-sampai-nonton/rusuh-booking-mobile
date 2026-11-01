/**
 * Public route `/browse` (URL-driven filtered event results) — RBT-031.
 *
 * Routing-only: renders the Browse PageScreen. The screen reads genre/time/sort
 * from the URL query (useLocalSearchParams), filters the catalog client-side,
 * and re-navigates on filter change so the URL stays the single source of truth
 * (deep-linkable + back/forward safe). Reached from Home's Filter modal.
 */
import { BrowseScreen } from "@presentation/screens/Browse";

export default function BrowseRoute() {
  return <BrowseScreen />;
}
