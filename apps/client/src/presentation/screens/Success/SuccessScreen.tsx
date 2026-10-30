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
      <View className="flex-1 items-center justify-center bg-background" testID="success-loading">
        <ActivityIndicator accessibilityLabel="Memverifikasi pembayaran" />
        <Text className="mt-2 text-sm text-muted-foreground">Menerbitkan e-tiket…</Text>
      </View>
    );
  }

  if (isError || !paid) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6" testID="success-unverified">
        <Text className="text-lg font-extrabold text-foreground" accessibilityRole="header">
          Pembayaran belum terkonfirmasi
        </Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          Status pembayaran belum PAID. Jika kamu sudah membayar, tunggu
          sebentar lalu muat ulang.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ke Beranda"
          onPress={goHome}
          testID="success-home"
          className="mt-7.5 rounded-pill border border-line px-6 py-3"
        >
          <Text className="text-sm font-bold text-foreground">Ke Beranda</Text>
        </Pressable>
      </View>
    );
  }

  const tickets = Array.from({ length: ticketCount }, (_, i) => i);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: 48, paddingBottom: 60 }}
      testID="success-scroll"
    >
      <View className="items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-ok">
          <Text className="text-3xl text-white" accessibilityElementsHidden>
            ✓
          </Text>
        </View>
        <Text className="mt-3 text-2xl font-extrabold text-foreground" accessibilityRole="header">
          Pembayaran Berhasil!
        </Text>
        <Text className="mt-1 text-center text-sm text-muted-foreground">
          E-tiket sudah terbit. Tunjukkan QR di bawah saat masuk venue.
        </Text>
      </View>

      <View className="mt-6 rounded-2xl border border-line bg-card p-4" testID="success-summary">
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

      <Text className="mt-3 text-center text-2xs text-muted-foreground">
        ✉ Dikirim ke emailmu — cek folder spam bila belum ada.
      </Text>
    </ScrollView>
  );
}

function Row({ k, v }: { readonly k: string; readonly v: string }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-sm text-muted-foreground">{k}</Text>
      <Text className="text-sm font-bold text-foreground">{v}</Text>
    </View>
  );
}
