/**
 * useAutoClaim — presentation seam for the admission auto-claim (RBT-044, FR-08).
 *
 * Given the CURRENT queue status (owned by RBT-042's polling hook — this hook
 * does NOT poll, it consumes a status input), it auto-claims the admitted slot
 * exactly ONCE when the status first becomes `ADMITTED`: no manual button. It
 * exposes `{ claiming, claimedSessionId, error }` plus a discriminated
 * `errorState` (TURN_MISSED / EVENT_SOLD_OUT) the screen renders as an error
 * state inside the waiting room.
 *
 * ROUTING-AGNOSTIC: the hook never navigates. It returns `claimedSessionId` and
 * invokes an optional `onClaimed(sessionId)` callback so the caller/screen does
 * the `router.replace("/checkout/[sessionId]")` — keeping RBT-044 from fighting
 * RBT-043's screen or hard-coding a route here.
 *
 * ARCHITECTURE (§3, §4.3): TanStack Query lives HERE (presentation), never in
 * the use case or domain. The backend is reached only through
 * {@link ClaimAdmission} → the {@link BookingRepository} port, obtained from the
 * DI container via `useServices()`. No concrete adapter is named; no
 * infrastructure import.
 */
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { ClaimAdmission } from "@application/queue/claim-admission.use-case";
import { DomainError } from "@domain/errors/domain-error";
import type { BookingSession } from "@domain/repositories/booking.repository";
import type { QueueStatus } from "@domain/repositories/queue.repository";
import { authorizes } from "@domain/state-machines/queue-state-machine";
import { useServices } from "@providers/service-context";

/** The error states RBT-044 surfaces in the waiting room (FR-08). */
export type ClaimErrorState = "TURN_MISSED" | "EVENT_SOLD_OUT" | "UNKNOWN";

export interface UseAutoClaimParams {
  /** The event whose admitted slot is being claimed. */
  readonly eventId: string;
  /** The current queue status (from RBT-042's poller). */
  readonly status?: QueueStatus;
  /**
   * Optional callback fired once with the booking `sessionId` when the claim
   * succeeds — the caller/screen routes to checkout (routing stays out of the
   * hook so it doesn't collide with RBT-043's screen).
   */
  readonly onClaimed?: (sessionId: string) => void;
}

export interface UseAutoClaimResult {
  /** True while the auto-claim mutation is in flight. */
  readonly claiming: boolean;
  /** The booking session id once the claim succeeds (→ route to checkout). */
  readonly claimedSessionId?: string;
  /** The claim error (typed DomainError on failure), if any. */
  readonly error: Error | null;
  /**
   * Discriminated error state for the UI: TURN_MISSED / EVENT_SOLD_OUT, or
   * UNKNOWN for any other failure; `null` when there is no error.
   */
  readonly errorState: ClaimErrorState | null;
}

/** Map a thrown error to the UI's discriminated claim-error state. */
function toErrorState(error: Error | null): ClaimErrorState | null {
  if (error === null) return null;
  if (error instanceof DomainError) {
    if (error.code === "TURN_MISSED") return "TURN_MISSED";
    if (error.code === "EVENT_SOLD_OUT") return "EVENT_SOLD_OUT";
  }
  return "UNKNOWN";
}

/**
 * Fire the admission claim ONCE on `ADMITTED`. The `claimedOnce` ref guards
 * against React re-renders / StrictMode double-invokes firing it twice.
 */
export function useAutoClaim({
  eventId,
  status,
  onClaimed,
}: UseAutoClaimParams): UseAutoClaimResult {
  const { bookingRepository } = useServices();

  const claim = useMemo(
    () => new ClaimAdmission(bookingRepository),
    [bookingRepository],
  );

  const [claimedSessionId, setClaimedSessionId] = useState<string | undefined>();
  const claimedOnce = useRef(false);

  // Keep the latest onClaimed without making it a mutation/effect dependency
  // (so passing an inline callback doesn't re-arm the one-shot guard).
  const onClaimedRef = useRef<typeof onClaimed>(onClaimed);
  onClaimedRef.current = onClaimed;

  const mutation = useMutation<BookingSession, Error, QueueStatus>({
    mutationFn: (admitted: QueueStatus) => claim.execute(eventId, admitted),
    onSuccess: (session) => {
      setClaimedSessionId(session.sessionId);
      onClaimedRef.current?.(session.sessionId);
    },
  });

  // mutate is identity-stable from TanStack; capture it for the effect.
  const mutate = mutation.mutate;

  useEffect(() => {
    if (status === undefined) return;
    // ONLY ADMITTED authorizes the claim (RBT-040 invariant). Fire once.
    if (authorizes(status) && !claimedOnce.current) {
      claimedOnce.current = true;
      mutate(status);
    }
  }, [status, mutate]);

  const errorState = toErrorState(mutation.error);

  return {
    claiming: mutation.isPending,
    claimedSessionId,
    error: mutation.error,
    errorState,
  };
}
