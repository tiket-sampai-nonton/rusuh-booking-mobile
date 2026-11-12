/** TanStack query binding for issued tickets shown on the Success screen. */
import { useQuery } from "@tanstack/react-query";

import { useServices } from "@providers/service-context";

export function useSuccessTickets(bookingId: string, enabled: boolean) {
  const { ticketHistoryRepository } = useServices();
  return useQuery({
    queryKey: ["booking-tickets", bookingId],
    queryFn: () => ticketHistoryRepository.getBookingTickets(bookingId),
    enabled: enabled && Boolean(bookingId),
  });
}
