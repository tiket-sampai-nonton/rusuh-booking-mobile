import { CreateBookingSession } from "@application/booking/create-booking-session.use-case";
import { RestoreBookingSession } from "@application/booking/restore-booking-session.use-case";
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
};

class FakeBookingRepo implements BookingRepository {
  current: BookingSession | null = SESSION;
  createdFor: string[] = [];
  async createSession(eventId: string): Promise<BookingSession> {
    this.createdFor.push(eventId);
    return { ...SESSION, eventId };
  }
  async getCurrentSession(): Promise<BookingSession | null> {
    return this.current;
  }
  async checkAttendee(_s: string, _n: string): Promise<AttendeeCheck> {
    return { nikMasked: "3***", result: "AVAILABLE" };
  }
  async hold(
    _s: string,
    _i: readonly BookingItemInput[],
    _k: string,
  ): Promise<Booking> {
    return { bookingId: "b1", sessionId: "sess-1", status: "HELD", amountMinor: 1 };
  }
}

describe("CreateBookingSession", () => {
  it("creates a session via the port for the admitted event", async () => {
    const repo = new FakeBookingRepo();
    const out = await new CreateBookingSession(repo).execute("evt-9");
    expect(repo.createdFor).toEqual(["evt-9"]);
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
});
