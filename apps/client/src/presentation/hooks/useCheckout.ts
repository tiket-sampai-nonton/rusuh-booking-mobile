/**
 * useCheckout — booking-session + hold seam (RBT-050/054).
 *
 * Restores the current booking session (refresh-safe) and exposes the
 * idempotent `hold` mutation. TanStack Query is confined to this hook (D3). The
 * hold records the booking id in the session store and routes nothing itself —
 * the screen navigates on success.
 */
import { useMutation, useQuery, type UseMutationResult } from "@tanstack/react-query";

import { GetCurrentSession } from "@application/use-cases/booking-session";
import { HoldBooking } from "@application/use-cases/hold-booking";
import type {
  Booking,
  BookingSession,
} from "@domain/repositories/booking.repository";
import type { TicketRow } from "@domain/rules/checkout";
import { useServices } from "@providers/service-context";
import { useSessionStore } from "@presentation/stores/session-store";

export interface HoldInput {
  readonly sessionId: string;
  readonly rows: readonly TicketRow[];
  readonly buyerNik: string;
}

export interface CheckoutView {
  readonly session: BookingSession | null | undefined;
  readonly isLoading: boolean;
  readonly hold: UseMutationResult<Booking, Error, HoldInput>;
}

export function useCheckout(): CheckoutView {
  const { bookingRepository, idempotencyKeys } = useServices();
  const setBooking = useSessionStore((s) => s.setBooking);

  const sessionQuery = useQuery<BookingSession | null, Error>({
    queryKey: ["booking", "current-session"],
    queryFn: () => new GetCurrentSession(bookingRepository).execute(),
  });

  const hold = useMutation<Booking, Error, HoldInput>({
    mutationFn: ({ sessionId, rows, buyerNik }) =>
      new HoldBooking(bookingRepository, idempotencyKeys).execute(
        sessionId,
        rows,
        buyerNik,
      ),
    onSuccess: (booking) => {
      setBooking(booking.bookingId, booking.amountMinor);
    },
  });

  return {
    session: sessionQuery.data,
    isLoading: sessionQuery.isLoading,
    hold,
  };
}
