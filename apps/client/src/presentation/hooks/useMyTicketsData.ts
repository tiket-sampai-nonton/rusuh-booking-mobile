/** TanStack query bindings for account history and the active booking tickets. */
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { MyBookingStatus } from "@domain/repositories/ticket-history.repository";
import { useServices } from "@providers/service-context";

export interface UseMyTicketsDataOptions {
  readonly bookingId?: string;
  readonly isSignedIn: boolean;
  readonly profileEmailMasked?: string;
  readonly selectedBookingId?: string;
  readonly selectedBookingStatus?: MyBookingStatus;
  readonly historyPageSize: number;
}

export function useMyTicketsData({
  bookingId,
  isSignedIn,
  profileEmailMasked,
  selectedBookingId,
  selectedBookingStatus,
  historyPageSize,
}: UseMyTicketsDataOptions) {
  const { ticketHistoryRepository, paymentRepository } = useServices();
  const paymentStatus = useQuery({
    queryKey: ["my-ticket-payment-status", bookingId],
    queryFn: () => paymentRepository.getStatus(bookingId!, bookingId!),
    enabled: Boolean(bookingId),
  });
  const localTickets = useQuery({
    queryKey: ["booking-tickets", bookingId],
    queryFn: () => ticketHistoryRepository.getBookingTickets(bookingId!),
    enabled: Boolean(bookingId && paymentStatus.data?.status === "PAID"),
  });
  const history = useInfiniteQuery({
    queryKey: ["my-bookings", profileEmailMasked],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      ticketHistoryRepository.listMyBookings(pageParam, historyPageSize),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isSignedIn,
  });
  const selectedTickets = useQuery({
    queryKey: ["my-booking-tickets", selectedBookingId],
    queryFn: () =>
      ticketHistoryRepository.getBookingTickets(selectedBookingId!),
    enabled: Boolean(selectedBookingId && selectedBookingStatus === "PAID"),
    retry: 1,
  });

  return { paymentStatus, localTickets, history, selectedTickets };
}
