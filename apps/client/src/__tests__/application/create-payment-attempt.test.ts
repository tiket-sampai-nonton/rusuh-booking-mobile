import {
  CreatePaymentAttempt,
  VerifyPayment,
} from "@application/use-cases/create-payment-attempt";
import { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import type {
  PaymentAttempt,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import { InMemoryIdempotencyStore } from "@infrastructure/__fixtures__/in-memory-idempotency-store";

const attempt: PaymentAttempt = {
  attemptId: "pay-1",
  bookingId: "bk-1",
  status: "AWAITING_PAYMENT",
  redirectUrl: "https://snap.mock/bk-1",
};

function paymentRepo(overrides: Partial<PaymentRepository> = {}): PaymentRepository {
  return {
    createAttempt: async (bookingId) => ({ ...attempt, bookingId }),
    getStatus: async () => attempt,
    ...overrides,
  };
}

describe("CreatePaymentAttempt", () => {
  it("mints a per-(booking,method) idempotency key and creates the attempt", async () => {
    let seenKey = "";
    const repo = paymentRepo({
      createAttempt: async (_b, _m, key) => {
        seenKey = key;
        return attempt;
      },
    });
    const keys = new IdempotencyKeys(new InMemoryIdempotencyStore());
    const result = await new CreatePaymentAttempt(repo, keys).execute("bk-1", "QRIS");
    expect(result.redirectUrl).toBe("https://snap.mock/bk-1");
    expect(seenKey).toMatch(/^idem_/);
  });

  it("reuses the same key for a repeated (booking,method) attempt", async () => {
    const keys = jest.fn();
    const store = new InMemoryIdempotencyStore();
    const idem = new IdempotencyKeys(store);
    const seen: string[] = [];
    const repo = paymentRepo({
      createAttempt: async (_b, _m, key) => {
        seen.push(key);
        return attempt;
      },
    });
    await new CreatePaymentAttempt(repo, idem).execute("bk-1", "QRIS");
    await new CreatePaymentAttempt(repo, idem).execute("bk-1", "QRIS");
    expect(seen[0]).toBe(seen[1]); // same key reused (idempotent)
    void keys;
  });
});

describe("VerifyPayment", () => {
  it("reads the authoritative status by attempt id", async () => {
    const paid: PaymentAttempt = { ...attempt, status: "PAID" };
    const repo = paymentRepo({ getStatus: async () => paid });
    const result = await new VerifyPayment(repo).execute("pay-1");
    expect(result.status).toBe("PAID");
  });
});
