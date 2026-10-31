/**
 * Success PageScreen — parent component (orchestration only).
 *
 * Paid confirmation + e-ticket(s) (RBT-070/071, E8). Verifies the authoritative
 * status (useVerifyPayment → getStatus): PAID only renders the tickets (never
 * trust the callback, D10.2). Markup → ./fragments, styles → ./style, types →
 * ./interface (presentation refactor rule). 1:1 of prototype `success.html`.
 */
import { useRouter, type Href } from "expo-router";
import { Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuraBackground } from "@presentation/components/AuraBackground";
import { ETicketCard } from "@presentation/components/ETicketCard";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useVerifyPayment } from "@presentation/hooks/useVerifyPayment";
import { useSessionStore } from "@presentation/stores/session-store";

import { SuccessActions } from "./fragments/SuccessActions";
import { SuccessCheck } from "./fragments/SuccessCheck";
import { SuccessLoading, SuccessUnverified } from "./fragments/SuccessStates";
import { SuccessSummary } from "./fragments/SuccessSummary";
import type { SuccessScreenProps } from "./interface";
import { successScrollContent, successStyles } from "./style";

export function SuccessScreen({ bookingId }: SuccessScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  // "⬇ Unduh E-Tiket" — prototype wires this to window.print() (save/print the
  // e-ticket), NOT a navigation. On web we print; on native there is no print
  // dialog, so we no-op gracefully. It must never navigate away.
  const downloadTicket = (): void => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.print) {
      window.print();
    }
  };

  if (isLoading) return <SuccessLoading />;
  if (isError || !paid) return <SuccessUnverified onHome={goHome} />;

  const tickets = Array.from({ length: ticketCount }, (_, i) => i);

  return (
    <ScreenFade>
      <AuraBackground tone="success">
        <ScrollView
          contentContainerStyle={successScrollContent(insets.top, insets.bottom)}
          testID="success-scroll"
        >
          <View className="items-center">
            <SuccessCheck />
            <Text className="mt-2 text-2xl font-extrabold text-white" accessibilityRole="header">
              Pembayaran Berhasil!
            </Text>
            <Text className="mt-2 text-center text-sm text-white/60" style={successStyles.subMaxWidth}>
              E-tiket sudah terbit. Tunjukkan QR di bawah saat masuk venue.
            </Text>
          </View>

          <SuccessSummary
            bookingId={bookingId}
            ticketCount={ticketCount}
            amountMinor={amountMinor}
            buyerNikMasked={buyerNikMasked}
          />

          <View className="mt-6 gap-4">
            {tickets.map((i) => (
              <ETicketCard key={i} bookingId={bookingId} index={i} total={ticketCount} />
            ))}
          </View>

          <SuccessActions onDownload={downloadTicket} onHome={goHome} />

          <Text className="mt-5 text-center text-xs text-white/60">
            ✉️ Dikirim ke emailmu — cek folder spam bila belum ada.
          </Text>
        </ScrollView>
      </AuraBackground>
    </ScreenFade>
  );
}
