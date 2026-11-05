import { MockTicketHistoryRepository } from "../../../infrastructure/__fixtures__/mock-ticket-history.repository";

describe("MockTicketHistoryRepository", () => {
  const repository = new MockTicketHistoryRepository();

  it("returns an empty history for mock accounts", async () => {
    await expect(repository.listMyBookings()).resolves.toEqual({ bookings: [], nextCursor: null });
  });

  it("explains that a mock booking has no saved tickets", async () => {
    await expect(repository.getBookingTickets("booking-123")).rejects.toThrow(
      "No saved tickets for booking booking-123 in mock mode.",
    );
  });
});
