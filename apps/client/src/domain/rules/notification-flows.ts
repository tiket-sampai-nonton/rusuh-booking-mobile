/**
 * notification-flows — the required notification content + deep links (RBT-072,
 * E8, AC1). Pure domain rule: no React / RN / Expo / infrastructure imports.
 *
 * Builds the four mandated flows (expiry reminder, payment success, admission,
 * event reminder) as platform-neutral `LocalNotification`s. The adapter
 * (Notifee on native, web-push on web) only delivers what this rule
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
    notificationId: `payment-success-${bookingId}`,
    title: "Pembayaran berhasil",
    body: "Tiketmu sudah aktif. Buka e-tiket dan QR-nya di sini.",
    deepLink: `/success/${bookingId}`,
  };
}

/** Payment failure/expiry — report the result without implying the ticket is lost. */
export function paymentFailure(bookingId: string): LocalNotification {
  return {
    kind: "payment_failure",
    notificationId: `payment-failure-${bookingId}`,
    title: "Pembayaran belum berhasil",
    body: "Pembayaranmu belum selesai. Kamu bisa coba lagi dari halaman pembayaran.",
    deepLink: `/payment/${bookingId}`,
  };
}

/** Payment deadline — tap returns to payment to read the latest order state. */
export function paymentTimeout(
  bookingId: string,
  scheduledAtMs?: number,
): LocalNotification {
  return {
    kind: "payment_timeout",
    notificationId: `payment-timeout-${bookingId}`,
    title: "Waktu pembayaran habis",
    body: "Batas waktu pembayaran sudah lewat. Buka untuk melihat status pesananmu.",
    scheduledAtMs,
    deepLink: `/payment/${bookingId}`,
  };
}

/** Map the server-authoritative terminal payment status to user-facing copy. */
export function paymentResultNotification(
  status: string,
  bookingId: string,
): LocalNotification {
  if (status === "PAID") return paymentSuccess(bookingId);
  if (status === "EXPIRED") return paymentTimeout(bookingId);
  return paymentFailure(bookingId);
}

/** Buyer leaves the payment screen; this does not claim the provider cancelled it. */
export function paymentCancelled(bookingId: string): LocalNotification {
  return {
    kind: "payment_cancelled",
    notificationId: `payment-left-${bookingId}`,
    title: "Proses pembayaran ditutup",
    body: "Kamu menutup proses pembayaran sebelum selesai. Kamu bisa lanjut lagi kapan saja.",
    deepLink: `/payment/${bookingId}`,
  };
}

/** Buyer successfully leaves the waiting room. */
export function waitingRoomLeft(eventId: string): LocalNotification {
  return {
    kind: "waiting_room_left",
    notificationId: `queue-left-${eventId}`,
    title: "Kamu sudah keluar dari antrean",
    body: "Tidak apa-apa, kamu bisa pilih event lain atau antre lagi kapan saja.",
    deepLink: `/events/${eventId}`,
  };
}

/** Server-confirmed queue turn timeout. */
export function queueTimeout(
  queueId: string,
  eventId: string,
): LocalNotification {
  return {
    kind: "queue_timeout",
    notificationId: `queue-timeout-${queueId}`,
    title: "Waktu antreanmu habis",
    body: "Giliran antreanmu terlewat. Kamu bisa melihat event ini atau memilih event lain.",
    deepLink: `/events/${eventId}`,
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
  "payment_failure",
  "payment_timeout",
  "payment_cancelled",
  "waiting_room_left",
  "queue_timeout",
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
  return link?.startsWith("/") ? link : null;
}
