/**
 * HttpBookingRepository — infrastructure/api (ARCHITECTURE §3; RBT-010).
 *
 * Implements `BookingRepository` over the `HttpClient` port. `getCurrentSession`
 * returns null on a 404 (no active session) rather than throwing. The
 * Idempotency-Key for `hold` is minted upstream (RBT-012) and forwarded here.
 */

import type {
  BookingAvailabilitySnapshot,
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingBuyerInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import { TransportError, unwrap, assertOk } from "@infrastructure/api/envelope";
import {
  toAttendeeCheck,
  toBooking,
  toBookingSession,
} from "@infrastructure/api/dto-mappers";
import type { HttpClient } from "@infrastructure/http/http-client";

export class HttpBookingRepository implements BookingRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly openAvailabilityStream?: (
      sessionId: string,
      onAvailability: (snapshot: BookingAvailabilitySnapshot) => void,
    ) => () => void,
  ) {}

  async createSession(admissionToken: string): Promise<BookingSession> {
    const res = await this.http.request({
      method: "POST",
      url: "booking-sessions",
      body: { admissionToken },
    });
    return toBookingSession(
      unwrap<Parameters<typeof toBookingSession>[0]>(res),
    );
  }

  async getCurrentSession(eventId?: string): Promise<BookingSession | null> {
    // BE requires eventId to scope the visitor's active session. Without event
    // context, report no restorable session instead of issuing a guaranteed 400.
    if (!eventId) return null;
    try {
      const res = await this.http.request({
        method: "GET",
        url: `booking-sessions/current?eventId=${encodeURIComponent(eventId)}`,
      });
      if (res.status === 404) return null;
      return toBookingSession(
        unwrap<Parameters<typeof toBookingSession>[0]>(res),
      );
    } catch (err) {
      // A "no session" error envelope is a normal empty state, not a failure.
      if (err instanceof TransportError && err.httpStatus === 404) return null;
      throw err;
    }
  }

  async checkAttendee(sessionId: string, nik: string): Promise<AttendeeCheck> {
    const res = await this.http.request({
      method: "POST",
      url: `booking-sessions/${encodeURIComponent(sessionId)}/attendee-checks`,
      body: { nik },
    });
    return toAttendeeCheck(unwrap<Parameters<typeof toAttendeeCheck>[0]>(res));
  }

  async hold(
    sessionId: string,
    items: readonly BookingItemInput[],
    idempotencyKey: string,
    buyer: BookingBuyerInput,
  ): Promise<Booking> {
    const res = await this.http.request({
      method: "POST",
      url: "bookings",
      headers: { "idempotency-key": idempotencyKey },
      body: {
        sessionId,
        buyer,
        items: items.map((item) => ({
          categoryId: item.categoryId,
          attendee: { nik: item.attendeeNik, fullName: item.attendeeName },
        })),
      },
    });
    return toBooking(unwrap<Parameters<typeof toBooking>[0]>(res), sessionId);
  }

  async cancelSession(sessionId: string): Promise<void> {
    const res = await this.http.request({
      method: "POST",
      url: `booking-sessions/${encodeURIComponent(sessionId)}/cancel`,
    });
    assertOk(res);
  }

  async getSession(sessionId: string): Promise<BookingSession> {
    const res = await this.http.request({
      method: "GET",
      url: `booking-sessions/${encodeURIComponent(sessionId)}`,
    });
    return toBookingSession(
      unwrap<Parameters<typeof toBookingSession>[0]>(res),
    );
  }

  subscribeAvailability(
    sessionId: string,
    onAvailability: (snapshot: BookingAvailabilitySnapshot) => void,
  ): () => void {
    return (
      this.openAvailabilityStream?.(sessionId, onAvailability) ?? (() => {})
    );
  }

  async getBooking(bookingId: string): Promise<Booking> {
    const res = await this.http.request({
      method: "GET",
      url: `bookings/${encodeURIComponent(bookingId)}`,
    });
    return toBooking(unwrap<Parameters<typeof toBooking>[0]>(res));
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    const res = await this.http.request({
      method: "POST",
      url: `bookings/${encodeURIComponent(bookingId)}/cancel`,
    });
    return toBooking(unwrap<Parameters<typeof toBooking>[0]>(res));
  }

  async replaceItems(
    bookingId: string,
    version: number,
    items: readonly BookingItemInput[],
    idempotencyKey: string,
  ): Promise<Booking> {
    const res = await this.http.request({
      method: "PUT",
      url: `bookings/${encodeURIComponent(bookingId)}/items`,
      headers: { "idempotency-key": idempotencyKey },
      body: {
        version,
        items: items.map((item) => ({
          categoryId: item.categoryId,
          attendee: { nik: item.attendeeNik, fullName: item.attendeeName },
        })),
      },
    });
    return toBooking(unwrap<Parameters<typeof toBooking>[0]>(res));
  }
}
