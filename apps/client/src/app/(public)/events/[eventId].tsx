// Public route `/events/[eventId]` (event detail). Routing-only shell: reads the
// param and mounts the presentation screen. RBT-032.
import { useLocalSearchParams } from "expo-router";

import { EventDetailScreen } from "@presentation/screens/Events/EventDetailScreen";

export default function EventDetailRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  return <EventDetailScreen eventId={eventId ?? ""} />;
}
