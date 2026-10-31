/**
 * Payment PageScreen (folder index) — parent component (orchestration only).
 *
 * Order summary + method select + server timer (RBT-060/061), 1:1 of prototype
 * `payment.html`: Total == amountMinor with NO service/hidden-fee line (D10.1);
 * method selection (VA/QRIS/GoPay); a server-authoritative countdown; "Bayar
 * Sekarang" → createAttempt (idempotent) → SNAP handoff (D10.5). The FE never
 * collects a payment instrument. Markup → ./fragments, styles → ./style, types
 * → ./interface (presentation refactor rule).
 */
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { PaymentMethod } from "@domain/repositories/payment.repository";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { usePayment } from "@presentation/hooks/usePayment";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useSessionStore } from "@presentation/stores/session-store";
import { useServices } from "@providers/service-context";

import { PaymentBar } from "./fragments/PaymentBar";
import { PaymentMethods } from "./fragments/PaymentMethods";
import { PaymentHoldBanner, PaymentSummary } from "./fragments/PaymentSummary";
import { PaymentTopBar } from "./fragments/PaymentTopBar";
import type { PaymentScreenProps } from "./interface";
import { paymentScrollContent } from "./style";

/** Fallback 10-min window shown before an attempt supplies paymentExpiresAt. */
const DEFAULT_PAYMENT_WINDOW_MS = 600_000;

export function PaymentScreen({ bookingId }: PaymentScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const { serverClock } = useServices();
  const { createAttempt } = usePayment();
  const amountMinor = useSessionStore((s) => s.amountMinor);

  const [method, setMethod] = useState<PaymentMethod | null>(null);
  // Default deadline (10 min from first render) until the attempt returns a
  // server paymentExpiresAt; kept stable across renders.
  const [defaultDeadline] = useState(() =>
    new Date(Date.now() + DEFAULT_PAYMENT_WINDOW_MS).toISOString(),
  );
  const attempt = createAttempt.data;
  const expiresAt = attempt?.paymentExpiresAt ?? defaultDeadline;
  const serverTime = attempt?.serverTime;

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: expiresAt,
    serverTimeIso: serverTime,
    onExpire: () => router.replace(`/expired/${bookingId}` as Href),
  });

  const onPay = (): void => {
    if (!method || expired) return;
    createAttempt.mutate(
      { bookingId, method },
      {
        onSuccess: () => {
          // Hand off to SNAP (prototype: local snap simulator). The gateway
          // returns to success/failed; we never mark PAID from here.
          router.push(`/snap/${bookingId}` as Href);
        },
      },
    );
  };

  const warnTimer = remainingMs <= 120_000;
  const canPay = !!method && !expired && !createAttempt.isPending;

  return (
    <ScreenFade>
      <View className="flex-1 bg-background">
        <PaymentTopBar
          remainingMs={remainingMs}
          warn={warnTimer}
          expired={expired}
          onBack={() => router.back()}
        />

        <ScrollView contentContainerStyle={paymentScrollContent(isDesktop)} testID="payment-scroll">
          <PaymentHoldBanner />
          <PaymentSummary bookingId={bookingId} amountMinor={amountMinor} />
          <PaymentMethods selected={method} onSelect={setMethod} />

          <Text className="mt-2.5 px-1 text-2xs leading-5 text-muted-foreground">
            💡 Halaman ini dipakai bersama web &amp; aplikasi mobile (WebView via
            page-token). Timer dihitung dari paymentExpiresAt + serverTime, jadi
            refresh/pindah app tidak mereset waktu.
          </Text>
        </ScrollView>

        <PaymentBar
          amountMinor={amountMinor}
          canPay={canPay}
          pending={createAttempt.isPending}
          expired={expired}
          errorMessage={
            createAttempt.isError
              ? createAttempt.error?.message || "Gagal memproses pembayaran. Coba lagi."
              : undefined
          }
          onPay={onPay}
          bottomInset={insets.bottom}
        />
      </View>
    </ScreenFade>
  );
}
