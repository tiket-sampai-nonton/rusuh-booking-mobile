/** Read-only, authenticated e-ticket history contract (Booking Service API). */
export type MyBookingStatus = "PENDING_PAYMENT" | "VERIFYING" | "PAID" | "EXPIRED" | "CANCELLED" | "REVIEW";

export interface MyBookingSummary {
  readonly bookingId: string;
  readonly publicRef: string;
  readonly eventName: string;
  readonly status: MyBookingStatus;
  readonly amountMinor: number;
  readonly createdAt?: string;
}

export interface BookingTicket {
  readonly ticketCode: string;
  readonly categoryCode: string;
  readonly attendeeName: string;
  readonly attendeeNikMasked: string;
  readonly qrPayload: string;
}

export interface BookingTickets {
  readonly bookingId: string;
  readonly orderId: string;
  readonly publicRef: string;
  readonly amountMinor: number;
  readonly ticketQuantity: number;
  readonly buyerNikMasked: string;
  readonly tickets: readonly BookingTicket[];
}

export interface TicketHistoryRepository {
  listMyBookings(cursor?: string, limit?: number): Promise<{
    readonly bookings: readonly MyBookingSummary[];
    readonly nextCursor?: string | null;
  }>;
  getBookingTickets(bookingId: string): Promise<BookingTickets>;
}
