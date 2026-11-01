/**
 * RBT-044 — ClaimAdmission use-case unit tests.
 *
 * Pure-TS tests against a FAKE BookingRepository (no React/RN). They assert:
 *  - an ADMITTED status claims via the REAL port method `createSession(eventId)`
 *    and returns the created session (carries `sessionId` for the redirect);
 *  - a non-authorized status (WAITING / CLAIMED / terminal) is rejected BEFORE
 *    any port call (fail-closed authorization invariant, RBT-040 `authorizes`);
 *  - a typed TURN_MISSED / EVENT_SOLD_OUT DomainError is passed through untouched;
 *  - an untyped failure is mapped to a typed TURN_MISSED DomainError.
 */
import { ClaimAdmission } from "@application/queue/claim-admission.use-case";
import { DomainError } from "@domain/errors/domain-error";
import { mapError } from "@domain/errors/error-mapper";
import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";

class FakeBookingRepository implements BookingRepository {
  public createSessionCalls: string[] = [];
  public nextSession: BookingSession = {
    sessionId: "sess-1",
    eventId: "evt-1",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  };
  public createSessionError: Error | null = null;

  async createSession(eventId: string): Promise<BookingSession> {
    this.createSessionCalls.push(eventId);
    if (this.createSessionError) throw this.createSessionError;
    return { ...this.nextSession, eventId };
  }
  async getCurrentSession(): Promise<BookingSession | null> {
    return null;
  }
  async checkAttendee(_sessionId: string, nik: string): Promise<AttendeeCheck> {
    return { nikMasked: nik, result: "AVAILABLE" };
  }
  async hold(
    sessionId: string,
    _items: readonly BookingItemInput[],
    _idempotencyKey: string,
  ): Promise<Booking> {
    return { bookingId: "bk-1", sessionId, status: "HELD", amountMinor: 0 };
  }
}

describe("ClaimAdmission", () => {
  it("claims via createSession and returns the session when ADMITTED", async () => {
    const repo = new FakeBookingRepository();
    const session = await new ClaimAdmission(repo).execute("evt-9", "ADMITTED");
    expect(repo.createSessionCalls).toEqual(["evt-9"]);
    expect(session.sessionId).toBe("sess-1");
    expect(session.eventId).toBe("evt-9");
  });

  it.each(["WAITING", "CLAIMED", "MISSED", "SOLD_OUT", "ENDED"] as const)(
    "rejects a non-authorized status (%s) WITHOUT calling the port",
    async (status) => {
      const repo = new FakeBookingRepository();
      await expect(
        new ClaimAdmission(repo).execute("evt-1", status),
      ).rejects.toMatchObject({ code: "CLAIM_NOT_AUTHORIZED" });
      expect(repo.createSessionCalls).toEqual([]);
    },
  );

  it("passes through a typed TURN_MISSED DomainError", async () => {
    const repo = new FakeBookingRepository();
    repo.createSessionError = mapError({ code: "TURN_MISSED" });
    const err = await new ClaimAdmission(repo)
      .execute("evt-1", "ADMITTED")
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("TURN_MISSED");
  });

  it("passes through a typed EVENT_SOLD_OUT DomainError", async () => {
    const repo = new FakeBookingRepository();
    repo.createSessionError = mapError({ code: "EVENT_SOLD_OUT" });
    const err = await new ClaimAdmission(repo)
      .execute("evt-1", "ADMITTED")
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("EVENT_SOLD_OUT");
    expect((err as DomainError).kind).toBe("sold_out");
  });

  it("maps an untyped failure to a typed TURN_MISSED DomainError", async () => {
    const repo = new FakeBookingRepository();
    repo.createSessionError = new Error("network down");
    const err = await new ClaimAdmission(repo)
      .execute("evt-1", "ADMITTED")
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("TURN_MISSED");
  });
});
