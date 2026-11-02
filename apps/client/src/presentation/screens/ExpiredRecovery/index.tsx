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

import { Seo } from "@presentation/components/Seo";
import {
  decideRecovery,
  requeueRoute,
  type ExpiryReason,
} from "@domain/rules/payment-recovery";
import type { PaymentStatus } from "@domain/repositories/payment.repository";

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
      className="flex-1 items-center justify-center gap-6 bg-background p-6"
      testID="expired-recovery"
    >
      <Seo
        title="Kedaluwarsa"
        description="Expired."
        path={`/expired/${resourceId}`}
        noindex
      />
      <View className="items-center gap-3">
        <Text
          className="text-center text-xl font-semibold text-foreground"
          accessibilityRole="header"
          testID="expired-title"
        >
          {copy.title}
        </Text>
        <Text className="text-center text-base text-muted-foreground">
          {copy.body}
        </Text>
      </View>

      <View className="w-full max-w-sm gap-3">
        {canRetry ? (
          <Text
            onPress={onRetry}
            accessibilityRole="button"
            testID="expired-retry"
            className="rounded-xl bg-brand py-3 text-center text-base font-semibold text-white"
          >
            Coba Bayar Lagi
          </Text>
        ) : null}
        <Text
          onPress={onRequeue}
          accessibilityRole="button"
          testID="expired-requeue"
          className={
            canRetry
              ? "py-3 text-center text-base font-medium text-brand"
              : "rounded-xl bg-brand py-3 text-center text-base font-semibold text-white"
          }
        >
          {reason === "queue" || !eventId ? "Cari Event Lain" : "Antre Lagi"}
        </Text>
      </View>
    </View>
  );
}
