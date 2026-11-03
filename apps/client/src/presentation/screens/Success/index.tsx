/**
 * SuccessScreen — confirmed-order summary (RBT-070, E8, AC1/FR-22), V2 Brutalist Mono.
 *
 * Reached only after the RBT-063 verify gate confirmed PAID; this screen
 * RE-VERIFIES the authoritative status (never trusts navigation alone, D10.2)
 * and shows the order summary ONLY when getStatus reports PAID. While it is
 * still verifying it shows a brief processing state; a non-PAID terminal status
 * routes to the recovery screen. The e-ticket QR + download/share is RBT-071.
 *
 * SECURITY: renders the MASKED buyer NIK only (first 2 + last 2, D7.1/D7.5) —
 * the raw NIK never reaches the FE. noindex (transactional, SECURITY §6.5).
 *
 * V2 look (prototype 10-success): dark ground, green success ring, white
 * success card with a dark summary, white-primary / outline-secondary actions.
 */
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";
import { ETicketCard } from "@presentation/components/ETicketCard";
import { Seo } from "@presentation/components/Seo";
import { useETicketShare } from "@presentation/hooks/useETicketShare";
import { useVerifyPayment } from "@presentation/hooks/useVerifyPayment";
import { useSessionStore } from "@presentation/stores/session-store";
import { v2, v2Border } from "@presentation/theme";

export interface SuccessScreenProps {
  readonly bookingId: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3.5 py-1">
      <Text className="text-xs text-white/60">{label}</Text>
      <Text className="flex-1 text-right text-sm font-bold text-white">{value}</Text>
    </View>
  );
}

export function SuccessScreen({ bookingId }: SuccessScreenProps) {
  const router = useRouter();
  const attemptId = useSessionStore((s) => s.attemptId);
  const amountMinor = useSessionStore((s) => s.amountMinor);
  const buyerNikMasked = useSessionStore((s) => s.buyerNikMasked);
  const ticketCount = useSessionStore((s) => s.ticketCount);

  // Re-verify authoritatively. verdict "failed" → the recovery screen; a
  // pending verdict stays on the processing state (the gate routes here on
  // PAID, so this is a safety re-check, not the primary poll).
  const { verdict, isLoading } = useVerifyPayment(attemptId, bookingId);
  const { shareTickets } = useETicketShare();
  const count = ticketCount ?? 1;

  useEffect(() => {
    if (verdict === "failed") {
      router.replace(
        `/expired/${bookingId}?reason=payment&bookingId=${bookingId}` as Href,
      );
    }
  }, [verdict, bookingId, router]);

  const confirmed = verdict === "paid";

  return (
    <View
      className="flex-1 items-center justify-center p-6"
      style={{ backgroundColor: v2.ink }}
      testID="success-screen"
    >
      <Seo
        title="E-Tiket"
        description="Your confirmed tickets."
        path={`/success/${bookingId}`}
        noindex
      />
      {!confirmed ? (
        <View
          className="items-center gap-4"
          accessibilityLiveRegion="polite"
          testID="success-verifying"
        >
          <ActivityIndicator
            size="large"
            color={v2.ground}
            accessibilityLabel="Memverifikasi pembayaran"
          />
          <Text className="text-center text-base text-white">
            {isLoading ? "Memverifikasi pembayaran…" : "Menyiapkan tiket…"}
          </Text>
        </View>
      ) : (
        <ScrollView className="w-full" contentContainerClassName="w-full max-w-md self-center">
          {/* Green success ring (prototype `.success-icon`). */}
          <View className="mb-6 items-center">
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{ borderWidth: 3, borderColor: v2.success }}
            >
              <Text className="text-3xl font-extrabold" style={{ color: v2.success }} accessibilityElementsHidden>
                ✓
              </Text>
            </View>
          </View>

          <Text
            className="text-center text-2xs font-extrabold uppercase"
            style={{ color: v2.success, letterSpacing: 2 }}
            testID="success-eyebrow"
          >
            Pembayaran berhasil
          </Text>
          <Text
            className="mt-2 text-center text-2xl font-extrabold uppercase text-white"
            style={{ letterSpacing: -1 }}
            accessibilityRole="header"
          >
            Tiket kamu sudah aktif
          </Text>
          <Text className="mt-2.5 text-center text-xs leading-5 text-white/70">
            Simpan e-tiket ini. Tunjukkan QR di pintu masuk.
          </Text>

          {/* Summary card — translucent on the dark ground (prototype `.summary-card`). */}
          <View
            className="my-6 gap-1 p-5"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <SummaryRow label="Order ID" value={bookingId} />
            <SummaryRow label="Jumlah tiket" value={`${ticketCount ?? 1} tiket`} />
            <SummaryRow label="Total dibayar" value={minorToIDR(amountMinor)} />
            <SummaryRow label="NIK pembeli" value={buyerNikMasked ?? "••••"} />
          </View>

          {/* One e-ticket card + QR per ticket (RBT-071). QR encodes a safe
              reference, never PII. */}
          <View className="gap-6" testID="eticket-list">
            {Array.from({ length: count }, (_, i) => (
              // Static derived list (fixed length, never reordered): the
              // booking id + ticket index IS the stable identity.
              <ETicketCard
                key={`${bookingId}-ticket-${i}`}
                bookingId={bookingId}
                index={i}
                total={count}
              />
            ))}
          </View>

          <View className="mt-7 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Unduh atau bagikan e-tiket"
              testID="success-download"
              onPress={() => void shareTickets(bookingId, count)}
              className="flex-1 items-center py-4"
              style={{ backgroundColor: v2.ground, borderWidth: v2Border.base, borderColor: v2.ground }}
            >
              <Text className="text-sm font-bold uppercase" style={{ color: v2.ink, letterSpacing: 0.5 }}>
                ⬇ Unduh E-Tiket
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ke Beranda"
              testID="success-home"
              onPress={() => router.replace("/" as Href)}
              className="flex-1 items-center py-4"
              style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" }}
            >
              <Text className="text-sm font-bold uppercase text-white" style={{ letterSpacing: 0.5 }}>
                Ke Beranda
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
