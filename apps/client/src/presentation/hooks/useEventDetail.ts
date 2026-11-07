/**
 * useEventDetail — TanStack Query seam for one event's detail (RBT-032).
 *
 * The ONLY place event-detail data touches TanStack Query (ARCHITECTURE §4.3,
 * D3). It reads the DI container via `useServices()`, builds the framework-free
 * `GetEventDetail` use case, and exposes the detail as query state. Swapping
 * Query (→ SWR, → plain effect) changes only this file. Mirrors `useEvents`.
 */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { GetEventDetail } from "@application/events/get-event-detail.use-case";
import type { EventDetail } from "@domain/repositories/event.repository";
import { useServices } from "@providers/service-context";

/** Query key for one event's detail. */
export const eventDetailKey = (eventId: string) =>
  ["events", "detail", eventId] as const;

/** Fetch one event's detail by id. Idle until a non-empty id is present. */
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
