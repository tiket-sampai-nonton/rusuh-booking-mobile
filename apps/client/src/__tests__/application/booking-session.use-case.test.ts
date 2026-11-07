import { CheckAttendee } from "@application/booking/check-attendee.use-case";
import { CreateBookingSession } from "@application/booking/create-booking-session.use-case";
import { RestoreBookingSession } from "@application/booking/restore-booking-session.use-case";
import { DomainError } from "@domain/errors/domain-error";
import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";

const SESSION: BookingSession = {
  sessionId: "sess-1",
  eventId: "evt-1",
  expiresAt: "2026-12-01T00:05:00.000Z",
  serverTime: "2026-12-01T00:00:00.000Z",
  maxSelectable: 3,
  categories: [],
};

class FakeBookingRepo implements BookingRepository {
  current: BookingSession | null = SESSION;
  getSessionError: Error | null = null;
  createdFor: string[] = [];
  async createSession(admissionToken: string): Promise<BookingSession> {
    this.createdFor.push(admissionToken);
    const eventId = admissionToken.replace(/^admission:/, "");
    return { ...SESSION, eventId };
  }
  async getCurrentSession(): Promise<BookingSession | null> {
    return this.current;
  }
  async getSession(): Promise<BookingSession> {
    if (this.getSessionError) throw this.getSessionError;
    return SESSION;
  }
  checkedWith: [string, string][] = [];
  async checkAttendee(sessionId: string, nik: string): Promise<AttendeeCheck> {
    this.checkedWith.push([sessionId, nik]);
    return { nikMasked: "3***", result: "AVAILABLE" };
  }
  async hold(
    _s: string,
    _i: readonly BookingItemInput[],
    _k: string,
    _buyer: NonNullable<Parameters<BookingRepository["hold"]>[3]>,
  ): Promise<Booking> {
    return {
      bookingId: "b1",
      sessionId: "sess-1",
      status: "HELD",
      amountMinor: 1,
    };
  }
}

describe("CreateBookingSession", () => {
  it("creates a session via the port for the admitted event", async () => {
    const repo = new FakeBookingRepo();
    const out = await new CreateBookingSession(repo).execute("admission:evt-9");
    expect(repo.createdFor).toEqual(["admission:evt-9"]);
    expect(out.eventId).toBe("evt-9");
    expect(out.expiresAt).toBe(SESSION.expiresAt);
  });
});

describe("RestoreBookingSession", () => {
  it("restores the current session without altering expiresAt", async () => {
    const repo = new FakeBookingRepo();
    const out = await new RestoreBookingSession(repo).execute();
    expect(out?.sessionId).toBe("sess-1");
    expect(out?.expiresAt).toBe(SESSION.expiresAt);
  });

  it("returns null when there is no active session", async () => {
    const repo = new FakeBookingRepo();
    repo.current = null;
    expect(await new RestoreBookingSession(repo).execute()).toBeNull();
  });

  it("preserves the contract session-expired error for recovery routing", async () => {
    const repo = new FakeBookingRepo();
    repo.getSessionError = new Error("SESSION_EXPIRED: selection expired");
    const error = await new RestoreBookingSession(repo)
      .execute("sess-expired")
      .catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toMatchObject({
      code: "SESSION_EXPIRED",
      kind: "session_expired",
    });
  });
});

describe("CheckAttendee (RBT-052)", () => {
  it("delegates to the port with the session + NIK and returns the verdict", async () => {
    const repo = new FakeBookingRepo();
    const out = await new CheckAttendee(repo).execute(
      "sess-1",
      "3171010101010001",
    );
    expect(repo.checkedWith).toEqual([["sess-1", "3171010101010001"]]);
    expect(out.result).toBe("AVAILABLE");
  });
});
