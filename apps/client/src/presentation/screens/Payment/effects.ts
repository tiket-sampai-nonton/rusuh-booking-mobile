import type {
  PaymentAttempt,
  PaymentStatus,
} from "@domain/repositories/payment.repository";
import type { Booking } from "@domain/repositories/booking.repository";
import {
  paymentResultNotification,
  paymentTimeout,
} from "@domain/rules/notification-flows";
import { apiErrorMessage } from "@presentation/utils/api-error-message";

type MutableValue<T> = { current: T };
type TerminalStatus = Extract<PaymentStatus, "PAID" | "FAILED" | "EXPIRED">;

export type PaymentExitResult =
  | { readonly kind: "paid" }
  | { readonly kind: "cancelled" }
  | { readonly kind: "expired" }
  | { readonly kind: "failed" }
  | { readonly kind: "active" }
  | { readonly kind: "unknown"; readonly message: string };

interface PaymentExitDependencies {
  readonly cancelBooking: () => Promise<Booking>;
  readonly reconcilePayment: () => Promise<PaymentAttempt>;
  readonly clearJourney: () => Promise<void>;
  readonly clearQueue: () => Promise<unknown>;
  readonly syncServerTime: (serverTime: string) => void;
}

export async function requestPaymentExit(
  dependencies: PaymentExitDependencies,
): Promise<PaymentExitResult> {
  try {
    const booking = await dependencies.cancelBooking();
    if (booking.status === "PAID") {
      await dependencies.clearJourney().catch(() => undefined);
      return { kind: "paid" };
    }
    if (booking.status !== "CANCELLED" && booking.status !== "EXPIRED") {
      return { kind: "active" };
    }
    await Promise.all([
      dependencies.clearJourney().catch(() => undefined),
      dependencies.clearQueue().catch(() => undefined),
    ]);
    return { kind: booking.status === "EXPIRED" ? "expired" : "cancelled" };
  } catch (cancelError) {
    try {
      const status = await dependencies.reconcilePayment();
      if (status.serverTime) dependencies.syncServerTime(status.serverTime);
      if (status.status === "PAID") {
        await dependencies.clearJourney().catch(() => undefined);
        return { kind: "paid" };
      }
      if (status.status === "FAILED" || status.status === "EXPIRED") {
        await dependencies.clearJourney().catch(() => undefined);
        return { kind: "failed" };
      }
      return { kind: "active" };
    } catch (statusError) {
      return {
        kind: "unknown",
        message: apiErrorMessage(
          statusError ?? cancelError,
          "Status belum dapat dipastikan. Periksa koneksi lalu coba lagi.",
        ),
      };
    }
  }
}

interface PaymentExitResultActions {
  readonly result: PaymentExitResult;
  readonly isNative: boolean;
  readonly setConfirmLeave: (visible: boolean) => void;
  readonly setLeaveWithoutCancel: (enabled: boolean) => void;
  readonly setLeaveError: (message?: string) => void;
  readonly resetSession: () => void;
  readonly goHome: () => void;
  readonly goSuccess: () => void;
  readonly goExpired: () => void;
  readonly goFailed: () => void;
  readonly notifyCancelled: () => void;
}

export function applyPaymentExitResult(
  actions: PaymentExitResultActions,
): void {
  const { result } = actions;
  if (result.kind === "paid") {
    actions.setConfirmLeave(false);
    actions.goSuccess();
    return;
  }
  if (result.kind === "failed") {
    actions.setConfirmLeave(false);
    actions.goFailed();
    return;
  }
  if (result.kind === "cancelled" || result.kind === "expired") {
    actions.setConfirmLeave(false);
    if (result.kind === "cancelled" && actions.isNative) {
      actions.notifyCancelled();
    }
    actions.resetSession();
    if (result.kind === "expired") actions.goExpired();
    else actions.goHome();
    return;
  }
  if (result.kind === "active") {
    actions.setLeaveWithoutCancel(true);
    actions.setLeaveError(
      "Pembayaran masih aktif di SNAP dan belum dapat dibatalkan. Kamu dapat kembali ke SNAP atau keluar lalu melanjutkannya nanti.",
    );
    return;
  }
  actions.setLeaveError(result.message);
}

export function isTerminalPaymentStatus(
  status: PaymentStatus | undefined,
): status is TerminalStatus {
  return status === "PAID" || status === "FAILED" || status === "EXPIRED";
}

interface ServerClockPort {
  readonly remaining: (expiresAt: string) => number;
  readonly sync: (serverTime: string) => void;
}

interface PaymentExpiryRecovery {
  readonly inFlight: MutableValue<boolean>;
  readonly isOffline: boolean;
  readonly bookingId: string;
  readonly setError: (message?: string) => void;
  readonly setVerifying: (value: boolean) => void;
  readonly reconcile: () => Promise<PaymentAttempt>;
  readonly serverClock: ServerClockPort;
  readonly clearJourney: () => Promise<unknown>;
  readonly showSuccess: () => void;
  readonly showFailure: () => void;
  readonly paymentExpiresAt?: string;
  readonly refreshPage: () => Promise<{
    readonly isError?: boolean;
    readonly error?: Error | null;
  }>;
}

export async function reconcileExpiredPaymentStatus(
  recovery: PaymentExpiryRecovery,
): Promise<void> {
  if (recovery.inFlight.current) return;
  if (recovery.isOffline) {
    recovery.setError(
      "Koneksi terputus. Status pembayaran akan diperiksa saat koneksi kembali.",
    );
    return;
  }
  recovery.inFlight.current = true;
  recovery.setVerifying(true);
  recovery.setError(undefined);
  try {
    const status = await recovery.reconcile();
    if (status.serverTime) recovery.serverClock.sync(status.serverTime);
    if (status.status === "PAID") {
      void recovery.clearJourney().catch(() => undefined);
      recovery.showSuccess();
      return;
    }
    if (status.status === "FAILED" || status.status === "EXPIRED") {
      void recovery.clearJourney().catch(() => undefined);
      recovery.showFailure();
      return;
    }
    const deadline = status.paymentExpiresAt ?? recovery.paymentExpiresAt;
    if (deadline && recovery.serverClock.remaining(deadline) > 0) {
      const refreshed = await recovery.refreshPage();
      if (refreshed.isError) {
        throw refreshed.error ?? new Error("Payment page refresh failed");
      }
      recovery.setError(undefined);
      return;
    }
    recovery.setError(
      "Pembayaran masih menunggu konfirmasi server. Periksa status lagi sebelum melanjutkan.",
    );
  } catch (error) {
    recovery.setError(
      apiErrorMessage(
        error,
        "Status pembayaran belum dapat dipastikan. Periksa koneksi lalu coba lagi.",
      ),
    );
  } finally {
    recovery.inFlight.current = false;
    recovery.setVerifying(false);
  }
}

interface UnavailablePageRecovery {
  readonly pageError: Error | null | undefined;
  readonly checkedPage: MutableValue<Error | null>;
  readonly isOffline: boolean;
  readonly verify: () => Promise<PaymentAttempt>;
  readonly syncServerTime: (value: string) => void;
  readonly clearJourney: () => Promise<unknown>;
  readonly clearQueue: () => Promise<unknown>;
  readonly resetSession: () => void;
  readonly showSuccess: () => void;
  readonly showHome: () => void;
}

export function recoverUnavailablePaymentPage(
  recovery: UnavailablePageRecovery,
): () => void {
  const { pageError, checkedPage, isOffline } = recovery;
  if (
    !pageError ||
    !pageError.message.includes("BOOKING_NOT_PAYABLE") ||
    checkedPage.current === pageError ||
    isOffline
  ) {
    return () => undefined;
  }

  checkedPage.current = pageError;
  let active = true;
  void recovery
    .verify()
    .then(async (status) => {
      if (!active) return;
      if (status.serverTime) recovery.syncServerTime(status.serverTime);
      if (status.status === "PAID") {
        await recovery.clearJourney();
        if (active) recovery.showSuccess();
        return;
      }
      if (status.status === "EXPIRED" || status.status === "FAILED") {
        await Promise.all([recovery.clearJourney(), recovery.clearQueue()]);
        if (active) {
          recovery.resetSession();
          recovery.showHome();
        }
      }
    })
    .catch(() => undefined);
  return () => {
    active = false;
  };
}

export function routeTerminalPaymentStatus(
  status: PaymentStatus | undefined,
  bookingId: string,
  clearJourney: () => Promise<unknown>,
  showSuccess: () => void,
  showFailure: (bookingId: string) => void,
): void {
  if (!isTerminalPaymentStatus(status)) return;
  void clearJourney().catch(() => undefined);
  if (status === "PAID") showSuccess();
  else showFailure(bookingId);
}

export function reconcilePaymentOnReconnect(
  isReconnected: boolean,
  handled: MutableValue<boolean>,
  hasRecoveryError: boolean,
  isExpired: boolean,
  reconcile: () => void,
): void {
  if (!isReconnected) {
    handled.current = false;
    return;
  }
  if (!handled.current && (hasRecoveryError || isExpired)) {
    handled.current = true;
    reconcile();
  }
}

interface PaymentNotificationOptions {
  readonly isNative: boolean;
  readonly status: PaymentStatus | undefined;
  readonly bookingId: string;
  readonly remainingMs: number;
  readonly schedule: (
    notification: ReturnType<typeof paymentTimeout>,
  ) => Promise<unknown>;
  readonly cancel: (notificationId: string) => Promise<unknown>;
}

export function updatePaymentNotification(
  options: PaymentNotificationOptions,
): void {
  if (!options.isNative) return;
  if (isTerminalPaymentStatus(options.status)) {
    const outcome = paymentResultNotification(
      options.status,
      options.bookingId,
    );
    void options
      .cancel(`payment-timeout-${options.bookingId}`)
      .catch(() => undefined)
      .then(() => options.schedule(outcome))
      .catch(() => undefined);
    return;
  }
  if (options.remainingMs <= 0) return;
  void options
    .schedule(
      paymentTimeout(options.bookingId, Date.now() + options.remainingMs),
    )
    .catch(() => undefined);
}
