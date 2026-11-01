import { useLocalSearchParams } from "expo-router";

import { EventDetailScreen } from "@presentation/screens/EventDetail";

/**
 * Public route `/events/[eventId]` — the single-event detail screen (RBT-032).
 *
 * Routing-only: reads the `eventId` route param and hands it to the screen,
 * which owns the data fetch (useEventDetail → GetEventDetail → EventRepository).
 */
export default function EventDetailRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  return <EventDetailScreen eventId={eventId ?? ""} />;
}
