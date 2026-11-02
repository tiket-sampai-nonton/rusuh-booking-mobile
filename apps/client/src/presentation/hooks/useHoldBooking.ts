/**
 * useHoldBooking — presentation seam for the idempotent booking hold (RBT-054).
 *
 * Wraps the framework-free {@link HoldBooking} use case (→ frozen
 * {@link BookingRepository} + {@link IdempotencyKeys} from `useServices()`).
 * TanStack's mutation lives HERE, never in the use case/domain (D3). On success
 * it records the booking id + amount in the session store so the payment screen
 * can read them, and returns the {@link Booking} so the screen navigates. On a
 * typed hold conflict the mutation's `error` is the {@link DomainError} carrying
 * the Bahasa `userMessage` the CheckoutBar surfaces (FR-16).
 *
 * Retry is SAFE: the use case reuses the same Idempotency-Key across retries, so
 * TanStack's retry (or a user re-tap) cannot create a second booking (FR-25).
 */
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

import { HoldBooking } from "@application/booking/hold-booking.use-case";
import type { Booking } from "@domain/repositories/booking.repository";
import type { DomainError } from "@domain/errors/domain-error";
import type { TicketRow } from "@domain/rules/checkout";
import { useServices } from "@providers/service-context";
import { useSessionStore } from "@presentation/stores/session-store";

export interface HoldInput {
  readonly sessionId: string;
  readonly rows: readonly TicketRow[];
  readonly buyerNik: string;
}

export function useHoldBooking(): {
  hold: (input: HoldInput) => Promise<Booking>;
  isHolding: boolean;
  error: DomainError | null;
} {
  const { bookingRepository, idempotencyKeys } = useServices();
  const setBooking = useSessionStore((s) => s.setBooking);
  const usecase = useMemo(
    () => new HoldBooking(bookingRepository, idempotencyKeys),
    [bookingRepository, idempotencyKeys],
  );
  const mutation = useMutation<Booking, DomainError, HoldInput>({
    mutationFn: ({ sessionId, rows, buyerNik }) =>
      usecase.execute(sessionId, rows, buyerNik),
    onSuccess: (booking) => setBooking(booking.bookingId, booking.amountMinor),
  });
  return {
    hold: mutation.mutateAsync,
    isHolding: mutation.isPending,
    error: mutation.error,
  };
}
