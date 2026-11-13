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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ConnectivityBanner } from "@presentation/components/ConnectivityBanner";
import { usePayment } from "@presentation/hooks/usePayment";
import { useConnectivity } from "@presentation/hooks/useConnectivity";
import { usePaymentPage } from "@presentation/hooks/usePaymentPage";
import { useClearQueueMembership } from "@presentation/hooks/useRestoreMembership";
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
  const connectivity = useConnectivity();
  const {
    serverClock,
    notification,
    paymentJourneyStorage,
    navigationHistory,
  } = useServices();
  const clearQueueMembership = useClearQueueMembership();
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
  const { createAttempt, resumeHandoff, cancelBooking, reconcilePayment } =
    usePayment();
  const verifyPayment = reconcilePayment.mutateAsync;
  const setBooking = useSessionStore((s) => s.setBooking);
  const resetSession = useSessionStore((s) => s.reset);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [handoffError, setHandoffError] = useState(false);
  const [leaveError, setLeaveError] = useState<string>();
  const [leaveWithoutCancel, setLeaveWithoutCancel] = useState(false);
  const [expiryRecoveryError, setExpiryRecoveryError] = useState<string>();
  const [isVerifyingExpiry, setIsVerifyingExpiry] = useState(false);
  const expiryCheckInFlight = useRef(false);
  const reconnectCheckHandled = useRef(false);
  const restoreBrowserLocation = useRef<() => void>(() => undefined);
  const checkedUnavailablePage = useRef<Error | null>(null);

  useEffect(() => {
    restoreBrowserLocation.current = navigationHistory.captureRestorePoint(
      `/payment/${encodeURIComponent(bookingId)}`,
    );
  }, [bookingId, navigationHistory]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      const actionType = event.data.action.type;
      if (
        actionType === "GO_BACK" ||
        actionType === "POP" ||
        actionType === "POP_TO_TOP" ||
        (!isNative && actionType === "RESET")
      ) {
        event.preventDefault();
        if (!isNative && actionType === "RESET") {
          restoreBrowserLocation.current();
        }
        setConfirmLeave(true);
      }
    });
    return unsubscribe;
  }, [isNative, navigation]);

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

  useEffect(() => {
    if (
      !pageError ||
      !pageError.message.includes("BOOKING_NOT_PAYABLE") ||
      checkedUnavailablePage.current === pageError ||
      connectivity.isOffline
    )
      return;
    checkedUnavailablePage.current = pageError;
    let active = true;
    void verifyPayment(bookingId)
      .then(async (status) => {
        if (!active) return;
        if (status.serverTime) serverClock.sync(status.serverTime);
        if (status.status === "PAID") {
          await paymentJourneyStorage.clear();
          if (active) router.replace(`/success/${bookingId}` as Href);
        } else if (status.status === "EXPIRED" || status.status === "FAILED") {
          await Promise.all([
            paymentJourneyStorage.clear(),
            clearQueueMembership(),
          ]);
          if (active) {
            resetSession();
            router.replace("/" as Href);
          }
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [
    bookingId,
    clearQueueMembership,
    connectivity.isOffline,
    pageError,
    paymentJourneyStorage,
    verifyPayment,
    resetSession,
    router,
    serverClock,
  ]);

  useEffect(() => {
    const status = page?.currentAttempt?.status;
    if (status !== "PAID" && status !== "FAILED" && status !== "EXPIRED") {
      return;
    }
    void paymentJourneyStorage.clear().catch(() => undefined);
    if (status === "PAID") router.replace(`/success/${bookingId}` as Href);
    else router.replace(`/failed/${bookingId}` as Href);
  }, [bookingId, page?.currentAttempt?.status, paymentJourneyStorage, router]);

  const reconcileExpiredPayment = useCallback(async (): Promise<void> => {
    if (expiryCheckInFlight.current) return;
    if (connectivity.isOffline) {
      setExpiryRecoveryError(
        "Koneksi terputus. Status pembayaran akan diperiksa saat koneksi kembali.",
      );
      return;
    }

    expiryCheckInFlight.current = true;
    setIsVerifyingExpiry(true);
    setExpiryRecoveryError(undefined);
    try {
      const status = await reconcilePayment.mutateAsync(bookingId);
      if (status.serverTime) serverClock.sync(status.serverTime);
      if (status.status === "PAID") {
        void paymentJourneyStorage.clear().catch(() => undefined);
        router.replace(`/success/${bookingId}` as Href);
        return;
      }
      if (status.status === "FAILED" || status.status === "EXPIRED") {
        void paymentJourneyStorage.clear().catch(() => undefined);
        router.replace(`/failed/${bookingId}?reason=payment` as Href);
        return;
      }

      const latestDeadline = status.paymentExpiresAt ?? page?.paymentExpiresAt;
      if (latestDeadline && serverClock.remaining(latestDeadline) > 0) {
        const result = (await retryPaymentPage()) as {
          isError?: boolean;
          error?: Error | null;
        };
        if (result.isError) {
          throw result.error ?? new Error("Payment page refresh failed");
        }
        setExpiryRecoveryError(undefined);
      } else {
        setExpiryRecoveryError(
          "Pembayaran masih menunggu konfirmasi server. Periksa status lagi sebelum melanjutkan.",
        );
      }
    } catch (error) {
      setExpiryRecoveryError(
        apiErrorMessage(
          error,
          "Status pembayaran belum dapat dipastikan. Periksa koneksi lalu coba lagi.",
        ),
      );
    } finally {
      expiryCheckInFlight.current = false;
      setIsVerifyingExpiry(false);
    }
  }, [
    bookingId,
    connectivity.isOffline,
    page?.paymentExpiresAt,
    paymentJourneyStorage,
    reconcilePayment,
    retryPaymentPage,
    router,
    serverClock,
  ]);

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: page?.paymentExpiresAt,
    serverTimeIso: page?.serverTime,
    onExpire: () => {
      const status = page?.currentAttempt?.status;
      const hasTerminalResult =
        status === "PAID" || status === "FAILED" || status === "EXPIRED";
      if (!hasTerminalResult) void reconcileExpiredPayment();
    },
  });

  useEffect(() => {
    if (!connectivity.justReconnected) {
      reconnectCheckHandled.current = false;
      return;
    }
    if (
      !reconnectCheckHandled.current &&
      (expiryRecoveryError !== undefined || expired)
    ) {
      reconnectCheckHandled.current = true;
      void reconcileExpiredPayment();
    }
  }, [
    connectivity.justReconnected,
    expired,
    expiryRecoveryError,
    reconcileExpiredPayment,
  ]);

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
      <View className="flex-1 bg-background" testID="payment-loading">
        <ConnectivityBanner
          isOffline={connectivity.isOffline}
          justReconnected={connectivity.justReconnected}
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-muted-foreground">
            Memuat pembayaran…
          </Text>
        </View>
      </View>
    );
  }

  // `/payment/[bookingId]` is a public URL shape, but the page and all actions
  // stay gated by the BE's booking lookup. Direct/invalid access must settle on
  // a recoverable screen instead of leaving a spinner or exposing pay actions.
  if (!page) {
    return (
      <View className="flex-1 bg-background" testID="payment-unavailable">
        <ConnectivityBanner
          isOffline={connectivity.isOffline}
          justReconnected={connectivity.justReconnected}
        />
        <View className="flex-1 items-center justify-center p-6">
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
              disabled={isRetryingPaymentPage || connectivity.isOffline}
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
        <ConnectivityBanner
          isOffline={connectivity.isOffline}
          justReconnected={connectivity.justReconnected}
          detail="Koneksi terputus. Jangan tutup alur pembayaran; status dan waktu akan dicocokkan kembali saat koneksi pulih."
        />
        {expiryRecoveryError ? (
          <View className="flex-row items-center justify-between gap-3 border-b-2 border-ink bg-background px-4 py-3">
            <Text className="flex-1 text-sm">{expiryRecoveryError}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Periksa status pembayaran"
              disabled={isVerifyingExpiry || connectivity.isOffline}
              onPress={() => void reconcileExpiredPayment()}
              testID="payment-expiry-retry"
              className="min-h-11 justify-center border-2 border-ink px-3"
            >
              <Text className="text-xs font-bold">
                {isVerifyingExpiry
                  ? "MEMERIKSA…"
                  : connectivity.isOffline
                    ? "MENUNGGU KONEKSI"
                    : "PERIKSA STATUS"}
              </Text>
            </Pressable>
          </View>
        ) : null}

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
          pending={cancelBooking.isPending || reconcilePayment.isPending}
          errorMessage={leaveError}
          bodyText={
            inFlight && !leaveWithoutCancel
              ? "Kami akan memastikan status pembayaran ke server sebelum keluar."
              : undefined
          }
          leaveLabel={
            leaveWithoutCancel ? "Keluar, lanjutkan nanti" : undefined
          }
          onStay={() => {
            setLeaveError(undefined);
            setLeaveWithoutCancel(false);
            setConfirmLeave(false);
          }}
          onLeave={async () => {
            if (leaveWithoutCancel) {
              setConfirmLeave(false);
              router.replace("/" as Href);
              return;
            }
            setLeaveError(undefined);
            try {
              const booking = await cancelBooking.mutateAsync(bookingId);
              if (booking.status === "PAID") {
                setConfirmLeave(false);
                void paymentJourneyStorage.clear().catch(() => undefined);
                router.replace(`/success/${bookingId}` as Href);
                return;
              }
              if (
                booking.status !== "CANCELLED" &&
                booking.status !== "EXPIRED"
              ) {
                setLeaveError(
                  "Status booking belum dapat dipastikan. Coba lagi atau tetap di halaman ini.",
                );
                return;
              }
              setConfirmLeave(false);
              await Promise.all([
                paymentJourneyStorage.clear().catch(() => undefined),
                clearQueueMembership().catch(() => undefined),
              ]);
              if (booking.status === "CANCELLED" && isNative) {
                void scheduleNotification
                  .execute(paymentCancelled(bookingId))
                  .catch(() => undefined);
              }
              resetSession();
              router.replace(
                booking.status === "EXPIRED"
                  ? (`/failed/${bookingId}` as Href)
                  : ("/" as Href),
              );
            } catch (error) {
              try {
                const status = await reconcilePayment.mutateAsync(bookingId);
                if (status.serverTime) serverClock.sync(status.serverTime);
                if (status.status === "PAID") {
                  void paymentJourneyStorage.clear().catch(() => undefined);
                  setConfirmLeave(false);
                  router.replace(`/success/${bookingId}` as Href);
                  return;
                }
                if (status.status === "FAILED" || status.status === "EXPIRED") {
                  void paymentJourneyStorage.clear().catch(() => undefined);
                  setConfirmLeave(false);
                  router.replace(`/failed/${bookingId}?reason=payment` as Href);
                  return;
                }
                setLeaveWithoutCancel(true);
                setLeaveError(
                  "Pembayaran masih aktif di SNAP dan belum dapat dibatalkan. Kamu dapat kembali ke SNAP atau keluar lalu melanjutkannya nanti.",
                );
              } catch (statusError) {
                setLeaveError(
                  apiErrorMessage(
                    statusError ?? error,
                    "Status belum dapat dipastikan. Periksa koneksi lalu coba lagi.",
                  ),
                );
              }
            }
          }}
        />
      </View>
    </ScreenFade>
  );
}
