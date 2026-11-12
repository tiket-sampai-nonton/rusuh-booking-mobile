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
import { useNavigation, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { BackHandler, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { PaymentMethod } from "@domain/repositories/payment.repository";
import {
  paymentCancelled,
  paymentResultNotification,
  paymentTimeout,
} from "@domain/rules/notification-flows";
import { ScheduleLocalNotification } from "@application/notifications/schedule-local-notification.use-case";
import { CancelLocalNotification } from "@application/notifications/cancel-local-notification.use-case";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { usePayment } from "@presentation/hooks/usePayment";
import { usePaymentPage } from "@presentation/hooks/usePaymentPage";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useSessionStore } from "@presentation/stores/session-store";
import { useServices } from "@providers/service-context";
import { apiErrorMessage } from "@presentation/utils/api-error-message";

import { PaymentBar } from "./fragments/PaymentBar";
import { PaymentMethods } from "./fragments/PaymentMethods";
import { PaymentHoldBanner, PaymentSummary } from "./fragments/PaymentSummary";
import { PaymentTopBar } from "./fragments/PaymentTopBar";
import type { PaymentScreenProps } from "./interface";
import { paymentScrollContent } from "./style";
import { LeaveConfirm } from "../Checkout/fragments/LeaveConfirm";

export function PaymentScreen({ bookingId }: PaymentScreenProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDesktop, isMobileWeb, isNative } = useResponsive();
  const { serverClock, notification } = useServices();
  const scheduleNotification = useMemo(
    () => new ScheduleLocalNotification(notification),
    [notification],
  );
  const cancelNotification = useMemo(
    () => new CancelLocalNotification(notification),
    [notification],
  );
  const {
    page,
    isLoading,
    error: pageError,
    refetch: retryPaymentPage,
    isFetching: isRetryingPaymentPage,
  } = usePaymentPage(bookingId);
  const { createAttempt, resumeHandoff } = usePayment();
  const setBooking = useSessionStore((s) => s.setBooking);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [handoffError, setHandoffError] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      const actionType = event.data.action.type;
      if (
        actionType === "GO_BACK" ||
        actionType === "POP" ||
        actionType === "POP_TO_TOP"
      ) {
        event.preventDefault();
        setConfirmLeave(true);
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setConfirmLeave(true);
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  const [method, setMethod] = useState<PaymentMethod | null>(null);

  // AC2 refresh-safe: an in-flight attempt (AWAITING_PAYMENT) means the user
  // already handed off to SNAP — offer "Kembali ke SNAP" instead of a new pay.
  const inFlight =
    page?.currentAttempt?.status === "AWAITING_PAYMENT"
      ? page.currentAttempt
      : undefined;

  // Default to the first server method once the page arrives (AC2).
  useEffect(() => {
    if (page && method === null && page.methods.length > 0) {
      setMethod(page.methods[0]);
    }
  }, [page, method]);

  useEffect(() => {
    if (page) setBooking(bookingId, page.amountMinor);
  }, [bookingId, page, setBooking]);

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: page?.paymentExpiresAt,
    serverTimeIso: page?.serverTime,
    onExpire: () => {
      const status = page?.currentAttempt?.status;
      const hasTerminalResult =
        status === "PAID" || status === "FAILED" || status === "EXPIRED";
      if (isNative && !hasTerminalResult) {
        void cancelNotification
          .execute(`payment-timeout-${bookingId}`)
          .catch(() => undefined)
          .then(() => scheduleNotification.execute(paymentTimeout(bookingId)))
          .catch(() => undefined);
      }
      router.replace(`/failed/${bookingId}` as Href);
    },
  });

  useEffect(() => {
    if (!isNative || !page) return;
    const attemptStatus = page.currentAttempt?.status;
    if (
      attemptStatus === "PAID" ||
      attemptStatus === "FAILED" ||
      attemptStatus === "EXPIRED"
    ) {
      const outcome = paymentResultNotification(attemptStatus, bookingId);
      void cancelNotification
        .execute(`payment-timeout-${bookingId}`)
        .catch(() => undefined)
        .then(() => scheduleNotification.execute(outcome))
        .catch(() => undefined);
      return;
    }

    // Translate the server-clock duration to an OS timestamp once per payment
    // page payload so Notifee can deliver even while the app is backgrounded.
    const remaining = serverClock.remaining(page.paymentExpiresAt);
    if (remaining <= 0) return; // The countdown's one-shot expiry path handles this.
    const scheduledAtMs = Date.now() + remaining;
    void scheduleNotification
      .execute(paymentTimeout(bookingId, scheduledAtMs))
      .catch(() => undefined);
  }, [
    bookingId,
    cancelNotification,
    isNative,
    page,
    scheduleNotification,
    serverClock,
  ]);

  const warnTimer = remainingMs <= 60_000;
  const paymentPageRetryLabel = isRetryingPaymentPage ? "MEMUAT…" : "COBA LAGI";
  let paymentErrorMessage: string | undefined;
  if (handoffError)
    paymentErrorMessage = "Gagal membuka halaman pembayaran. Coba lagi.";
  else if (createAttempt.isError)
    paymentErrorMessage = apiErrorMessage(
      createAttempt.error,
      "Gagal memproses pembayaran. Coba lagi.",
    );

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background"
        testID="payment-loading"
      >
        <Text className="text-sm text-muted-foreground">
          Memuat pembayaran…
        </Text>
      </View>
    );
  }

  // `/payment/[bookingId]` is a public URL shape, but the page and all actions
  // stay gated by the BE's booking lookup. Direct/invalid access must settle on
  // a recoverable screen instead of leaving a spinner or exposing pay actions.
  if (!page) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background p-6"
        testID="payment-unavailable"
      >
        <Text className="mb-4 text-center text-base font-bold">
          {pageError
            ? apiErrorMessage(pageError)
            : "Halaman pembayaran tidak tersedia atau sudah berakhir."}
        </Text>
        {pageError ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Coba muat pembayaran lagi"
            accessibilityState={{ disabled: isRetryingPaymentPage }}
            disabled={isRetryingPaymentPage}
            onPress={() => void retryPaymentPage()}
            testID="payment-retry"
            className="mb-4 border-2 border-ink px-6 py-3"
          >
            <Text className="font-bold">{paymentPageRetryLabel}</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cari event lagi"
          onPress={() => router.replace("/browse" as Href)}
          testID="payment-unavailable-browse"
          className="border-2 border-ink px-6 py-3"
        >
          <Text className="font-bold">CARI EVENT LAGI</Text>
        </Pressable>
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
          isMobileWeb={isMobileWeb}
          onBack={() => setConfirmLeave(true)}
        />

        <ScrollView
          contentContainerStyle={paymentScrollContent(isDesktop, isMobileWeb)}
          testID="payment-scroll"
        >
          <PaymentHoldBanner />
          <PaymentSummary
            bookingId={bookingId}
            amountMinor={page.amountMinor}
          />
          <View className="h-3.5" />
          <PaymentMethods
            methods={page.methods}
            selected={method}
            onSelect={setMethod}
          />
        </ScrollView>

        <PaymentBar
          amountMinor={page.amountMinor}
          canPay={(method !== null || inFlight !== undefined) && !expired}
          pending={createAttempt.isPending}
          expired={expired}
          resumeLabel={inFlight ? "Kembali ke SNAP" : undefined}
          errorMessage={paymentErrorMessage}
          onPay={() => {
            setHandoffError(false);
            // The bar is only pressable when canPay (a method is selected or an
            // attempt is in flight, and not expired), so the two paths below are
            // exhaustive.
            if (inFlight) {
              // Resume: re-open the SNAP handoff for the existing attempt (AC2).
              void resumeHandoff(inFlight).catch(() => setHandoffError(true));
            } else if (method) {
              // Create the attempt (idempotent) → hands off to SNAP on success.
              createAttempt.mutate({ bookingId, method });
            }
          }}
          bottomInset={insets.bottom}
        />
        <LeaveConfirm
          visible={confirmLeave}
          variant="payment"
          onStay={() => setConfirmLeave(false)}
          onLeave={() => {
            setConfirmLeave(false);
            if (isNative) {
              // The BE has no cancel-attempt endpoint; this copy accurately
              // describes the buyer leaving the payment flow, not provider cancellation.
              void scheduleNotification
                .execute(paymentCancelled(bookingId))
                .catch(() => undefined);
            }
            router.replace("/" as Href);
          }}
        />
      </View>
    </ScreenFade>
  );
}
