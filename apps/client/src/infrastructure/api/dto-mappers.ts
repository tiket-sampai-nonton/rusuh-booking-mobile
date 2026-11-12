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
  BookingAvailabilitySnapshot,
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
  PageToken,
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentStatus,
} from "@domain/repositories/payment.repository";
import type {
  QueueEntry,
  QueueStatus,
} from "@domain/repositories/queue.repository";
import type {
  AuthSession,
  UserProfile,
} from "@domain/repositories/user.repository";

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
  imageUrl?: string;
  bannerUrl?: string;
  thumbnailUrl?: string;
  genres?: string[];
}
interface WireEventDetail {
  event: WireEventSummary;
  categories: BookingSession["categories"];
  description?: Readonly<Record<string, unknown>>;
  maxTicketsPerOrder?: number;
  maxTicketsPerBuyerNik?: number;
  allowMixedCategories?: boolean;
  published?: boolean;
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
interface WirePaymentPage {
  bookingId: string;
  methods: PaymentMethod[];
  amountMinor: number;
  paymentExpiresAt: string;
  serverTime: string;
  currentAttempt?: WirePaymentAttempt;
}
interface WireBookingSession {
  sessionId: string;
  eventId: string;
  expiresAt: string;
  serverTime?: string;
  maxSelectable?: number;
  categories: BookingSession["categories"];
  phase?: BookingSession["phase"];
  booking?: BookingSession["booking"];
}
interface WireAttendeeCheck {
  nikMasked?: string;
  result: AttendeeCheck["result"];
  checksRemaining?: number;
}
interface WireBooking {
  bookingId: string;
  status: string;
  amountMinor: number;
  serverTime?: string;
  version?: number;
  canEdit?: boolean;
  paymentExpiresAt?: string;
}
interface WireAuthSession {
  accessToken: string;
  account: WireUserProfile;
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
    imageUrl: dto.imageUrl,
    bannerUrl: dto.bannerUrl,
    thumbnailUrl: dto.thumbnailUrl,
    genres: dto.genres,
  };
}

export function toEventDetail(dto: WireEventDetail): EventDetail {
  // The event summary's minPriceMinor can be stale or default to zero while
  // the detail response carries the actual ticket prices. Prefer the minimum
  // valid category price when categories are present (including a real free
  // category at zero); fall back to the summary only when no usable category
  // price was provided.
  const categoryPrices = dto.categories
    .map((category) => category.priceMinor)
    .filter(
      (price): price is number => Number.isSafeInteger(price) && price >= 0,
    );
  const minCategoryPrice =
    categoryPrices.length > 0 ? Math.min(...categoryPrices) : undefined;
  const summaryPrice =
    Number.isSafeInteger(dto.event.minPriceMinor) &&
    (dto.event.minPriceMinor ?? -1) >= 0
      ? dto.event.minPriceMinor
      : undefined;

  return {
    ...toEventSummary(dto.event),
    minPriceMinor: minCategoryPrice ?? summaryPrice,
    maxTicketsPerOrder: dto.maxTicketsPerOrder,
    maxTicketsPerBuyerNik: dto.maxTicketsPerBuyerNik,
    allowMixedCategories: dto.allowMixedCategories,
    published: dto.published,
    description: {
      ...dto.description,
      categories: dto.categories,
      bannerImage:
        dto.description?.bannerImage ??
        dto.event.bannerUrl ??
        dto.event.imageUrl,
    },
  };
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

interface WirePageToken {
  pageToken: string;
  pageUrl: string;
}
export function toPageToken(dto: WirePageToken): PageToken {
  return { pageToken: dto.pageToken, pageUrl: dto.pageUrl };
}

export function toPaymentPage(dto: WirePaymentPage): PaymentPage {
  return {
    bookingId: dto.bookingId,
    methods: dto.methods,
    amountMinor: dto.amountMinor,
    paymentExpiresAt: dto.paymentExpiresAt,
    serverTime: dto.serverTime,
    currentAttempt: dto.currentAttempt
      ? toPaymentAttempt(dto.currentAttempt)
      : undefined,
  };
}

export function toBookingSession(dto: WireBookingSession): BookingSession {
  return {
    sessionId: dto.sessionId,
    eventId: dto.eventId,
    expiresAt: dto.expiresAt,
    serverTime: dto.serverTime,
    maxSelectable: dto.maxSelectable,
    categories: dto.categories,
    phase: dto.phase,
    booking: dto.booking,
  };
}

/** Parse the untrusted SSE availability payload into the domain port shape. */
export function toBookingAvailability(
  value: unknown,
): BookingAvailabilitySnapshot | null {
  if (typeof value !== "object" || value === null) return null;
  const categories = (value as { categories?: unknown }).categories;
  if (!Array.isArray(categories)) return null;

  const mapped: BookingAvailabilitySnapshot["categories"][number][] = [];
  for (const item of categories) {
    if (typeof item !== "object" || item === null) continue;
    const category = item as { categoryId?: unknown; available?: unknown };
    if (
      typeof category.categoryId === "string" &&
      category.categoryId.length > 0 &&
      typeof category.available === "number" &&
      Number.isInteger(category.available) &&
      category.available >= 0
    ) {
      mapped.push({
        categoryId: category.categoryId,
        available: category.available,
      });
    }
  }
  return { categories: mapped };
}

export function toAttendeeCheck(dto: WireAttendeeCheck): AttendeeCheck {
  return {
    nikMasked: dto.nikMasked,
    result: dto.result,
    checksRemaining: dto.checksRemaining,
  };
}

export function toBooking(dto: WireBooking, sessionId?: string): Booking {
  return {
    bookingId: dto.bookingId,
    sessionId,
    status: dto.status as Booking["status"],
    amountMinor: dto.amountMinor,
    serverTime: dto.serverTime,
    version: dto.version,
    canEdit: dto.canEdit,
    paymentExpiresAt: dto.paymentExpiresAt,
  };
}

export function toAuthSession(dto: WireAuthSession): AuthSession {
  return {
    token: dto.accessToken,
    isNew: !dto.account.hasNik || !dto.account.fullName?.trim(),
  };
}

export function toUserProfile(dto: WireUserProfile): UserProfile {
  return {
    emailMasked: dto.emailMasked,
    fullName: dto.fullName,
    nikMasked: dto.nikMasked,
    hasNik: dto.hasNik,
  };
}
