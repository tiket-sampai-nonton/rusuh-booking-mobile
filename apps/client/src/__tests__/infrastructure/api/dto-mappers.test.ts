import type { PaymentMethod } from "@domain/repositories/payment.repository";
import { toPaymentPage } from "@infrastructure/api/dto-mappers";

describe("toPaymentPage", () => {
  const page = {
    bookingId: "booking-1",
    methods: ["QRIS"] as PaymentMethod[],
    amountMinor: 45000000,
    paymentExpiresAt: "2026-11-05T10:10:00Z",
    serverTime: "2026-11-05T10:00:00Z",
  };

  it("preserves the page when no current attempt exists", () => {
    expect(toPaymentPage(page)).toEqual({ ...page, currentAttempt: undefined });
  });

  it("maps a restored current attempt", () => {
    expect(toPaymentPage({
      ...page,
      currentAttempt: {
        attemptId: "attempt-1",
        bookingId: "booking-1",
        status: "AWAITING_PAYMENT",
      },
    }).currentAttempt).toMatchObject({
      attemptId: "attempt-1",
      bookingId: "booking-1",
      status: "AWAITING_PAYMENT",
    });
  });
});
