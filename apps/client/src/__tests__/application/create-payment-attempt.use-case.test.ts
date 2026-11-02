import {
  CreatePaymentAttempt,
  VerifyPayment,
} from "@application/payment/create-payment-attempt.use-case";
import { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import type {
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import { InMemoryIdempotencyStore } from "@infrastructure/__fixtures__/in-memory-idempotency-store";

class FakeRepo implements PaymentRepository {
  attempts: { bookingId: string; method: PaymentMethod; key: string }[] = [];
  status: PaymentAttempt["status"] = "PAID";
  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    return {
      bookingId,
      methods: ["QRIS"],
      amountMinor: 1,
      paymentExpiresAt: "",
      serverTime: "",
    };
  }
  async createAttempt(
    bookingId: string,
    method: PaymentMethod,
    key: string,
  ): Promise<PaymentAttempt> {
    this.attempts.push({ bookingId, method, key });
    return {
      attemptId: `a-${this.attempts.length}`,
      bookingId,
      status: "AWAITING_PAYMENT",
      redirectUrl: `https://snap.mock/${bookingId}`,
    };
  }
  async getStatus(attemptId: string): Promise<PaymentAttempt> {
    return { attemptId, bookingId: "b", status: this.status };
  }
}

function build(): { repo: FakeRepo; keys: IdempotencyKeys } {
  return {
    repo: new FakeRepo(),
    keys: new IdempotencyKeys(new InMemoryIdempotencyStore()),
  };
}

describe("CreatePaymentAttempt (RBT-061)", () => {
  it("mints an idempotency key per (booking, method) and reuses it on retry", async () => {
    const { repo, keys } = build();
    const uc = new CreatePaymentAttempt(repo, keys);
    const a1 = await uc.execute("bk-1", "QRIS");
    const a2 = await uc.execute("bk-1", "QRIS"); // retry same action
    expect(repo.attempts[0].key).toBe(repo.attempts[1].key); // reused
    expect(a1.redirectUrl).toContain("snap.mock");
    expect(a2.status).toBe("AWAITING_PAYMENT");
  });

  it("uses a DIFFERENT key for a different method", async () => {
    const { repo, keys } = build();
    const uc = new CreatePaymentAttempt(repo, keys);
    await uc.execute("bk-1", "QRIS");
    await uc.execute("bk-1", "GOPAY");
    expect(repo.attempts[0].key).not.toBe(repo.attempts[1].key);
  });
});

describe("VerifyPayment (RBT-061/063)", () => {
  it("reads the authoritative status from the port", async () => {
    const { repo } = build();
    repo.status = "PAID";
    const out = await new VerifyPayment(repo).execute("a-1");
    expect(out.status).toBe("PAID");
  });
});
