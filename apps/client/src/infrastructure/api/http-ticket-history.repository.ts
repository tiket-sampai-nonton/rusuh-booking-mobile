import type { TokenStorage } from "@domain/auth/token-storage.port";
import type {
  BookingTickets,
  MyBookingStatus,
  MyBookingSummary,
  TicketHistoryRepository,
} from "@domain/repositories/ticket-history.repository";
import { unwrap } from "@infrastructure/api/envelope";
import type { HttpClient } from "@infrastructure/http/http-client";

type BookingHistoryWire = {
  bookings?: {
    bookingId?: string;
    publicRef?: string;
    eventName?: string;
    status?: MyBookingStatus;
    amountMinor?: number;
    createdAt?: string;
  }[];
  nextCursor?: string | null;
};

type BookingTicketsWire = BookingTickets;

/** Authenticated ticket history adapter; only masked identity and QR payloads leave the API. */
export class HttpTicketHistoryRepository implements TicketHistoryRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorage,
  ) {}

  async listMyBookings(cursor?: string, limit = 20) {
    const params = new URLSearchParams({
      limit: String(Math.min(50, Math.max(1, limit))),
    });
    if (cursor) params.set("cursor", cursor);
    const token = await this.tokenStorage.load();
    const res = await this.http.request({
      method: "GET",
      url: `me/bookings?${params.toString()}`,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = unwrap<BookingHistoryWire>(res);
    const bookings: MyBookingSummary[] = (data.bookings ?? []).flatMap(
      (item) => {
        if (!item.bookingId) return [];
        return [
          {
            bookingId: item.bookingId,
            publicRef: item.publicRef ?? item.bookingId,
            eventName: item.eventName ?? "Event",
            status: item.status ?? "REVIEW",
            amountMinor: item.amountMinor ?? 0,
            createdAt: item.createdAt,
          },
        ];
      },
    );
    return { bookings, nextCursor: data.nextCursor };
  }

  async getBookingTickets(bookingId: string): Promise<BookingTickets> {
    const token = await this.tokenStorage.load();
    const res = await this.http.request({
      method: "GET",
      url: `bookings/${encodeURIComponent(bookingId)}/tickets`,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return unwrap<BookingTicketsWire>(res);
  }
}
