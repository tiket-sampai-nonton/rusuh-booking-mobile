/**
 * Public route `/browse` (URL-driven filtered event results) — RBT-031.
 *
 * Routing-only: renders the Browse PageScreen. The screen reads genre/time/sort
 * from the URL query (useLocalSearchParams), filters the catalog client-side,
 * and re-navigates on filter change so the URL stays the single source of truth
 * (deep-linkable + back/forward safe). Reached from Home's Filter modal.
 */
import { useLocalSearchParams } from "expo-router";
import { Fragment } from "react";

import { Seo } from "@presentation/components/Seo";
import { BrowseScreen } from "@presentation/screens/Browse";
import { hasBrowseQueryParams } from "@presentation/screens/Browse/filter";

export default function BrowseRoute() {
  const params = useLocalSearchParams();

  return (
    <Fragment>
      <Seo
        title="Jelajahi Event"
        description="Jelajahi dan filter event mendatang berdasarkan genre, lokasi, dan waktu."
        path="/browse"
        // Query filters are client-side until the API provides server filters;
        // keep them out of search results and canonicalize to the base page.
        noindex={hasBrowseQueryParams(params)}
      />
      <BrowseScreen />
    </Fragment>
  );
}
