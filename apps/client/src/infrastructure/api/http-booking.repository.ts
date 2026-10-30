/**
 * HttpBookingRepository — infrastructure/api (ARCHITECTURE §3; RBT-010).
 *
 * Implements `BookingRepository` over the `HttpClient` port. `getCurrentSession`
 * returns null on a 404 (no active session) rather than throwing. The
 * Idempotency-Key for `hold` is minted upstream (RBT-012) and forwarded here.
 */

import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import { TransportError, unwrap } from "@infrastructure/api/envelope";
import {
  toAttendeeCheck,
  toBooking,
  toBookingSession,
} from "@infrastructure/api/dto-mappers";
import type { HttpClient } from "@infrastructure/http/http-client";

export class HttpBookingRepository implements BookingRepository {
  constructor(private readonly http: HttpClient) {}

  async createSession(eventId: string): Promise<BookingSession> {
    const res = await this.http.request({
      method: "POST",
      url: "booking-sessions",
      body: { eventId },
    });
    return toBookingSession(unwrap<Parameters<typeof toBookingSession>[0]>(res));
  }

  async getCurrentSession(): Promise<BookingSession | null> {
    const res = await this.http.request({
      method: "GET",
      url: "booking-sessions/current",
    });
    if (res.status === 404) return null;
    try {
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
  ): Promise<Booking> {
    const res = await this.http.request({
      method: "POST",
      url: `booking-sessions/${encodeURIComponent(sessionId)}/holds`,
      headers: { "idempotency-key": idempotencyKey },
      body: { items },
    });
    return toBooking(unwrap<Parameters<typeof toBooking>[0]>(res));
  }
}
