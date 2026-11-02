/**
 * payment-recovery — failure/expiry recovery decision (RBT-064, E7 Payment,
 * AC1/FR-23).
 *
 * Pure domain rule (no React / RN / Expo / infrastructure imports). After a
 * payment ends unhappily the FE must offer the RIGHT recovery:
 *   • FAILED but the booking is still PAYABLE  → retry a NEW attempt.
 *   • BOOKING_NOT_PAYABLE, or the payment/hold deadline has passed → there is
 *     nothing to retry; send the user back through the re-queue path (the event
 *     is released, they must queue again).
 *
 * The decision is driven by the authoritative status + the server-reconciled
 * remaining time (never the device clock) + the terminal error code, so the UI
 * never offers a retry that the backend would reject.
 */
import type { PaymentStatus } from "@domain/repositories/payment.repository";

/** Why the flow landed on the expired/recovery screen. */
export type ExpiryReason = "payment" | "hold" | "queue";

/** The recovery the screen should offer. */
export type RecoveryAction =
  | { readonly kind: "retry" } // FAILED + payable → new attempt
  | { readonly kind: "requeue" }; // not payable / expired → back to queue

/** Terminal error codes that mean the booking can no longer be paid. */
const NOT_PAYABLE_CODES: ReadonlySet<string> = new Set([
  "BOOKING_NOT_PAYABLE",
  "BOOKING_EXPIRED",
  "HOLD_EXPIRED",
]);

/**
 * Decide the recovery action.
 *
 * @param status  the authoritative payment status (undefined = unknown).
 * @param remainingMs  server-reconciled ms left on the deadline (<=0 = passed).
 * @param errorCode  a terminal domain-error code, when one was surfaced.
 *
 * retry ONLY when the attempt FAILED, the deadline has NOT passed, and no
 * not-payable code is present; otherwise requeue (the safe, backend-honest
 * default — never offer a retry that cannot succeed).
 */
export function decideRecovery(
  status: PaymentStatus | undefined,
  remainingMs: number,
  errorCode?: string,
): RecoveryAction {
  const notPayable = errorCode !== undefined && NOT_PAYABLE_CODES.has(errorCode);
  const deadlinePassed = remainingMs <= 0;
  if (status === "FAILED" && !deadlinePassed && !notPayable) {
    return { kind: "retry" };
  }
  return { kind: "requeue" };
}

/** True when the booking can still be paid (a retry is worth offering). */
export function isRetryable(
  status: PaymentStatus | undefined,
  remainingMs: number,
  errorCode?: string,
): boolean {
  return decideRecovery(status, remainingMs, errorCode).kind === "retry";
}

/**
 * The re-queue destination for a given expiry reason. A payment/hold failure
 * sends the user back to the event's waiting room to re-enter the queue; a
 * queue expiry (or an unknown event) falls back to browse.
 */
export function requeueRoute(
  reason: ExpiryReason,
  eventId?: string,
): string {
  if ((reason === "payment" || reason === "hold") && eventId) {
    return `/waiting/${eventId}`;
  }
  return "/browse";
}
