import { CancelBookingSession } from "@application/booking/cancel-booking-session.use-case";
import type { BookingRepository } from "@domain/repositories/booking.repository";

describe("CancelBookingSession", () => {
  it("delegates session release to the booking port", async () => {
    const cancelSession = jest.fn().mockResolvedValue(undefined);
    const repository = {
      cancelSession,
    } as unknown as BookingRepository;

    await new CancelBookingSession(repository).execute("session-1");

    expect(cancelSession).toHaveBeenCalledWith("session-1");
  });

  it("treats cancellation as a no-op when the adapter does not support it", async () => {
    const repository = {} as BookingRepository;

    await expect(
      new CancelBookingSession(repository).execute("session-1"),
    ).resolves.toBeUndefined();
  });
});
