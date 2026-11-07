/**
 * useBookingSession — presentation seam for the checkout booking session
 * (RBT-050, E6). Creates a session from the admitted event, or restores the
 * current one after a refresh WITHOUT resetting its server deadline (FR-18).
 *
 * The swap seam: TanStack Query lives HERE (presentation), never in the use
 * case or the domain. The backend is reached only through
 * {@link CreateBookingSession} / {@link RestoreBookingSession} → the frozen
 * {@link BookingRepository} port read from the DI container via `useServices()`
 * — it names no concrete adapter and imports no infrastructure (ARCHITECTURE
 * §3, §4.3).
 *
 * On create/restore it records the sessionId in the session store so later
 * checkout screens resume against the same session.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { CreateBookingSession } from "@application/booking/create-booking-session.use-case";
import { RestoreBookingSession } from "@application/booking/restore-booking-session.use-case";
import type { BookingSession } from "@domain/repositories/booking.repository";
import { useServices } from "@providers/service-context";
import { useSessionStore } from "@presentation/stores/session-store";

/** Exchange an admitted queue token for a booking session. */
export function useCreateBookingSession(): {
  create: (admissionToken: string) => Promise<BookingSession>;
  isCreating: boolean;
  error: Error | null;
} {
  const { bookingRepository } = useServices();
  const setSession = useSessionStore((s) => s.setSession);
  const usecase = useMemo(
    () => new CreateBookingSession(bookingRepository),
    [bookingRepository],
  );
  const mutation = useMutation<BookingSession, Error, string>({
    mutationFn: (admissionToken) => usecase.execute(admissionToken),
    onSuccess: (session) => setSession(session.sessionId),
  });
  return {
    create: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Restore the current booking session (refresh-safe). `enabled` lets the
 * checkout screen decide when to attempt a restore. Returns null data when
 * there is no active session (caller routes to expired / re-queue).
 */
export function useRestoreBookingSession(
  enabled = true,
  sessionId?: string,
): {
  session: BookingSession | null | undefined;
  isLoading: boolean;
  error: Error | null;
  retry: () => Promise<unknown>;
} {
  const { bookingRepository } = useServices();
  const queryClient = useQueryClient();
  const setSession = useSessionStore((s) => s.setSession);
  const usecase = useMemo(
    () => new RestoreBookingSession(bookingRepository),
    [bookingRepository],
  );
  const query = useQuery<BookingSession | null, Error>({
    queryKey: sessionId
      ? ["booking-session", "current", sessionId]
      : ["booking-session", "current"],
    queryFn: async () => {
      const session = await usecase.execute(sessionId);
      if (session) setSession(session.sessionId);
      return session;
    },
    enabled,
  });
  useEffect(() => {
    if (
      !enabled ||
      !sessionId ||
      query.data?.sessionId !== sessionId ||
      query.data.phase === "ENDED" ||
      !bookingRepository.subscribeAvailability
    )
      return;
    return bookingRepository.subscribeAvailability(sessionId, () => {
      void queryClient.invalidateQueries({
        queryKey: ["booking-session", "current", sessionId],
      });
    });
  }, [
    bookingRepository,
    enabled,
    queryClient,
    query.data?.sessionId,
    query.data?.phase,
    sessionId,
  ]);
  return {
    session: query.data,
    isLoading: query.isLoading,
    error: query.error,
    retry: () => query.refetch(),
  };
}
