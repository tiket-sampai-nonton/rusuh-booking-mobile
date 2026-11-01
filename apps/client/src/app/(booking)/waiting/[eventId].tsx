import { useLocalSearchParams } from "expo-router";

import { WaitingRoomScreen } from "@presentation/screens/Waiting";

/**
 * Booking route `/waiting/[eventId]` — the virtual waiting room (RBT-043).
 *
 * The screen is driven by a `queueId` (the persisted queue entry). Join +
 * persistence is RBT-041 (blocked); until that lands, the `queueId` is accepted
 * off the route params so the waiting room can be reached/tested. When RBT-041
 * is done it will seed the persisted queueId and this route reads it the same
 * way.
 *
 * TODO(RBT-041): source `queueId` from the persisted session store once join
 * persistence exists, instead of (or in addition to) the route param.
 */
export default function WaitingScreen() {
  const { eventId, queueId } = useLocalSearchParams<{
    eventId: string;
    queueId?: string;
  }>();
  return <WaitingRoomScreen eventId={eventId} queueId={queueId ?? ""} />;
}
