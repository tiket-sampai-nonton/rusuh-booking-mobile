import { useQuery } from "@tanstack/react-query";
import { ListEventFacets } from "@application/events/list-event-facets.use-case";
import { useServices } from "@providers/service-context";

export function useEventFacets(time: string, enabled: boolean) {
  const { eventRepository, serverClock } = useServices();
  const timeframe =
    time === "week" ? "THIS_WEEK" : time === "month" ? "THIS_MONTH" : undefined;
  return useQuery({
    queryKey: ["events", "facets", time],
    queryFn: () =>
      new ListEventFacets(eventRepository, serverClock).execute(
        timeframe ? { timeframe } : {},
        time === "quarter",
      ),
    enabled,
  });
}
