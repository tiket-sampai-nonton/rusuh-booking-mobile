/**
 * PaymentResultScreen — authoritative result gate (RBT-063, E7 Payment,
 * AC1/FR-25, D10.4).
 *
 * The SNAP success/failed callback returns HERE, not straight to /success. This
 * screen NEVER trusts the callback: it verifies the authoritative status via
 * `useVerifyPayment` (→ getStatus) and only then routes — PAID → /success,
 * FAILED/EXPIRED or a pending attempt past its SERVER deadline → /expired. While
 * the status is still non-terminal it shows a processing state and keeps polling
 * on a backoff cadence (one poller, TanStack-owned). noindex: a crawler must
 * never see a payment/ticket result (SECURITY §6.5).
 */
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { Seo } from "@presentation/components/Seo";
import { useVerifyPayment } from "@presentation/hooks/useVerifyPayment";
import { useSessionStore } from "@presentation/stores/session-store";

export interface PaymentResultScreenProps {
  readonly bookingId: string;
  /** The attempt whose authoritative status is verified (from the return URL). */
  readonly attemptId?: string;
}

export function PaymentResultScreen({
  bookingId,
  attemptId,
}: PaymentResultScreenProps) {
  const router = useRouter();
  // Fall back to the attempt recorded at createAttempt (refresh-safe) when the
  // callback return did not carry it (e.g. the WebView path). Scalar selector
  // (never a fresh object) so this does not re-render in a loop.
  const storeAttemptId = useSessionStore((s) => s.attemptId);
  const resolvedAttemptId = attemptId ?? storeAttemptId;
  const { verdict, isError, route } = useVerifyPayment(
    resolvedAttemptId,
    bookingId,
  );

  // Navigate ONLY on the authoritative route (replace so the processing screen
  // leaves the back stack). `route` is null while still verifying.
  useEffect(() => {
    if (route) router.replace(route as Href);
  }, [route, router]);

  const failedToVerify = isError;

  return (
    <View
      className="flex-1 items-center justify-center bg-background p-6"
      testID="payment-result"
    >
      <Seo
        title="Memproses Pembayaran"
        description="Verifying your payment."
        path={`/payment-result/${bookingId}`}
        noindex
      />
      {failedToVerify ? (
        <Text
          className="text-center text-base text-destructive"
          testID="payment-result-error"
          accessibilityRole="alert"
        >
          Gagal memeriksa status pembayaran. Mohon tunggu, kami mencoba lagi.
        </Text>
      ) : (
        <View className="items-center gap-4">
          <ActivityIndicator
            size="large"
            testID="payment-result-spinner"
            accessibilityLabel="Memproses pembayaran"
          />
          <Text
            className="text-center text-base text-foreground"
            accessibilityRole="header"
          >
            {verdict === "paid"
              ? "Pembayaran berhasil — mengalihkan…"
              : "Memverifikasi pembayaran kamu…"}
          </Text>
          <Text className="text-center text-sm text-muted-foreground">
            Jangan tutup halaman ini. Status dikonfirmasi langsung dari server.
          </Text>
        </View>
      )}
    </View>
  );
}
