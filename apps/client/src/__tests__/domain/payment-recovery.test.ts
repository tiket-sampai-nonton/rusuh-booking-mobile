/**
 * RBT-064 — payment-recovery domain rule (pure).
 * decideRecovery / isRetryable / requeueRoute.
 */
import {
  decideRecovery,
  isRetryable,
  requeueRoute,
} from "@domain/rules/payment-recovery";

describe("decideRecovery", () => {
  it("FAILED + payable (time left, no not-payable code) → retry", () => {
    expect(decideRecovery("FAILED", 60_000)).toEqual({ kind: "retry" });
  });

  it("FAILED but deadline passed → requeue (nothing to retry)", () => {
    expect(decideRecovery("FAILED", 0)).toEqual({ kind: "requeue" });
    expect(decideRecovery("FAILED", -1)).toEqual({ kind: "requeue" });
  });

  it("FAILED but BOOKING_NOT_PAYABLE → requeue", () => {
    expect(decideRecovery("FAILED", 60_000, "BOOKING_NOT_PAYABLE")).toEqual({
      kind: "requeue",
    });
  });

  it("other not-payable codes (BOOKING_EXPIRED / HOLD_EXPIRED) → requeue", () => {
    expect(decideRecovery("FAILED", 60_000, "BOOKING_EXPIRED")).toEqual({
      kind: "requeue",
    });
    expect(decideRecovery("FAILED", 60_000, "HOLD_EXPIRED")).toEqual({
      kind: "requeue",
    });
  });

  it("EXPIRED / PAID / pending / unknown → requeue (never offer a dead retry)", () => {
    expect(decideRecovery("EXPIRED", 60_000)).toEqual({ kind: "requeue" });
    expect(decideRecovery("PAID", 60_000)).toEqual({ kind: "requeue" });
    expect(decideRecovery("AWAITING_PAYMENT", 60_000)).toEqual({
      kind: "requeue",
    });
    expect(decideRecovery(undefined, 60_000)).toEqual({ kind: "requeue" });
  });

  it("an unrelated error code does not block a payable FAILED retry", () => {
    expect(decideRecovery("FAILED", 60_000, "SOMETHING_ELSE")).toEqual({
      kind: "retry",
    });
  });
});

describe("isRetryable", () => {
  it("mirrors decideRecovery", () => {
    expect(isRetryable("FAILED", 60_000)).toBe(true);
    expect(isRetryable("FAILED", 0)).toBe(false);
    expect(isRetryable("FAILED", 60_000, "BOOKING_NOT_PAYABLE")).toBe(false);
    expect(isRetryable("EXPIRED", 60_000)).toBe(false);
  });
});

describe("requeueRoute", () => {
  it("payment/hold with an eventId → the event page to create a new queue entry", () => {
    expect(requeueRoute("payment", "evt-7")).toBe("/events/evt-7");
    expect(requeueRoute("hold", "evt-7")).toBe("/events/evt-7");
  });
  it("queue reason → browse", () => {
    expect(requeueRoute("queue", "evt-7")).toBe("/browse");
  });
  it("turn reason → browse (must rejoin from the back)", () => {
    expect(requeueRoute("turn", "evt-7")).toBe("/browse");
  });
  it("no eventId → browse (cannot target a waiting room)", () => {
    expect(requeueRoute("payment")).toBe("/browse");
    expect(requeueRoute("hold")).toBe("/browse");
  });
});
