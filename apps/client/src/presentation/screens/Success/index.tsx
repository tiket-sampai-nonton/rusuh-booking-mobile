/**
 * SuccessScreen — confirmed-order summary (RBT-070, E8, AC1/FR-22).
 *
 * Reached only after the RBT-063 verify gate confirmed PAID; this screen
 * RE-VERIFIES the authoritative status (never trusts navigation alone, D10.2)
 * and shows the order summary ONLY when getStatus reports PAID. While it is
 * still verifying it shows a brief processing state; a non-PAID terminal status
 * routes to the recovery screen. The e-ticket QR + download/share is RBT-071.
 *
 * SECURITY: renders the MASKED buyer NIK only (first 2 + last 2, D7.1/D7.5) —
 * the raw NIK never reaches the FE. noindex (transactional, SECURITY §6.5).
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

export interface SuccessScreenProps {
  readonly bookingId: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3.5">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-right text-sm font-bold text-foreground">
        {value}
      </Text>
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
      className="flex-1 items-center justify-center bg-background p-6"
      testID="success-screen"
    >
      <Seo
        title="E-Tiket"
        description="Your confirmed tickets."
        path={`/success/${bookingId}`}
        noindex
      />
      {!confirmed ? (
        <View className="items-center gap-4" testID="success-verifying">
          <ActivityIndicator
            size="large"
            accessibilityLabel="Memverifikasi pembayaran"
          />
          <Text className="text-center text-base text-foreground">
            {isLoading ? "Memverifikasi pembayaran…" : "Menyiapkan tiket…"}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="w-full"
          contentContainerClassName="w-full max-w-md self-center rounded-4xl border border-line bg-card p-7 shadow-filter"
        >
          <Text
            className="text-2xs font-extrabold uppercase tracking-tag text-ok"
            testID="success-eyebrow"
          >
            Pembayaran berhasil
          </Text>
          <Text
            className="mt-2 text-2xl font-extrabold text-foreground"
            accessibilityRole="header"
          >
            Tiket kamu sudah aktif
          </Text>
          <Text className="mt-2.5 text-xs leading-5 text-muted-foreground">
            Simpan e-tiket ini. Tunjukkan QR di pintu masuk.
          </Text>

          <View className="my-5.5 gap-3 rounded-xl bg-background p-4">
            <SummaryRow label="Order ID" value={bookingId} />
            <SummaryRow
              label="Jumlah tiket"
              value={`${ticketCount ?? 1} tiket`}
            />
            <SummaryRow label="Total dibayar" value={minorToIDR(amountMinor)} />
            <SummaryRow
              label="NIK pembeli"
              value={buyerNikMasked ?? "••••"}
            />
          </View>

          {/* One e-ticket card + QR per ticket (RBT-071). QR encodes a safe
              reference, never PII. */}
          <View className="gap-3" testID="eticket-list">
            {Array.from({ length: count }, (_, i) => (
              <ETicketCard
                key={i}
                bookingId={bookingId}
                index={i}
                total={count}
              />
            ))}
          </View>

          <View className="mt-6 flex-row gap-2.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Unduh atau bagikan e-tiket"
              testID="success-download"
              onPress={() => void shareTickets(bookingId, count)}
              className="flex-1 items-center rounded-pill bg-brand py-4"
            >
              <Text className="text-sm font-bold text-white">⬇ Unduh E-Tiket</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ke Beranda"
              testID="success-home"
              onPress={() => router.replace("/" as Href)}
              className="flex-1 items-center rounded-pill border border-line bg-card py-4"
            >
              <Text className="text-sm font-bold text-foreground">Ke Beranda</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
