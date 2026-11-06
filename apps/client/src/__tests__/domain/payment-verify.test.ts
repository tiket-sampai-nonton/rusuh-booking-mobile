/**
 * RBT-063 — payment-verify domain rule (pure, timer-free).
 * classify / terminal / backoff interval / authoritative routing.
 */
import type { PaymentStatus } from "@domain/repositories/payment.repository";
import {
  classifyPayment,
  computeVerifyRefetchInterval,
  isPaymentTerminal,
  resolvePaymentRoute,
} from "@domain/rules/payment-verify";

describe("classifyPayment", () => {
  it("PAID → paid (the only success)", () => {
    expect(classifyPayment("PAID")).toBe("paid");
  });
  it("FAILED and EXPIRED → failed", () => {
    expect(classifyPayment("FAILED")).toBe("failed");
    expect(classifyPayment("EXPIRED")).toBe("failed");
  });
  it("READY and AWAITING_PAYMENT → pending", () => {
    expect(classifyPayment("READY")).toBe("pending");
    expect(classifyPayment("AWAITING_PAYMENT")).toBe("pending");
  });
});

describe("isPaymentTerminal", () => {
  it("true for PAID/FAILED/EXPIRED, false for pending states", () => {
    expect(isPaymentTerminal("PAID")).toBe(true);
    expect(isPaymentTerminal("FAILED")).toBe(true);
    expect(isPaymentTerminal("EXPIRED")).toBe(true);
    expect(isPaymentTerminal("AWAITING_PAYMENT")).toBe(false);
    expect(isPaymentTerminal("READY")).toBe(false);
  });
});

describe("computeVerifyRefetchInterval", () => {
  it("stops (false) on any terminal status", () => {
    expect(computeVerifyRefetchInterval("PAID", 0)).toBe(false);
    expect(computeVerifyRefetchInterval("FAILED", 3)).toBe(false);
    expect(computeVerifyRefetchInterval("EXPIRED", 1)).toBe(false);
  });
  it("backs off per poll count while pending, clamping to the last step", () => {
    expect(computeVerifyRefetchInterval("AWAITING_PAYMENT", 0)).toBe(1_500);
    expect(computeVerifyRefetchInterval("AWAITING_PAYMENT", 1)).toBe(2_500);
    expect(computeVerifyRefetchInterval("AWAITING_PAYMENT", 4)).toBe(8_000);
    expect(computeVerifyRefetchInterval("AWAITING_PAYMENT", 99)).toBe(8_000);
  });
  it("polls at the floor when there is no status yet", () => {
    expect(computeVerifyRefetchInterval(undefined, 0)).toBe(1_500);
  });
  it("negative attempt clamps to the first step", () => {
    expect(computeVerifyRefetchInterval("READY", -5)).toBe(1_500);
  });
  it("reduced-motion raises the floor", () => {
    expect(computeVerifyRefetchInterval("AWAITING_PAYMENT", 0, true)).toBe(
      2_500,
    );
    // a larger step is unaffected
    expect(computeVerifyRefetchInterval("AWAITING_PAYMENT", 3, true)).toBe(
      6_000,
    );
  });
});

describe("resolvePaymentRoute", () => {
  const b = "bk-9";
  it("PAID → /success", () => {
    expect(resolvePaymentRoute("PAID", b, 1_000)).toBe(`/success/${b}`);
  });
  it("FAILED/EXPIRED → /expired with reason=payment + status (RBT-064 recovery)", () => {
    expect(resolvePaymentRoute("FAILED", b, 1_000)).toBe(
      `/expired/${b}?reason=payment&bookingId=${b}&status=FAILED`,
    );
    expect(resolvePaymentRoute("EXPIRED", b, 1_000)).toBe(
      `/expired/${b}?reason=payment&bookingId=${b}&status=EXPIRED`,
    );
  });
  it("pending with time left → null (stay + keep polling)", () => {
    expect(resolvePaymentRoute("AWAITING_PAYMENT", b, 5_000)).toBeNull();
  });
  it("pending past the SERVER deadline → /expired with reason=payment (reconciled)", () => {
    expect(resolvePaymentRoute("AWAITING_PAYMENT", b, 0)).toBe(
      `/expired/${b}?reason=payment&bookingId=${b}&status=AWAITING_PAYMENT`,
    );
    expect(resolvePaymentRoute("READY", b, -1)).toBe(
      `/expired/${b}?reason=payment&bookingId=${b}&status=READY`,
    );
  });
  it("no status → null", () => {
    expect(
      resolvePaymentRoute(undefined as unknown as PaymentStatus, b, 1_000),
    ).toBeNull();
  });
});
