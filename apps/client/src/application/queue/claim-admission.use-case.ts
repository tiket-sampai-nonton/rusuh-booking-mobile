/**
 * ClaimAdmission — application use case (RBT-044, E5 Queue; FR-08).
 *
 * The auto-claim step of the virtual waiting room: when a queue entry reaches
 * `ADMITTED` (its turn), the system claims the slot WITHOUT a manual button by
 * creating a booking session from the issued admission token. The resulting
 * `sessionId` is what the screen redirects to checkout with.
 *
 * PURE TS: constructor-injected {@link BookingRepository} port, domain-only
 * imports — no React / RN / Expo / TanStack / infrastructure (ARCHITECTURE §3).
 *
 * Claim the queue entry first, then exchange the admission token for a session.
 *
 * SAFETY (FR-08 authorization invariant): the claim proceeds ONLY when the
 * supplied queue status `authorizes(...)` it — i.e. the entry is `ADMITTED`.
 * Every other status (WAITING, CLAIMED, all terminal states) is rejected with a
 * typed `DomainError` before any port call, reusing RBT-040's state machine
 * rather than reinventing the gate.
 *
 * ERROR MAPPING: a typed `DomainError` from the adapter (e.g. TURN_MISSED,
 * EVENT_SOLD_OUT, ADMISSION_TOKEN_INVALID) is passed through untouched so the UI
 * can discriminate on `code`/`kind`. Any other rejection is mapped to a typed
 * dependency error, so callers do not mistake a network failure for a missed turn.
 */
import { DomainError } from "@domain/errors/domain-error";
import { mapFailure } from "@domain/errors/error-mapper";
import type {
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import type { QueueStatus } from "@domain/repositories/queue.repository";
import type { QueueRepository } from "@domain/repositories/queue.repository";
import { authorizes } from "@domain/state-machines/queue-state-machine";

export class ClaimAdmission {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly queue: QueueRepository,
  ) {}

  /**
   * Claim the admitted slot for `eventId`, creating the booking session.
   *
   * @param eventId the event whose admitted slot is being claimed.
   * @param status  the current queue status — the claim proceeds only when it
   *   `authorizes(...)` (ADMITTED). Reuses RBT-040's invariant.
   * @returns the created {@link BookingSession} (carries `sessionId` for the
   *   checkout redirect, and the token-backed hold deadline).
   * @throws DomainError when `status` does not authorize the claim, or when the
   *   port rejects (typed errors passed through; others mapped to TURN_MISSED).
   */
  async execute(
    eventId: string,
    status: QueueStatus,
    queueId?: string,
  ): Promise<BookingSession> {
    if (!authorizes(status)) {
      // Not ADMITTED → not authorized to claim. Fail closed before any I/O.
      throw new DomainError({
        kind: "conflict",
        code: "CLAIM_NOT_AUTHORIZED",
        userMessage: "Giliran Anda belum tiba. Mohon tunggu antrean.",
      });
    }
    try {
      if (!queueId) throw new Error("Queue entry is required");
      const admissionToken = await this.queue.claim(queueId, eventId);
      return await this.bookings.createSession(admissionToken);
    } catch (cause) {
      // Already-typed domain errors (TURN_MISSED / EVENT_SOLD_OUT / token
      // invalid …) carry the discriminable code the UI needs — pass through.
      if (cause instanceof DomainError) {
        // The token was already spent on a session (double claim, retry, refresh):
        // resume that session instead of failing; rethrow only if none is alive.
        if (cause.code === "ADMISSION_TOKEN_INVALID") {
          const current = await this.bookings
            .getCurrentSession(eventId)
            .catch(() => null);
          if (current) return current;
        }
        throw cause;
      }
      // Any untyped failure during the admission claim becomes a typed
      // TURN_MISSED (the admission window is what just lapsed).
      throw mapFailure(cause, "DEPENDENCY_UNAVAILABLE");
    }
  }
}
