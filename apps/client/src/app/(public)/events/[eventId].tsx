import { useLocalSearchParams } from "expo-router";
import { Fragment } from "react";

import { Seo, eventJsonLd } from "@presentation/components/Seo";
import { EventDetailScreen } from "@presentation/screens/EventDetail";

/**
 * Public route `/events/[eventId]` — the single-event detail screen (RBT-032).
 *
 * Routing-only: reads the `eventId` route param and hands it to the screen,
 * which owns the data fetch (useEventDetail → GetEventDetail → EventRepository).
 * Emits indexable SEO metadata + schema.org Event JSON-LD (RBT-033 §6.6).
 */
export default function EventDetailRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const id = eventId ?? "";
  const path = `/events/${id}`;
  return (
    <Fragment>
      <Seo
        title="Detail Event"
        description="Lihat detail event, kategori tiket, dan harga. Masuk antrean untuk memesan tiketmu."
        path={path}
        jsonLd={eventJsonLd({ name: "Event", path })}
      />
      <EventDetailScreen eventId={id} />
    </Fragment>
  );
}
