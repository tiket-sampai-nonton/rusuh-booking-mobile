/**
 * notification-flows — the required notification content + deep links (RBT-072,
 * E8, AC1). Pure domain rule: no React / RN / Expo / infrastructure imports.
 *
 * Builds the four mandated flows (expiry reminder, payment success, admission,
 * event reminder) as platform-neutral `LocalNotification`s. The adapter
 * (expo-notifications on native, web-push on web) only delivers what this rule
 * produces, so the copy + deep link are identical on every platform and
 * unit-testable without a device. A tap opens `deepLink` (RBT-072 tap→route).
 */
import type {
  LocalNotification,
  NotificationKind,
} from "@domain/services/notification.port";

/** Expiry reminder — the hold/payment deadline is near; tap → the payment page. */
export function expiryReminder(
  bookingId: string,
  scheduledAtMs?: number,
): LocalNotification {
  return {
    kind: "expiry_reminder",
    title: "Pembayaran segera berakhir",
    body: "Selesaikan pembayaran sebelum waktu habis agar tiketmu tidak dilepas.",
    scheduledAtMs,
    deepLink: `/payment/${bookingId}`,
  };
}

/** Payment success — booking confirmed; tap → the success / e-ticket page. */
export function paymentSuccess(bookingId: string): LocalNotification {
  return {
    kind: "payment_success",
    title: "Pembayaran berhasil 🎉",
    body: "Tiketmu sudah aktif. Buka e-tiket dan QR-nya di sini.",
    deepLink: `/success/${bookingId}`,
  };
}

/** Admission — the queue admitted the user; tap → the checkout to select. */
export function admission(sessionId: string): LocalNotification {
  return {
    kind: "admission",
    title: "Giliranmu sudah tiba!",
    body: "Kamu masuk dari antrean. Pilih tiket sekarang sebelum sesimu habis.",
    deepLink: `/checkout/${sessionId}`,
  };
}

/** Event reminder — the event starts soon; tap → the event detail. */
export function eventReminder(
  eventId: string,
  scheduledAtMs?: number,
): LocalNotification {
  return {
    kind: "event_reminder",
    title: "Event kamu sebentar lagi",
    body: "Siapkan e-tiket dan QR-mu. Tunjukkan di gerbang masuk.",
    scheduledAtMs,
    deepLink: `/events/${eventId}`,
  };
}

/** All deep-linkable flow kinds — used to validate a tapped notification. */
export const NOTIFICATION_KINDS: readonly NotificationKind[] = [
  "expiry_reminder",
  "payment_success",
  "admission",
  "event_reminder",
];

/**
 * Resolve the route a tapped notification should open. Returns the explicit
 * `deepLink` when present, else null (stay). Pure — the hook applies it.
 */
export function notificationRoute(
  notification: Pick<LocalNotification, "deepLink">,
): string | null {
  const link = notification.deepLink;
  return link && link.startsWith("/") ? link : null;
}
