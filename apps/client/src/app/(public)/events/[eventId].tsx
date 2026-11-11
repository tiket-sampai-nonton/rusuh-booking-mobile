import { useLocalSearchParams } from "expo-router";
import { Fragment } from "react";

import { Seo, eventJsonLd } from "@presentation/components/Seo";
import { EventDetailScreen } from "@presentation/screens/EventDetail";
import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";

/**
 * Expo static rendering uses the mock catalog for the development deployment.
 * Keeping this list tied to the shared fixture source ensures each demo event
 * gets a real, addressable HTML route instead of `/events/[eventId].html`.
 */
export function generateStaticParams(): { eventId: string }[] {
  return EVENT_FIXTURES.map(({ id }) => ({ eventId: id }));
}

/**
 * Public route `/events/[eventId]` — the single-event detail screen (RBT-032).
 *
 * Routing-only: reads the `eventId` route param and hands it to the screen,
 * which owns the data fetch (useEventDetail → GetEventDetail → EventRepository).
 * Emits indexable SEO metadata + schema.org Event JSON-LD (RBT-033 §6.6).
 */
export default function EventDetailRoute() {
  const { eventId, source } = useLocalSearchParams<{
    eventId: string;
    source?: string;
  }>();
  const id = eventId ?? "";
  const path = `/events/${id}`;
  const event = EVENT_FIXTURES.find((item) => item.id === id);
  const eventDescription = event?.description?.longDesc;
  return (
    <Fragment>
      <Seo
        title={event?.name ?? "Detail Event"}
        description={
          typeof eventDescription === "string"
            ? eventDescription
            : "Lihat detail event, kategori tiket, dan harga. Masuk antrean untuk memesan tiketmu."
        }
        path={path}
        jsonLd={
          event
            ? eventJsonLd({
                name: event.name,
                path,
                startsAt: event.startsAt,
                venue: event.venue,
                priceFromMinor: event.minPriceMinor,
                soldOut: event.status === "SOLD_OUT",
              })
            : eventJsonLd({ name: "Event", path })
        }
      />
      <EventDetailScreen eventId={id} hideQueueCta={source === "history"} />
    </Fragment>
  );
}
