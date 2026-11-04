/**
 * ExpiredRecoveryScreen — failure/expiry recovery (RBT-064, E7 Payment,
 * AC1/FR-23). Rendered behind `/expired/[resourceId]`.
 * RBT-097 — Mobile: white background (not dark), add "turn" variant.
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
import { Platform, Pressable, Text, View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

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
  /** Why we are here (payment / hold / queue / turn). Defaults to a generic expiry. */
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

// Icon per reason (prototype 09-expired.html variants)
const REASON_ICON_PATH: Record<ExpiryReason, string> = {
  payment: "M3 7h18v12H3z M3 11h18 M7 15h4",
  hold: "M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  queue: "M8 7h13M8 12h13M8 17h13M3 7h.01M3 12h.01M3 17h.01",
  turn: "M12 3v18M3 12h18M7 7l10 10M17 7 7 17",
};

const REASON_COPY: Record<ExpiryReason, { title: string; body: string; infoText: string; infoList: string[] }> = {
  payment: {
    title: "Pembayaran Timeout",
    body: "Batas waktu pembayaran sudah lewat. Silakan coba lagi.",
    infoText: "Pembayaran harus diselesaikan dalam 15 menit setelah checkout.",
    infoList: [
      "Tidak ada biaya yang dikenakan",
      "Tiket dikembalikan ke inventori",
      "Kuota NIK kamu dipulihkan",
    ],
  },
  hold: {
    title: "Pemesanan Kedaluwarsa",
    body: "Batas waktu pemesanan 10 menit telah berakhir. Tiket sudah dilepas.",
    infoText: "Sesi pemesanan dibatasi untuk memastikan akses yang adil bagi semua pengguna.",
    infoList: [
      "Tiket yang dipilih dikembalikan ke inventori",
      "Tidak ada pembayaran yang diproses",
      "Kamu bisa masuk antrean lagi sekarang",
    ],
  },
  queue: {
    title: "Sesi Antrean Berakhir",
    body: "Kamu meninggalkan antrean atau sesi terganggu.",
    infoText: "Meninggalkan halaman antrean akan melepaskan posisi kamu.",
    infoList: [
      "Posisi kamu diberikan ke orang berikutnya",
      "Tidak ada tiket yang dipesan",
      "Masuk lagi kapan saja",
    ],
  },
  turn: {
    title: "Giliran Terlewat",
    body: "Giliran kamu tiba tapi kamu tidak melanjutkan tepat waktu.",
    infoText: "Saat giliran tiba, kamu punya 60 detik untuk melanjutkan.",
    infoList: [
      "Giliran kamu dilewati",
      "Posisi diberikan ke orang berikutnya dalam antrean",
      "Kamu harus masuk antrean lagi dari belakang",
    ],
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

  // Primary button text based on reason
  const primaryText = canRetry
    ? "Coba Lagi"
    : reason === "queue" || reason === "turn" || !eventId
      ? "Cari Event Lain"
      : "Masuk Antrean Lagi";

  return (
    <View
      className="flex-1 items-center justify-center gap-6 p-6"
      style={{ backgroundColor: v2.ground }}
      testID="expired-recovery"
    >
      <Seo
        title="Kedaluwarsa"
        description="Expired."
        path={`/expired/${resourceId}`}
        noindex
      />
      <View className="w-full max-w-sm items-center gap-4">
        {/* Red-ring icon circle (prototype 09-expired `.expired-icon`). */}
        <View
          className="h-[100px] w-[100px] items-center justify-center rounded-full"
          style={{ borderWidth: v2Border.base, borderColor: v2.danger }}
        >
          <Svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke={v2.danger} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            {reason === "payment" ? <Path d={REASON_ICON_PATH[reason]} /> : <Path d={REASON_ICON_PATH[reason]} />}
            {reason === "hold" ? <Circle cx={12} cy={12} r={9} /> : null}
          </Svg>
        </View>
        <Text
          className="text-center text-2xl font-extrabold uppercase"
          style={{ letterSpacing: -0.5, color: v2.ink }}
          accessibilityRole="header"
          testID="expired-title"
        >
          {copy.title}
        </Text>
        <Text
          className="text-center text-sm leading-6"
          style={{ color: v2.inkMuted, maxWidth: 280 }}
        >
          {copy.body}
        </Text>

        {/* Info box (prototype `.info-box`) */}
        <View
          className="w-full p-4"
          style={{
            backgroundColor: v2.field,
            borderWidth: v2Border.base,
            borderColor: v2.ink,
          }}
        >
          <Text
            className="text-xs font-extrabold uppercase"
            style={{ letterSpacing: 1.2, color: v2.ink, marginBottom: 8 }}
          >
            Apa yang terjadi?
          </Text>
          <Text className="text-xs leading-5" style={{ color: v2.inkMuted }}>
            {copy.infoText}
          </Text>
          <View className="mt-2 gap-1">
            {copy.infoList.map((item, i) => (
              <View key={i} className="flex-row gap-2">
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={v2.ink} strokeWidth={2} style={{ marginTop: 2 }}><Path d="M4 12h15m-6-6 6 6-6 6" /></Svg>
                <Text className="flex-1 text-xs" style={{ color: v2.inkMuted }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="w-full max-w-sm gap-3">
        <Pressable
          onPress={canRetry ? onRetry : onRequeue}
          accessibilityRole="button"
          accessibilityLabel={primaryText}
          testID={canRetry ? "expired-retry" : "expired-requeue"}
          style={({ pressed }) => ({
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            backgroundColor: pressed ? v2.inkMuted : v2.ink,
            borderWidth: v2Border.base,
            borderColor: v2.ink,
          })}
        >
          <Text style={{ color: v2.ground, letterSpacing: 0.5, fontSize: 14, fontWeight: "700", textTransform: "uppercase" }}>{primaryText}</Text>
        </Pressable>
        {Platform.OS !== "web" ? (
          <Pressable
            onPress={() => router.replace("/" as Href)}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda"
            testID="expired-home"
            style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: v2Border.base, borderColor: v2.ink, backgroundColor: pressed ? v2.field : v2.ground })}
          >
            <Text style={{ color: v2.ink, fontWeight: "800", fontSize: 12, textTransform: "uppercase" }}>Kembali ke Beranda</Text>
          </Pressable>
        ) : null}
        {canRetry && (
          <Pressable
            onPress={onRequeue}
            accessibilityRole="button"
            accessibilityLabel="Cari Event Lain"
            testID="expired-requeue"
            style={({ pressed }) => ({
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              backgroundColor: pressed ? v2.field : v2.ground,
              borderWidth: v2Border.base,
              borderColor: v2.ink,
            })}
          >
            <Text style={{ color: v2.ink, letterSpacing: 0.5, fontSize: 14, fontWeight: "700", textTransform: "uppercase" }}>Cari Event Lain</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
