/**
 * Public route `/history` ("History Event") — RBT-034. Routing-only: renders
 * the History PageScreen, which lists past/CLOSED events derived from the
 * catalog (useEvents → splitCatalog on the server clock). Reached from Home's
 * History section / nav.
 */
import { HistoryScreen } from "@presentation/screens/History";

export default function HistoryRoute() {
  return <HistoryScreen />;
}
