/**
 * DTO → domain mappers — infrastructure/api (ARCHITECTURE §3; RBT-010).
 *
 * Translates OpenAPI-generated wire DTOs into domain entities. This is the ONE
 * boundary where generated types are read; the output is always a domain entity
 * so generated shapes never leak into domain/application (Dependency Rule). Pure
 * TS — no framework imports. Kept in `infrastructure/api` (NOT `application/dto`,
 * which is for use-case DTOs — a different concern).
 */

import type {
  Booking,
  BookingSession,
  AttendeeCheck,
} from "@domain/repositories/booking.repository";
import type {
  EventDetail,
  EventSummary,
  EventStatus,
} from "@domain/repositories/event.repository";
import type {
  PaymentAttempt,
  PaymentStatus,
} from "@domain/repositories/payment.repository";
import type {
  QueueEntry,
  QueueStatus,
} from "@domain/repositories/queue.repository";
import type { AuthSession, UserProfile } from "@domain/repositories/user.repository";

/**
 * Minimal structural shapes of the generated DTOs we read. We declare them
 * locally (not `import type` from generated .d.ts) so the mapper stays robust to
 * codegen formatting and the domain never transitively sees a generated type.
 */
interface WireEventSummary {
  eventId: string;
  slug: string;
  name: string;
  venue?: string;
  startsAt?: string;
  salesStartsAt: string;
  salesEndsAt: string;
  status: EventStatus;
  minPriceMinor?: number;
  remainingTickets?: number;
}
interface WireEventDetail extends WireEventSummary {
  description?: Record<string, unknown>;
}
interface WireQueueEntry {
  queueId: string;
  eventId: string;
  position: number;
  status: QueueStatus;
  zone?: QueueEntry["zone"];
  nextPollAfterMs?: number;
  serverTime?: string;
}
interface WirePaymentAttempt {
  attemptId: string;
  bookingId: string;
  status: PaymentStatus;
  redirectUrl?: string;
  paymentExpiresAt?: string;
  serverTime?: string;
}
interface WireBookingSession {
  sessionId: string;
  eventId: string;
  expiresAt: string;
  serverTime?: string;
  maxSelectable?: number;
}
interface WireAttendeeCheck {
  nikMasked: string;
  result: AttendeeCheck["result"];
  checksRemaining?: number;
}
interface WireBooking {
  bookingId: string;
  sessionId: string;
  status: Booking["status"];
  amountMinor: number;
  serverTime?: string;
}
interface WireAuthSession {
  token: string;
  isNew: boolean;
}
interface WireUserProfile {
  emailMasked: string;
  fullName?: string;
  nikMasked?: string;
  hasNik: boolean;
}

export function toEventSummary(dto: WireEventSummary): EventSummary {
  return {
    id: dto.eventId,
    slug: dto.slug,
    name: dto.name,
    venue: dto.venue,
    startsAt: dto.startsAt,
    salesStartsAt: dto.salesStartsAt,
    salesEndsAt: dto.salesEndsAt,
    status: dto.status,
    minPriceMinor: dto.minPriceMinor,
    remainingTickets: dto.remainingTickets,
  };
}

export function toEventDetail(dto: WireEventDetail): EventDetail {
  return { ...toEventSummary(dto), description: dto.description };
}

export function toQueueEntry(dto: WireQueueEntry): QueueEntry {
  return {
    queueId: dto.queueId,
    eventId: dto.eventId,
    position: dto.position,
    status: dto.status,
    zone: dto.zone,
    nextPollAfterMs: dto.nextPollAfterMs,
    serverTime: dto.serverTime,
  };
}

export function toPaymentAttempt(dto: WirePaymentAttempt): PaymentAttempt {
  return {
    attemptId: dto.attemptId,
    bookingId: dto.bookingId,
    status: dto.status,
    redirectUrl: dto.redirectUrl,
    paymentExpiresAt: dto.paymentExpiresAt,
    serverTime: dto.serverTime,
  };
}

export function toBookingSession(dto: WireBookingSession): BookingSession {
  return {
    sessionId: dto.sessionId,
    eventId: dto.eventId,
    expiresAt: dto.expiresAt,
    serverTime: dto.serverTime,
    maxSelectable: dto.maxSelectable,
  };
}

export function toAttendeeCheck(dto: WireAttendeeCheck): AttendeeCheck {
  return {
    nikMasked: dto.nikMasked,
    result: dto.result,
    checksRemaining: dto.checksRemaining,
  };
}

export function toBooking(dto: WireBooking): Booking {
  return {
    bookingId: dto.bookingId,
    sessionId: dto.sessionId,
    status: dto.status,
    amountMinor: dto.amountMinor,
    serverTime: dto.serverTime,
  };
}

export function toAuthSession(dto: WireAuthSession): AuthSession {
  return { token: dto.token, isNew: dto.isNew };
}

export function toUserProfile(dto: WireUserProfile): UserProfile {
  return {
    emailMasked: dto.emailMasked,
    fullName: dto.fullName,
    nikMasked: dto.nikMasked,
    hasNik: dto.hasNik,
  };
}
