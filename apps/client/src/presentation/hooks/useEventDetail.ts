/**
 * useEventDetail — TanStack Query seam for one event (RBT-032).
 *
 * The only place event-detail data touches TanStack Query (ARCHITECTURE §4.3).
 * Reads the DI container, builds the framework-free `GetEventDetail` use case,
 * and exposes the detail as query state.
 */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { GetEventDetail } from "@application/use-cases/get-event-detail";
import type { EventDetail } from "@domain/repositories/event.repository";
import { useServices } from "@providers/service-context";

/** Query key for one event's detail. */
export const eventDetailKey = (eventId: string) =>
  ["events", "detail", eventId] as const;

export function useEventDetail(
  eventId: string,
): UseQueryResult<EventDetail, Error> {
  const { eventRepository } = useServices();
  return useQuery<EventDetail, Error>({
    queryKey: eventDetailKey(eventId),
    queryFn: () => new GetEventDetail(eventRepository).execute(eventId),
    enabled: eventId.length > 0,
  });
}
