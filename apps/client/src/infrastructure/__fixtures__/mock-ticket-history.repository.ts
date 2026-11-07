import type {
  BookingTickets,
  TicketHistoryRepository,
} from "@domain/repositories/ticket-history.repository";

/** Empty account history in mock mode; guests and test accounts have no saved orders. */
export class MockTicketHistoryRepository implements TicketHistoryRepository {
  constructor(
    private readonly resolveTickets?: (
      bookingId: string,
    ) => Promise<BookingTickets | undefined>,
  ) {}
  async listMyBookings() {
    return { bookings: [], nextCursor: null };
  }

  async getBookingTickets(bookingId: string): Promise<BookingTickets> {
    const tickets = await this.resolveTickets?.(bookingId);
    if (tickets) return tickets;
    throw new Error(`No saved tickets for booking ${bookingId} in mock mode.`);
  }
}
