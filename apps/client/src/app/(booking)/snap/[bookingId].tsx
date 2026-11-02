// Booking route `/snap/[bookingId]` — local SNAP gateway simulator (RBT-065,
// D10.5). Routing-only shell; the mock `redirectUrl` points here so the handoff
// opens the simulator instead of a real hosted page. noindex is inherent
// (transactional, not linked publicly).
import { useLocalSearchParams } from "expo-router";

import { SnapSimulatorScreen } from "@presentation/screens/Snap";

export default function SnapRoute() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return <SnapSimulatorScreen bookingId={bookingId ?? ""} />;
}
