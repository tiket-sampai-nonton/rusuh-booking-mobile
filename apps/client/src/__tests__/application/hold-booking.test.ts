import { GetCurrentSession } from "@application/use-cases/booking-session";
import { CheckAttendee, HoldBooking } from "@application/use-cases/hold-booking";
import { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import type {
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import type { TicketRow } from "@domain/rules/checkout";
import { InMemoryIdempotencyStore } from "@infrastructure/__fixtures__/in-memory-idempotency-store";

const BUYER = "3201019999999999";
const NIK_A = "3201010101010001";

function rows(): TicketRow[] {
  return [
    { categoryId: "REG", attendeeName: "Andi", attendeeNik: NIK_A, useBuyerNik: false },
    { categoryId: "VIP", attendeeName: "", attendeeNik: "", useBuyerNik: true },
  ];
}

function bookingRepo(overrides: Partial<BookingRepository> = {}): BookingRepository {
  return {
    createSession: async () => ({ sessionId: "s", eventId: "e", expiresAt: "" }),
    getCurrentSession: async () => null,
    checkAttendee: async (_s, nik) => ({ nikMasked: nik, result: "AVAILABLE" }),
    hold: async (sessionId, _items, _key): Promise<Booking> => ({
      bookingId: `bk-${sessionId}`,
      sessionId,
      status: "HELD",
      amountMinor: 90000000,
    }),
    ...overrides,
  };
}

describe("HoldBooking", () => {
  it("maps rows to items, resolving the buyer NIK on a useBuyerNik row", async () => {
    let captured: readonly BookingItemInput[] = [];
    const repo = bookingRepo({
      hold: async (sessionId, items) => {
        captured = items;
        return { bookingId: "bk-1", sessionId, status: "HELD", amountMinor: 0 };
      },
    });
    const keys = new IdempotencyKeys(new InMemoryIdempotencyStore());
    await new HoldBooking(repo, keys).execute("sess-1", rows(), BUYER);
    expect(captured).toEqual([
      { categoryId: "REG", attendeeName: "Andi", attendeeNik: NIK_A },
      { categoryId: "VIP", attendeeName: "Pembeli", attendeeNik: BUYER },
    ]);
  });

  it("reuses one idempotency key across the hold, then clears it", async () => {
    const seenKeys: string[] = [];
    const repo = bookingRepo({
      hold: async (sessionId, _items, key) => {
        seenKeys.push(key);
        return { bookingId: "bk-1", sessionId, status: "HELD", amountMinor: 0 };
      },
    });
    const store = new InMemoryIdempotencyStore();
    const keys = new IdempotencyKeys(store);
    await new HoldBooking(repo, keys).execute("sess-1", rows(), BUYER);
    // Key cleared after a terminal success.
    expect(store.get("hold-sess-1")).toBeUndefined();
    expect(seenKeys).toHaveLength(1);
    expect(seenKeys[0]).toMatch(/^idem_/);
  });

  it("propagates a hold error", async () => {
    const repo = bookingRepo({
      hold: async () => {
        throw new Error("BUYER_QUOTA_EXHAUSTED");
      },
    });
    const keys = new IdempotencyKeys(new InMemoryIdempotencyStore());
    await expect(
      new HoldBooking(repo, keys).execute("sess-1", rows(), BUYER),
    ).rejects.toThrow("BUYER_QUOTA_EXHAUSTED");
  });
});

describe("CheckAttendee", () => {
  it("delegates to the repository", async () => {
    const repo = bookingRepo();
    const result = await new CheckAttendee(repo).execute("sess-1", NIK_A);
    expect(result.result).toBe("AVAILABLE");
  });
});

describe("GetCurrentSession", () => {
  it("returns the restored session", async () => {
    const session: BookingSession = { sessionId: "s1", eventId: "e1", expiresAt: "x" };
    const repo = bookingRepo({ getCurrentSession: async () => session });
    expect(await new GetCurrentSession(repo).execute()).toEqual(session);
  });

  it("returns null when there is no session", async () => {
    expect(await new GetCurrentSession(bookingRepo()).execute()).toBeNull();
  });
});
