import { HoldBooking } from "@application/booking/hold-booking.use-case";
import { DomainError } from "@domain/errors/domain-error";
import { mapError } from "@domain/errors/error-mapper";
import { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import { InMemoryIdempotencyStore } from "@infrastructure/__fixtures__/in-memory-idempotency-store";
import type { TicketRow } from "@domain/rules/checkout";

let rowSeq = 0;
const row = (over: Partial<TicketRow> = {}): TicketRow => ({
  rowId: `row-${++rowSeq}`,
  categoryId: "REG",
  attendeeName: "A",
  attendeeNik: "3171010101010001",
  useBuyerNik: false,
  ...over,
});

class FakeRepo implements BookingRepository {
  held: { items: readonly BookingItemInput[]; key: string }[] = [];
  /** When set, hold throws this instead of succeeding. */
  throwOnHold: Error | null = null;
  async createSession(eventId: string): Promise<BookingSession> {
    return { sessionId: "s", eventId, expiresAt: "", maxSelectable: 3 };
  }
  async getCurrentSession(): Promise<BookingSession | null> {
    return null;
  }
  async checkAttendee(_s: string, _n: string): Promise<AttendeeCheck> {
    return { nikMasked: "3***", result: "AVAILABLE" };
  }
  async setBuyer(): Promise<void> {}
  async hold(
    _s: string,
    items: readonly BookingItemInput[],
    key: string,
  ): Promise<Booking> {
    if (this.throwOnHold) throw this.throwOnHold;
    this.held.push({ items, key });
    return { bookingId: "bk-1", sessionId: "sess-1", status: "HELD", amountMinor: 90000000 };
  }
}

function build(): { repo: FakeRepo; keys: IdempotencyKeys; uc: HoldBooking } {
  const repo = new FakeRepo();
  const keys = new IdempotencyKeys(new InMemoryIdempotencyStore());
  return { repo, keys, uc: new HoldBooking(repo, keys) };
}

describe("HoldBooking (RBT-054)", () => {
  it("maps rows to items (buyer-NIK row resolves to the buyer NIK) and holds", async () => {
    const { repo, uc } = build();
    const booking = await uc.execute(
      "sess-1",
      [row({ attendeeNik: "3171010101010001" }), row({ useBuyerNik: true, attendeeName: "", attendeeNik: "" })],
      "3171999999999999",
    );
    expect(booking.bookingId).toBe("bk-1");
    const items = repo.held[0].items;
    expect(items[0].attendeeNik).toBe("3171010101010001");
    expect(items[1].attendeeNik).toBe("3171999999999999"); // resolved buyer NIK
    expect(items[1].attendeeName).toBe("Pembeli");
  });

  it("reuses the SAME idempotency key across a retry, clears it on success", async () => {
    const { repo, keys, uc } = build();
    const actionId = HoldBooking.actionId("sess-1");
    await uc.execute("sess-1", [row()], "3171999999999999");
    const firstKey = repo.held[0].key;
    expect(firstKey).toMatch(/^idem_/);
    // After success the key is cleared → a NEW attempt mints a fresh one.
    expect(keys.peek(actionId)).toBeUndefined();
  });

  it("KEEPS the key on failure so a retry is still idempotent", async () => {
    const { repo, keys, uc } = build();
    const actionId = HoldBooking.actionId("sess-1");
    repo.throwOnHold = mapError({ code: "DEPENDENCY_UNAVAILABLE" });
    await expect(uc.execute("sess-1", [row()], "3171999999999999")).rejects.toBeInstanceOf(DomainError);
    const keptKey = keys.peek(actionId);
    expect(keptKey).toMatch(/^idem_/); // retained for an idempotent retry

    // A retry reuses the SAME key.
    repo.throwOnHold = null;
    await uc.execute("sess-1", [row()], "3171999999999999");
    expect(repo.held[0].key).toBe(keptKey);
  });

  it("passes a typed DomainError (hold conflict) straight through (FR-16)", async () => {
    const { repo, uc } = build();
    repo.throwOnHold = mapError({ code: "CATEGORY_UNAVAILABLE" });
    await expect(
      uc.execute("sess-1", [row()], "3171999999999999"),
    ).rejects.toMatchObject({ code: "CATEGORY_UNAVAILABLE", kind: "sold_out" });
  });

  it("maps an UNTYPED failure to DEPENDENCY_UNAVAILABLE", async () => {
    const { repo, uc } = build();
    repo.throwOnHold = new Error("socket hang up");
    await expect(
      uc.execute("sess-1", [row()], "3171999999999999"),
    ).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", kind: "dependency" });
  });
});
