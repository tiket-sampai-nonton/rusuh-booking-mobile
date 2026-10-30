import { ClaimAdmission } from "@application/use-cases/claim-admission";
import { LeaveQueue, ObserveQueue } from "@application/use-cases/observe-queue";
import type {
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";

const entry: QueueEntry = {
  queueId: "q-1",
  eventId: "evt-1",
  position: 3,
  status: "WAITING",
};

function queueRepo(overrides: Partial<QueueRepository> = {}): QueueRepository {
  return {
    join: async () => entry,
    getStatus: async () => entry,
    leave: async () => {},
    ...overrides,
  };
}

describe("ObserveQueue", () => {
  it("reads the latest entry for a queue id", async () => {
    const spy = jest.fn(async () => entry);
    const result = await new ObserveQueue(queueRepo({ getStatus: spy })).execute(
      "q-1",
    );
    expect(spy).toHaveBeenCalledWith("q-1");
    expect(result.position).toBe(3);
  });
});

describe("LeaveQueue", () => {
  it("abandons the slot", async () => {
    const spy = jest.fn(async () => {});
    await new LeaveQueue(queueRepo({ leave: spy })).execute("q-1");
    expect(spy).toHaveBeenCalledWith("q-1");
  });
});

describe("ClaimAdmission", () => {
  it("creates a booking session from the event", async () => {
    const session: BookingSession = {
      sessionId: "sess-1",
      eventId: "evt-1",
      expiresAt: "2026-12-01T12:05:00.000Z",
    };
    const booking: BookingRepository = {
      createSession: jest.fn(async () => session),
      getCurrentSession: async () => null,
      checkAttendee: async () => ({ nikMasked: "", result: "AVAILABLE" }),
      hold: async () => ({
        bookingId: "bk",
        sessionId: "sess-1",
        status: "HELD",
        amountMinor: 0,
      }),
    };
    const result = await new ClaimAdmission(booking).execute("evt-1");
    expect(booking.createSession).toHaveBeenCalledWith("evt-1");
    expect(result.sessionId).toBe("sess-1");
  });
});
