/**
 * ExpiredRecoveryScreen — failure/expiry recovery (RBT-064, E7 Payment,
 * AC1/FR-23). Rendered behind `/expired/[resourceId]`.
 *
 * Decides the RIGHT recovery from the authoritative state (never the callback,
 * never the device clock):
 *   • FAILED + still payable (deadline not passed, no not-payable code) → offer
 *     RETRY: go back to the payment page to start a NEW attempt.
 *   • BOOKING_NOT_PAYABLE / deadline passed → there is nothing to retry; offer
 *     the RE-QUEUE path (back to the event's waiting room, else browse).
 *
 * noindex: a crawler must never see a transactional failure state (SECURITY §6.5).
 */
import { useRouter, type Href } from "expo-router";
import { Text, View } from "react-native";

import type { PaymentStatus } from "@domain/repositories/payment.repository";
import {
  decideRecovery,
  requeueRoute,
  type ExpiryReason,
} from "@domain/rules/payment-recovery";
import { Seo } from "@presentation/components/Seo";
import { v2, v2Border } from "@presentation/theme";

export interface ExpiredRecoveryScreenProps {
  readonly resourceId: string;
  /** Why we are here (payment / hold / queue). Defaults to a generic expiry. */
  readonly reason?: ExpiryReason;
  /** Booking to retry paying (when payable). */
  readonly bookingId?: string;
  /** Event to re-queue for. */
  readonly eventId?: string;
  /** Authoritative status + terminal error code, when known. */
  readonly status?: PaymentStatus;
  readonly errorCode?: string;
  /** Server-reconciled ms left on the deadline (<=0 = passed). */
  readonly remainingMs?: number;
}

const REASON_COPY: Record<ExpiryReason, { title: string; body: string }> = {
  payment: {
    title: "Pembayaran gagal atau kedaluwarsa",
    body: "Pembayaran kamu tidak selesai. Kamu bisa mencoba membayar lagi selama pemesanan masih berlaku.",
  },
  hold: {
    title: "Waktu pemesanan habis",
    body: "Batas waktu menyelesaikan pemesanan sudah lewat. Tiket dilepas kembali — silakan antre lagi.",
  },
  queue: {
    title: "Sesi antrean kedaluwarsa",
    body: "Sesi antrean kamu sudah berakhir. Silakan masuk antrean lagi untuk melanjutkan.",
  },
};

export function ExpiredRecoveryScreen({
  resourceId,
  reason = "queue",
  bookingId,
  eventId,
  status,
  errorCode,
  remainingMs = 0,
}: ExpiredRecoveryScreenProps) {
  const router = useRouter();
  const recovery = decideRecovery(status, remainingMs, errorCode);
  const copy = REASON_COPY[reason];

  // Retry is only reachable when canRetry (below) is true, which already
  // requires a bookingId — so no redundant guard here.
  const onRetry = (): void => {
    router.replace(`/payment/${bookingId}` as Href);
  };
  const onRequeue = (): void => {
    router.replace(requeueRoute(reason, eventId) as Href);
  };

  const canRetry = recovery.kind === "retry" && !!bookingId;

  return (
    <View
      className="flex-1 items-center justify-center gap-6 p-6"
      style={{ backgroundColor: v2.ink }}
      testID="expired-recovery"
    >
      <Seo
        title="Kedaluwarsa"
        description="Expired."
        path={`/expired/${resourceId}`}
        noindex
      />
      <View className="w-full max-w-sm items-center gap-4">
        {/* White-ring icon circle (prototype 09 `.icon`). */}
        <View
          className="h-24 w-24 items-center justify-center rounded-full"
          style={{ borderWidth: v2Border.base, borderColor: v2.ground }}
        >
          <Text className="text-4xl" accessibilityElementsHidden>
            ⏳
          </Text>
        </View>
        <Text
          className="text-center text-2xl font-extrabold uppercase text-white"
          style={{ letterSpacing: -1 }}
          accessibilityRole="header"
          testID="expired-title"
        >
          {copy.title}
        </Text>
        {/* Info card — translucent on the dark ground (prototype `.info-card`). */}
        <View
          className="w-full p-5"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <Text className="text-sm leading-6 text-white/80">{copy.body}</Text>
        </View>
      </View>

      <View className="w-full max-w-sm gap-3">
        {canRetry ? (
          <Text
            onPress={onRetry}
            accessibilityRole="button"
            testID="expired-retry"
            className="py-4 text-center text-base font-bold uppercase"
            style={{ backgroundColor: v2.ground, color: v2.ink, letterSpacing: 0.5 }}
          >
            Coba Bayar Lagi
          </Text>
        ) : null}
        <Text
          onPress={onRequeue}
          accessibilityRole="button"
          testID="expired-requeue"
          className="py-4 text-center text-base font-bold uppercase text-white"
          style={
            canRetry
              ? { borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", letterSpacing: 0.5 }
              : { backgroundColor: v2.ground, color: v2.ink, letterSpacing: 0.5 }
          }
        >
          {reason === "queue" || !eventId ? "Cari Event Lain" : "Antre Lagi"}
        </Text>
      </View>
    </View>
  );
}
