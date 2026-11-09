import type { PaymentMethod } from "@domain/repositories/payment.repository";
import {
  toBookingAvailability,
  toPaymentPage,
} from "@infrastructure/api/dto-mappers";

describe("toBookingAvailability", () => {
  it("maps the category counts from an SSE frame", () => {
    expect(
      toBookingAvailability({
        categories: [
          { categoryId: "cat-1", available: 4 },
          { categoryId: "cat-2", available: 0 },
        ],
        serverTime: "2026-11-09T10:00:00Z",
      }),
    ).toEqual({
      categories: [
        { categoryId: "cat-1", available: 4 },
        { categoryId: "cat-2", available: 0 },
      ],
    });
  });

  it("ignores invalid category entries and rejects an invalid envelope", () => {
    expect(
      toBookingAvailability({
        categories: [
          { categoryId: "cat-1", available: -1 },
          { categoryId: 2, available: 4 },
        ],
      }),
    ).toEqual({ categories: [] });
    expect(toBookingAvailability(null)).toBeNull();
    expect(toBookingAvailability({ data: [] })).toBeNull();
  });
});

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
    expect(
      toPaymentPage({
        ...page,
        currentAttempt: {
          attemptId: "attempt-1",
          bookingId: "booking-1",
          status: "AWAITING_PAYMENT",
        },
      }).currentAttempt,
    ).toMatchObject({
      attemptId: "attempt-1",
      bookingId: "booking-1",
      status: "AWAITING_PAYMENT",
    });
  });
});
