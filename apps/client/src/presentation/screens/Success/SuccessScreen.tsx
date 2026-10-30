/**
 * SuccessScreen — paid confirmation + e-ticket(s) (RBT-070/071, E8).
 *
 * Verifies the authoritative status (useVerifyPayment → getStatus): PAID only
 * renders the tickets (never trust the callback, D10.2). Order summary shows
 * orderId, qty, amount, and the MASKED buyer NIK (D7.1). One e-ticket QR per
 * ticket. Matches prototype `success.html`.
 */
import { useRouter, type Href } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";
import { AuraBackground } from "@presentation/components/AuraBackground";
import { ETicketCard } from "@presentation/components/ETicketCard";
import { useVerifyPayment } from "@presentation/hooks/useVerifyPayment";
import { useSessionStore } from "@presentation/stores/session-store";

export interface SuccessScreenProps {
  readonly bookingId: string;
}

export function SuccessScreen({ bookingId }: SuccessScreenProps) {
  const router = useRouter();
  const attemptId = useSessionStore((s) => s.attemptId);
  const amountMinor = useSessionStore((s) => s.amountMinor);
  const buyerNikMasked = useSessionStore((s) => s.buyerNikMasked);
  const ticketCount = useSessionStore((s) => s.ticketCount) ?? 1;
  const reset = useSessionStore((s) => s.reset);

  const { data, isLoading, isError } = useVerifyPayment(attemptId);
  const paid = data?.status === "PAID";

  const goHome = (): void => {
    reset(); // clear checkout/session state on terminal success (D7.4)
    router.replace("/" as Href);
  };

  if (isLoading) {
    return (
      <AuraBackground tone="success" testID="success-loading">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator accessibilityLabel="Memverifikasi pembayaran" color="#fff" />
          <Text className="mt-2 text-sm text-white/60">Menerbitkan e-tiket…</Text>
        </View>
      </AuraBackground>
    );
  }

  if (isError || !paid) {
    return (
      <AuraBackground tone="error" testID="success-unverified">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl font-extrabold text-white" accessibilityRole="header">
            Pembayaran belum terkonfirmasi
          </Text>
          <Text className="mt-2 text-center text-sm text-white/60">
            Status pembayaran belum PAID. Jika kamu sudah membayar, tunggu
            sebentar lalu muat ulang.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ke Beranda"
            onPress={goHome}
            testID="success-home"
            className="mt-7.5 rounded-pill border border-white/20 px-6 py-3"
          >
            <Text className="text-sm font-bold text-white">Ke Beranda</Text>
          </Pressable>
        </View>
      </AuraBackground>
    );
  }

  const tickets = Array.from({ length: ticketCount }, (_, i) => i);

  return (
    <AuraBackground tone="success">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 48, paddingBottom: 60 }}
        testID="success-scroll"
      >
        <View className="items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-ok">
            <Text className="text-3xl text-white" accessibilityElementsHidden>
              ✓
            </Text>
          </View>
          <Text className="mt-3 text-2xl font-extrabold text-white" accessibilityRole="header">
            Pembayaran Berhasil!
          </Text>
          <Text className="mt-1 text-center text-sm text-white/70">
            E-tiket sudah terbit. Tunjukkan QR di bawah saat masuk venue.
          </Text>
        </View>

        <View
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"
          testID="success-summary"
        >
          <Row k="Order ID" v={bookingId} />
          <Row k="Jumlah tiket" v={String(ticketCount)} />
          <Row k="Total pembayaran" v={minorToIDR(amountMinor)} />
          <Row k="NIK pembeli" v={buyerNikMasked ?? "—"} />
        </View>

        <View className="mt-6 gap-4">
          {tickets.map((i) => (
            <ETicketCard key={i} bookingId={bookingId} index={i} total={ticketCount} />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ke Beranda"
          onPress={goHome}
          testID="success-home"
          className="mt-7.5 items-center rounded-pill bg-brand py-4"
        >
          <Text className="text-md font-bold text-white">Ke Beranda</Text>
        </Pressable>

        <Text className="mt-3 text-center text-2xs text-white/50">
          ✉ Dikirim ke emailmu — cek folder spam bila belum ada.
        </Text>
      </ScrollView>
    </AuraBackground>
  );
}

function Row({ k, v }: { readonly k: string; readonly v: string }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-sm text-white/60">{k}</Text>
      <Text className="text-sm font-bold text-white">{v}</Text>
    </View>
  );
}
