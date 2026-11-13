import type { PaymentAttempt } from "@domain/repositories/payment.repository";
import {
  isTerminalPaymentStatus,
  reconcilePaymentOnReconnect,
  requestPaymentExit,
  recoverUnavailablePaymentPage,
  routeTerminalPaymentStatus,
  updatePaymentNotification,
} from "@presentation/screens/Payment/effects";

const attempt = (status: PaymentAttempt["status"]): PaymentAttempt => ({
  attemptId: "attempt-1",
  bookingId: "booking-1",
  status,
});

async function flushAsyncWork(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe("payment screen effects", () => {
  it("recovers an unavailable paid booking to success", async () => {
    const showSuccess = jest.fn();
    const clearJourney = jest.fn(async () => undefined);
    const cleanup = recoverUnavailablePaymentPage({
      pageError: new Error("BOOKING_NOT_PAYABLE"),
      checkedPage: { current: null },
      isOffline: false,
      verify: async () => attempt("PAID"),
      syncServerTime: jest.fn(),
      clearJourney,
      clearQueue: jest.fn(async () => undefined),
      resetSession: jest.fn(),
      showSuccess,
      showHome: jest.fn(),
    });

    await flushAsyncWork();
    expect(showSuccess).toHaveBeenCalledTimes(1);
    expect(clearJourney).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("clears an expired booking and returns home", async () => {
    const resetSession = jest.fn();
    const showHome = jest.fn();
    const clearQueue = jest.fn(async () => undefined);
    recoverUnavailablePaymentPage({
      pageError: new Error("BOOKING_NOT_PAYABLE"),
      checkedPage: { current: null },
      isOffline: false,
      verify: async () => attempt("EXPIRED"),
      syncServerTime: jest.fn(),
      clearJourney: jest.fn(async () => undefined),
      clearQueue,
      resetSession,
      showSuccess: jest.fn(),
      showHome,
    });

    await flushAsyncWork();
    expect(clearQueue).toHaveBeenCalledTimes(1);
    expect(resetSession).toHaveBeenCalledTimes(1);
    expect(showHome).toHaveBeenCalledTimes(1);
  });

  it("routes terminal payment status and reconciles once after reconnect", () => {
    const showSuccess = jest.fn();
    const showFailure = jest.fn();
    const clearJourney = jest.fn(async () => undefined);
    routeTerminalPaymentStatus(
      "PAID",
      "booking-1",
      clearJourney,
      showSuccess,
      showFailure,
    );
    expect(isTerminalPaymentStatus("EXPIRED")).toBe(true);
    expect(showSuccess).toHaveBeenCalledTimes(1);
    expect(showFailure).not.toHaveBeenCalled();

    const handled = { current: false };
    const reconcile = jest.fn();
    reconcilePaymentOnReconnect(true, handled, true, true, reconcile);
    reconcilePaymentOnReconnect(true, handled, true, true, reconcile);
    expect(reconcile).toHaveBeenCalledTimes(1);
  });

  it("keeps a confirmed payment when cancellation races with payment", async () => {
    const clearJourney = jest.fn(async () => undefined);
    const result = await requestPaymentExit({
      cancelBooking: async () => {
        throw new Error("cancel response lost");
      },
      reconcilePayment: async () => attempt("PAID"),
      clearJourney,
      clearQueue: jest.fn(async () => undefined),
      syncServerTime: jest.fn(),
    });

    expect(result).toEqual({ kind: "paid" });
    expect(clearJourney).toHaveBeenCalledTimes(1);
  });

  it("clears journey state only after the BE confirms cancellation", async () => {
    const clearJourney = jest.fn(async () => undefined);
    const clearQueue = jest.fn(async () => undefined);
    const result = await requestPaymentExit({
      cancelBooking: async () => ({
        bookingId: "booking-1",
        status: "CANCELLED",
        amountMinor: 0,
      }),
      reconcilePayment: async () => attempt("READY"),
      clearJourney,
      clearQueue,
      syncServerTime: jest.fn(),
    });

    expect(result).toEqual({ kind: "cancelled" });
    expect(clearJourney).toHaveBeenCalledTimes(1);
    expect(clearQueue).toHaveBeenCalledTimes(1);
  });

  it("schedules a native payment outcome and skips web notifications", async () => {
    const scheduled: unknown[] = [];
    const schedule = async (value: unknown): Promise<void> => {
      scheduled.push(value);
    };
    const cancel = jest.fn(async () => undefined);

    updatePaymentNotification({
      isNative: true,
      status: "PAID",
      bookingId: "booking-1",
      remainingMs: 0,
      schedule,
      cancel,
    });
    updatePaymentNotification({
      isNative: false,
      status: "READY",
      bookingId: "booking-1",
      remainingMs: 1000,
      schedule,
      cancel,
    });
    await flushAsyncWork();

    expect(cancel).toHaveBeenCalledWith("payment-timeout-booking-1");
    expect(scheduled).toHaveLength(1);
  });
});
