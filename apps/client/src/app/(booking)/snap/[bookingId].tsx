// Booking route `/snap/[bookingId]` — local SNAP gateway simulator (D10.5).
// Routing-only shell. RBT-065.
import { useLocalSearchParams } from "expo-router";

import { SnapSimulatorScreen } from "@presentation/screens/Payment/SnapSimulatorScreen";

export default function SnapRoute() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return <SnapSimulatorScreen bookingId={bookingId ?? ""} />;
}
