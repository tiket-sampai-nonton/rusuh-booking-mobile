/**
 * useVerifyPayment — authoritative payment verification + result routing
 * (RBT-063, E7 Payment, AC1/FR-25, D10.4).
 *
 * The FE NEVER trusts the SNAP success/failed callback: after the return it
 * reads the AUTHORITATIVE status via `VerifyPayment` → `getStatus` and renders
 * success ONLY when that reports PAID. While the status is non-terminal
 * (READY/AWAITING_PAYMENT) it keeps polling on a backoff cadence; it STOPS the
 * moment the status is terminal (PAID/FAILED/EXPIRED). A pending attempt whose
 * SERVER deadline has passed is reconciled to expired from the `ServerClock`
 * (never the device clock, D3.2).
 *
 * ONE poller per attempt (TanStack owns the single interval for the
 * `["payment","verify",attemptId]` key and cancels it on unmount — no
 * hand-rolled setInterval, no request storm, NFR-05/06). TanStack Query is
 * confined to this hook (the D3 swap seam); the backend is reached ONLY through
 * the `VerifyPayment` use case → the frozen `PaymentRepository` port read from
 * the DI container via `useServices()`. No infrastructure import.
 */
import { useEffect, useMemo } from "react";
import { useQuery, type Query } from "@tanstack/react-query";
import { Platform } from "react-native";

import {
  VerifyPayment,
  CreatePaymentAttempt,
} from "@application/payment/create-payment-attempt.use-case";
import { ScheduleLocalNotification } from "@application/notifications/schedule-local-notification.use-case";
import { useSessionStore } from "@presentation/stores/session-store";
import type { PaymentAttempt } from "@domain/repositories/payment.repository";
import {
  classifyPayment,
  computeVerifyRefetchInterval,
  isPaymentTerminal,
  resolvePaymentRoute,
  type PaymentVerdict,
} from "@domain/rules/payment-verify";
import {
  paymentFailure,
  paymentSuccess,
} from "@domain/rules/notification-flows";
import { useServices } from "@providers/service-context";

/** What the result screen reads off the single verify poller. */
export interface VerifyPaymentView {
  /** Latest authoritative attempt (undefined until the first read resolves). */
  readonly attempt?: PaymentAttempt;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  /** Collapsed verdict: paid / failed / pending (undefined until first read). */
  readonly verdict?: PaymentVerdict;
  /** True once the status is terminal — the poller has stopped. */
  readonly isSettled: boolean;
  /**
   * The route to navigate to, or `null` to stay on the processing screen and
   * keep polling. PAID → /success; FAILED/EXPIRED or pending-past-deadline →
   * /expired (deadline reconciled from the server clock).
   */
  readonly route: string | null;
}

/**
 * Verify the authoritative status for `attemptId` (for `bookingId`), polling on
 * backoff while pending and stopping on terminal.
 *
 * @param attemptId the attempt to verify; polling is disabled while empty.
 * @param bookingId used to build the success/expired route.
 * @param reducedMotion raise the poll floor for reduced-motion users.
 */
export function useVerifyPayment(
  attemptId: string | undefined,
  bookingId: string,
  reducedMotion = false,
): VerifyPaymentView {
  const { paymentRepository, serverClock, idempotencyKeys, notification } =
    useServices();
  const paymentMethod = useSessionStore((state) => state.paymentMethod);
  const storedBookingId = useSessionStore((state) => state.bookingId);

  const verify = useMemo(
    () => new VerifyPayment(paymentRepository),
    [paymentRepository],
  );
  const scheduleNotification = useMemo(
    () => new ScheduleLocalNotification(notification),
    [notification],
  );

  const query = useQuery<PaymentAttempt, Error>({
    queryKey: ["payment", "verify", bookingId, attemptId],
    queryFn: () => verify.execute(attemptId ?? bookingId, bookingId),
    enabled: bookingId.length > 0,
    // The SINGLE backoff verify poller. Stop on terminal; else the backoff step
    // for the current poll count. TanStack cancels the interval on unmount.
    refetchInterval: (q: Query<PaymentAttempt, Error>) =>
      computeVerifyRefetchInterval(
        q.state.data?.status,
        q.state.dataUpdateCount,
        reducedMotion,
      ),
  });

  const attempt = query.data;
  const attemptStatus = attempt?.status;
  const verdict = attempt ? classifyPayment(attempt.status) : undefined;
  const isSettled = attempt !== undefined && isPaymentTerminal(attempt.status);

  useEffect(() => {
    const method =
      attempt?.method ??
      (storedBookingId === bookingId ? paymentMethod : undefined);
    if (isSettled && method)
      idempotencyKeys.clear(CreatePaymentAttempt.actionId(bookingId, method));
  }, [
    attempt?.method,
    bookingId,
    idempotencyKeys,
    isSettled,
    paymentMethod,
    storedBookingId,
  ]);

  useEffect(() => {
    if (
      Platform.OS === "web" ||
      !attemptStatus ||
      !isPaymentTerminal(attemptStatus)
    )
      return;
    const message =
      attemptStatus === "PAID"
        ? paymentSuccess(bookingId)
        : paymentFailure(bookingId);
    // Payment status comes from VerifyPayment (the BE-authoritative read).
    // Delivery errors must never block the result route.
    void scheduleNotification.execute(message).catch(() => undefined);
  }, [attemptStatus, bookingId, scheduleNotification]);

  // Server-authoritative remaining time for the pending deadline reconcile.
  let remainingMs = Number.POSITIVE_INFINITY;
  if (attempt?.paymentExpiresAt) {
    if (attempt.serverTime) serverClock.sync(attempt.serverTime);
    remainingMs = serverClock.remaining(attempt.paymentExpiresAt);
  }
  const route = attempt
    ? resolvePaymentRoute(attempt.status, bookingId, remainingMs)
    : null;

  return {
    attempt,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    verdict,
    isSettled,
    route,
  };
}
