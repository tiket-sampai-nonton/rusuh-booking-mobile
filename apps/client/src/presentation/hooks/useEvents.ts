/**
 * useEvents — TanStack Query seam for the Home catalog (RBT-030).
 *
 * The ONLY place the events catalog touches TanStack Query (ARCHITECTURE §4.3,
 * D3). It reads the DI container via `useServices()`, builds the framework-free
 * `ListEvents` use case, and exposes the upcoming/history split as query state.
 * Swapping Query (→ SWR, → plain effect) changes only this file.
 */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { ListEvents } from "@application/events/list-events.use-case";
import type { CatalogSplit } from "@domain/rules/event-display";
import type { EventQuery } from "@domain/repositories/event.repository";
import { useServices } from "@providers/service-context";

/** Query key for the event catalog. */
export const EVENTS_QUERY_KEY = ["events", "catalog"] as const;

/** Fetch + split the event catalog (upcoming + history). */
export function useEvents(
  query?: EventQuery,
): UseQueryResult<CatalogSplit, Error> {
  const { eventRepository, serverClock } = useServices();
  return useQuery<CatalogSplit, Error>({
    queryKey: query ? [...EVENTS_QUERY_KEY, query] : EVENTS_QUERY_KEY,
    queryFn: () => new ListEvents(eventRepository, serverClock).execute(query),
  });
}
