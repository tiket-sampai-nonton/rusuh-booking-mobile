/**
 * Public route `/history` ("History Event") — RBT-034. Routing-only: renders
 * the History PageScreen, which lists past/CLOSED events derived from the
 * catalog (useEvents → splitCatalog on the server clock). Reached from Home's
 * History section / nav.
 */
import { Fragment } from "react";

import { Seo } from "@presentation/components/Seo";
import { HistoryScreen } from "@presentation/screens/History";

export default function HistoryRoute() {
  return (
    <Fragment>
      <Seo
        title="History Event"
        description="Event yang telah berlalu di Rusuh Booking Tiket."
        path="/history"
      />
      <HistoryScreen />
    </Fragment>
  );
}
