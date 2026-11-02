/**
 * Payment PageScreen (folder index) — RBT-060 summary + method + timer slice.
 *
 * 1:1 of prototype `payment.html`: order summary with the total == `amountMinor`
 * and NO service/hidden-fee line (D10.1); a SERVER-driven method list
 * (`page.methods` — VA/QRIS/GoPay, no credit card); a server-authoritative
 * 10-min countdown from `paymentExpiresAt`/`serverTime` via the ServerClock
 * (never the device clock, D3.2). The page is fetched from
 * `GET /payments/{id}/page` (usePaymentPage → GetPaymentPage → frozen
 * PaymentRepository). The default method is the first server method; "Bayar
 * Sekarang" enables on selection. The create-attempt → SNAP handoff is RBT-061;
 * RBT-060 lands the page. No infrastructure import — ports via hooks only.
 */
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { PaymentMethod } from "@domain/repositories/payment.repository";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { usePaymentPage } from "@presentation/hooks/usePaymentPage";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useServices } from "@providers/service-context";

import { PaymentBar } from "./fragments/PaymentBar";
import { PaymentMethods } from "./fragments/PaymentMethods";
import { PaymentHoldBanner, PaymentSummary } from "./fragments/PaymentSummary";
import { PaymentTopBar } from "./fragments/PaymentTopBar";
import type { PaymentScreenProps } from "./interface";
import { paymentScrollContent } from "./style";

export function PaymentScreen({ bookingId }: PaymentScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const { serverClock } = useServices();
  const { page, isLoading } = usePaymentPage(bookingId);

  const [method, setMethod] = useState<PaymentMethod | null>(null);

  // Default to the first server method once the page arrives (AC2).
  useEffect(() => {
    if (page && method === null && page.methods.length > 0) {
      setMethod(page.methods[0]);
    }
  }, [page, method]);

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: page?.paymentExpiresAt,
    serverTimeIso: page?.serverTime,
    onExpire: () => router.replace(`/expired/${bookingId}` as Href),
  });

  const warnTimer = remainingMs <= 60_000;

  if (isLoading || !page) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background"
        testID="payment-loading"
      >
        <Text className="text-sm text-muted-foreground">Memuat pembayaran…</Text>
      </View>
    );
  }

  return (
    <ScreenFade>
      <View className="flex-1 bg-background">
        <PaymentTopBar
          remainingMs={remainingMs}
          warn={warnTimer}
          expired={expired}
          onBack={() => router.replace("/" as Href)}
        />

        <ScrollView
          contentContainerStyle={paymentScrollContent(isDesktop)}
          testID="payment-scroll"
        >
          <PaymentHoldBanner />
          <PaymentSummary bookingId={bookingId} amountMinor={page.amountMinor} />
          <View className="h-3.5" />
          <PaymentMethods
            methods={page.methods}
            selected={method}
            onSelect={setMethod}
          />
        </ScrollView>

        <PaymentBar
          amountMinor={page.amountMinor}
          canPay={method !== null && !expired}
          pending={false}
          expired={expired}
          onPay={() => {
            // RBT-061 wires createAttempt → SNAP handoff here; RBT-060 lands
            // the page (summary + method + server timer).
          }}
          bottomInset={insets.bottom}
        />
      </View>
    </ScreenFade>
  );
}
