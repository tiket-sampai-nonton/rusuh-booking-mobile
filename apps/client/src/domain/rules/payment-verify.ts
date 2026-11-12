/**
 * payment-verify — authoritative result classification + routing (RBT-063).
 *
 * Pure domain rule (no React / RN / Expo / infrastructure imports). The FE
 * NEVER trusts the SNAP callback: success is rendered ONLY when the
 * authoritative `getStatus` reports PAID (D10.2/D10.4, FR-25). A non-terminal
 * status means "keep verifying" (processing + backoff poll). A pending status
 * whose server deadline has passed is reconciled to EXPIRED from the server
 * clock — never the device clock.
 */
import type { PaymentStatus } from "@domain/repositories/payment.repository";

/** Collapsed result bucket the UI/routing acts on. */
export type PaymentVerdict = "paid" | "failed" | "pending";

/** Terminal-PAID is the ONLY success. FAILED/EXPIRED are terminal-failed. */
export function classifyPayment(status: PaymentStatus): PaymentVerdict {
  switch (status) {
    case "PAID":
      return "paid";
    case "FAILED":
    case "EXPIRED":
      return "failed";
    case "READY":
    case "AWAITING_PAYMENT":
    default:
      return "pending";
  }
}

/** A verdict is terminal when it is no longer "pending" (poll can stop). */
export function isPaymentTerminal(status: PaymentStatus): boolean {
  return classifyPayment(status) !== "pending";
}

/** Backoff schedule (ms) for the authoritative verify poll — capped, with an
 * anti-storm floor. Index past the end clamps to the last (steady) cadence. */
const VERIFY_BACKOFF_MS: readonly number[] = [
  1_500, 2_500, 4_000, 6_000, 8_000,
];

/**
 * The next verify poll delay, or `false` to STOP. Stops the moment the status
 * is terminal. While pending, returns the backoff step for `attempt` (0-based
 * poll count); `reducedMotion` raises the floor slightly (no animation, but it
 * keeps cadence calm). Pure + timer-free so it is unit-testable.
 */
export function computeVerifyRefetchInterval(
  status: PaymentStatus | undefined,
  attempt = 0,
  reducedMotion = false,
): number | false {
  if (status && isPaymentTerminal(status)) return false;
  const idx = Math.min(Math.max(attempt, 0), VERIFY_BACKOFF_MS.length - 1);
  const base = VERIFY_BACKOFF_MS[idx];
  return reducedMotion ? Math.max(base, 2_500) : base;
}

/**
 * Where the result flow should go, given the authoritative status and the
 * server-reconciled remaining time. PAID → success; FAILED/EXPIRED → expired;
 * pending but the server deadline has passed (`remainingMs <= 0`) → expired
 * (reconciled from the server clock, NOT the device clock); pending with time
 * left → `null` (stay on the processing screen and keep polling).
 */
export function resolvePaymentRoute(
  status: PaymentStatus | undefined,
  bookingId: string,
  remainingMs: number,
): string | null {
  if (!status) return null;
  const verdict = classifyPayment(status);
  if (verdict === "paid") return `/success/${bookingId}`;
  // Failure/expiry → the recovery screen (RBT-064). Carry reason=payment + the
  // authoritative status so it can decide retry (FAILED+payable) vs re-queue.
  if (verdict === "failed") {
    return `/failed/${bookingId}?reason=payment&bookingId=${bookingId}&status=${status}`;
  }
  // pending: reconcile the deadline from the server clock.
  if (remainingMs <= 0) {
    return `/failed/${bookingId}?reason=payment&bookingId=${bookingId}&status=${status}`;
  }
  return null;
}
