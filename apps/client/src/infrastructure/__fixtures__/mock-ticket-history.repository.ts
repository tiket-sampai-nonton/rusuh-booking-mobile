import type {
  BookingTickets,
  TicketHistoryRepository,
} from "@domain/repositories/ticket-history.repository";

/** Empty account history in mock mode; guests and test accounts have no saved orders. */
export class MockTicketHistoryRepository implements TicketHistoryRepository {
  async listMyBookings() {
    return { bookings: [], nextCursor: null };
  }

  async getBookingTickets(bookingId: string): Promise<BookingTickets> {
    throw new Error(`No saved tickets for booking ${bookingId} in mock mode.`);
  }
}
