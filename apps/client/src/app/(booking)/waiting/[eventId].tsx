// Booking route `/waiting/[eventId]` (queue waiting room). Routing-only shell:
// reads the param and mounts the presentation screen. RBT-043/044.
import { useLocalSearchParams } from "expo-router";

import { WaitingRoomScreen } from "@presentation/screens/Waiting";

export default function WaitingRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  return <WaitingRoomScreen eventId={eventId ?? ""} />;
}
