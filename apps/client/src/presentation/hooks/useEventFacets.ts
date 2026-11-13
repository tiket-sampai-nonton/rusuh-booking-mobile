import { useQuery } from "@tanstack/react-query";
import { ListEventFacets } from "@application/events/list-event-facets.use-case";
import { useServices } from "@providers/service-context";

export function useEventFacets(time: string, enabled: boolean) {
  const { eventRepository, serverClock } = useServices();
  let timeframe: "THIS_WEEK" | "THIS_MONTH" | undefined;
  if (time === "week") timeframe = "THIS_WEEK";
  else if (time === "month") timeframe = "THIS_MONTH";
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
