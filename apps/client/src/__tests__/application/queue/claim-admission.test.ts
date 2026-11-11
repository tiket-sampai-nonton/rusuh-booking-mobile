/**
 * RBT-044 — ClaimAdmission use-case unit tests.
 *
 * Pure-TS tests against a FAKE BookingRepository (no React/RN). They assert:
 *  - an ADMITTED status claims a one-use token then exchanges it for a session
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
import type {
  QueueEntry,
  QueueRepository,
  QueueStatusSnapshot,
} from "@domain/repositories/queue.repository";

class FakeQueueRepository implements QueueRepository {
  public claimCalls: [string, string][] = [];
  public claimError: Error | null = null;
  async join(eventId: string): Promise<QueueEntry> {
    return { queueId: "q-1", eventId, position: 1, status: "WAITING" };
  }
  async getStatus(): Promise<QueueEntry> {
    return { queueId: "q-1", eventId: "evt-1", position: 1, status: "WAITING" };
  }
  async getQueueStatus(): Promise<QueueStatusSnapshot> {
    return {};
  }
  async leave(): Promise<void> {}
  async claim(queueId: string, eventId: string): Promise<string> {
    this.claimCalls.push([queueId, eventId]);
    if (this.claimError) throw this.claimError;
    return `admission:${eventId}`;
  }
  async heartbeat(): Promise<number | undefined> {
    return undefined;
  }
}

class FakeBookingRepository implements BookingRepository {
  public createSessionCalls: string[] = [];
  public nextSession: BookingSession = {
    sessionId: "sess-1",
    eventId: "evt-1",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    categories: [],
  };
  public createSessionError: Error | null = null;

  async createSession(admissionToken: string): Promise<BookingSession> {
    this.createSessionCalls.push(admissionToken);
    if (this.createSessionError) throw this.createSessionError;
    const eventId = admissionToken.replace(/^admission:/, "");
    return { ...this.nextSession, eventId };
  }
  public currentSession: BookingSession | null = null;
  public currentCalls: (string | undefined)[] = [];
  async getCurrentSession(eventId?: string): Promise<BookingSession | null> {
    this.currentCalls.push(eventId);
    return this.currentSession;
  }
  async checkAttendee(_sessionId: string, nik: string): Promise<AttendeeCheck> {
    return { nikMasked: nik, result: "AVAILABLE" };
  }
  async hold(
    sessionId: string,
    _items: readonly BookingItemInput[],
    _idempotencyKey: string,
    _buyer: NonNullable<Parameters<BookingRepository["hold"]>[3]>,
  ): Promise<Booking> {
    return { bookingId: "bk-1", sessionId, status: "HELD", amountMinor: 0 };
  }
}

describe("ClaimAdmission", () => {
  it("claims the queue entry and exchanges its token for a session", async () => {
    const repo = new FakeBookingRepository();
    const queue = new FakeQueueRepository();
    const session = await new ClaimAdmission(repo, queue).execute(
      "evt-9",
      "ADMITTED",
      "q-9",
    );
    expect(queue.claimCalls).toEqual([["q-9", "evt-9"]]);
    expect(repo.createSessionCalls).toEqual(["admission:evt-9"]);
    expect(session.sessionId).toBe("sess-1");
    expect(session.eventId).toBe("evt-9");
  });

  it.each(["WAITING", "CLAIMED", "MISSED", "SOLD_OUT", "ENDED"] as const)(
    "rejects a non-authorized status (%s) WITHOUT calling the port",
    async (status) => {
      const repo = new FakeBookingRepository();
      const queue = new FakeQueueRepository();
      await expect(
        new ClaimAdmission(repo, queue).execute("evt-1", status, "q-1"),
      ).rejects.toMatchObject({ code: "CLAIM_NOT_AUTHORIZED" });
      expect(repo.createSessionCalls).toEqual([]);
      expect(queue.claimCalls).toEqual([]);
    },
  );

  it("passes through a typed TURN_MISSED DomainError", async () => {
    const repo = new FakeBookingRepository();
    const queue = new FakeQueueRepository();
    repo.createSessionError = mapError({ code: "TURN_MISSED" });
    const err = await new ClaimAdmission(repo, queue)
      .execute("evt-1", "ADMITTED", "q-1")
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("TURN_MISSED");
  });

  it("passes through a typed EVENT_SOLD_OUT DomainError", async () => {
    const repo = new FakeBookingRepository();
    const queue = new FakeQueueRepository();
    repo.createSessionError = mapError({ code: "EVENT_SOLD_OUT" });
    const err = await new ClaimAdmission(repo, queue)
      .execute("evt-1", "ADMITTED", "q-1")
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("EVENT_SOLD_OUT");
    expect((err as DomainError).kind).toBe("sold_out");
  });

  it("maps an untyped failure to a dependency error", async () => {
    const repo = new FakeBookingRepository();
    const queue = new FakeQueueRepository();
    repo.createSessionError = new Error("network down");
    const err = await new ClaimAdmission(repo, queue)
      .execute("evt-1", "ADMITTED", "q-1")
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("DEPENDENCY_UNAVAILABLE");
  });

  it("resumes the live session when the admission token was already spent", async () => {
    const repo = new FakeBookingRepository();
    repo.createSessionError = mapError({ code: "ADMISSION_TOKEN_INVALID" });
    repo.currentSession = { ...repo.nextSession, sessionId: "sess-live" };
    const session = await new ClaimAdmission(
      repo,
      new FakeQueueRepository(),
    ).execute("evt-9", "ADMITTED", "q-9");
    expect(session.sessionId).toBe("sess-live");
    expect(repo.currentCalls).toEqual(["evt-9"]);
  });

  it("rethrows ADMISSION_TOKEN_INVALID when no live session exists", async () => {
    const repo = new FakeBookingRepository();
    repo.createSessionError = mapError({ code: "ADMISSION_TOKEN_INVALID" });
    await expect(
      new ClaimAdmission(repo, new FakeQueueRepository()).execute(
        "evt-9",
        "ADMITTED",
        "q-9",
      ),
    ).rejects.toMatchObject({ code: "ADMISSION_TOKEN_INVALID" });
  });
});
