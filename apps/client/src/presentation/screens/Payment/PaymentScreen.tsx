/**
 * PaymentScreen — order summary + method select + server timer (RBT-060/061).
 *
 * Matches prototype `payment.html`: order summary with Total == amountMinor and
 * NO service/hidden-fee line (D10.1); method selection (VA/QRIS/GoPay, no credit
 * card); a server-authoritative payment countdown; "Bayar Sekarang" →
 * createAttempt (idempotent) → SNAP handoff (here, the local SNAP simulator,
 * D10.5). The FE never collects a payment instrument (SNAP owns it).
 */
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { PaymentMethod } from "@domain/repositories/payment.repository";
import { PAYMENT_METHODS } from "@domain/rules/payment-method";
import { formatCountdown } from "@domain/services/date-format";
import { minorToIDR } from "@domain/services/money";
import { usePayment } from "@presentation/hooks/usePayment";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useSessionStore } from "@presentation/stores/session-store";
import { useServices } from "@providers/service-context";

/** Fallback 10-min window shown before an attempt supplies paymentExpiresAt. */
const DEFAULT_PAYMENT_WINDOW_MS = 600_000;

export interface PaymentScreenProps {
  readonly bookingId: string;
}

export function PaymentScreen({ bookingId }: PaymentScreenProps) {
  const router = useRouter();
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

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-line bg-card px-5 pb-3 pt-12">
        <Text className="text-sm font-bold text-foreground" accessibilityRole="header">
          Pembayaran
        </Text>
        <Text
          className={`text-sm font-extrabold ${expired ? "text-error" : "text-brand"}`}
          accessibilityLabel={`Sisa waktu pembayaran ${formatCountdown(remainingMs)}`}
          accessibilityLiveRegion="polite"
          testID="payment-timer"
        >
          ⏱ {formatCountdown(remainingMs)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} testID="payment-scroll">
        <View className="rounded-2xl border border-line bg-card p-4">
          <Text className="text-2xs font-bold uppercase tracking-tag text-muted-foreground">
            Ringkasan Pesanan
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Pesanan {bookingId}
          </Text>
          {/* NO "biaya layanan" line — total is exactly amountMinor (D10.1). */}
          <View className="mt-3 flex-row items-center justify-between border-t border-line pt-3">
            <Text className="text-base font-bold text-foreground">Total</Text>
            <Text className="text-xl font-extrabold text-foreground" testID="payment-total">
              {minorToIDR(amountMinor)}
            </Text>
          </View>
        </View>

        <Text className="mt-5 text-2xs font-bold uppercase tracking-tag text-muted-foreground">
          Metode Pembayaran
        </Text>
        <View className="mt-2 gap-2">
          {PAYMENT_METHODS.map((m) => {
            const selected = method === m.code;
            return (
              <Pressable
                key={m.code}
                accessibilityRole="button"
                accessibilityLabel={m.name}
                accessibilityState={{ selected }}
                onPress={() => setMethod(m.code)}
                testID={`method-${m.code}`}
                className={`flex-row items-center gap-3 rounded-xl border p-3.5 ${selected ? "border-brand" : "border-line"}`}
              >
                <View className="h-9 w-12 items-center justify-center rounded-md bg-ink">
                  <Text className="text-2xs font-bold text-white">{m.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">{m.name}</Text>
                  <Text className="text-2xs text-muted-foreground">{m.sub}</Text>
                </View>
                <View
                  className={`h-5 w-5 rounded-full border-2 ${selected ? "border-brand bg-brand" : "border-line"}`}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="border-t border-line bg-card p-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bayar Sekarang"
          accessibilityState={{ disabled: !method || expired || createAttempt.isPending }}
          disabled={!method || expired || createAttempt.isPending}
          onPress={onPay}
          testID="pay-now"
          className={`items-center rounded-pill py-4 ${method && !expired ? "bg-brand" : "bg-muted"}`}
        >
          <Text className="text-md font-bold text-white">
            {createAttempt.isPending
              ? "Memproses…"
              : expired
                ? "Waktu habis"
                : "Bayar Sekarang →"}
          </Text>
        </Pressable>
        {createAttempt.isError ? (
          <Text className="mt-2 text-center text-xs text-error" accessibilityLiveRegion="polite">
            {createAttempt.error?.message || "Gagal memproses pembayaran. Coba lagi."}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
