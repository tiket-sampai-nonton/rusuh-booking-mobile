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
import { paymentCancelled } from "@domain/rules/notification-flows";
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
import {
  applyPaymentExitResult,
  isTerminalPaymentStatus,
  reconcileExpiredPaymentStatus,
  requestPaymentExit,
  reconcilePaymentOnReconnect,
  recoverUnavailablePaymentPage,
  routeTerminalPaymentStatus,
  updatePaymentNotification,
} from "./effects";

function expiryRetryLabel(isChecking: boolean, isOffline: boolean): string {
  if (isChecking) return "MEMERIKSA…";
  if (isOffline) return "MENUNGGU KONEKSI";
  return "PERIKSA STATUS";
}

export function PaymentScreen({
  bookingId,
  eventId: routeEventId,
}: PaymentScreenProps) {
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
  const sessionEventId = useSessionStore((s) => s.eventId);
  const eventId = routeEventId ?? sessionEventId;
  const eventQuery = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
  const successHref =
    `/success/${encodeURIComponent(bookingId)}${eventQuery}` as Href;
  const paymentHref = `/payment/${encodeURIComponent(bookingId)}${eventQuery}`;
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
  } = usePaymentPage(bookingId, eventId);
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
    restoreBrowserLocation.current =
      navigationHistory.captureRestorePoint(paymentHref);
  }, [navigationHistory, paymentHref]);

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
    return recoverUnavailablePaymentPage({
      pageError,
      checkedPage: checkedUnavailablePage,
      isOffline: connectivity.isOffline,
      verify: () => verifyPayment(bookingId),
      syncServerTime: (time) => serverClock.sync(time),
      clearJourney: () => paymentJourneyStorage.clear(),
      clearQueue: clearQueueMembership,
      resetSession,
      showSuccess: () => router.replace(successHref),
      showHome: () => router.replace("/" as Href),
    });
  }, [
    bookingId,
    successHref,
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
    routeTerminalPaymentStatus(
      page?.currentAttempt?.status,
      bookingId,
      () => paymentJourneyStorage.clear(),
      () => router.replace(successHref),
      (id) => router.replace(`/failed/${id}` as Href),
    );
  }, [
    bookingId,
    page?.currentAttempt?.status,
    paymentJourneyStorage,
    router,
    successHref,
  ]);

  const reconcileExpiredPayment = useCallback(
    () =>
      reconcileExpiredPaymentStatus({
        inFlight: expiryCheckInFlight,
        isOffline: connectivity.isOffline,
        bookingId,
        setError: setExpiryRecoveryError,
        setVerifying: setIsVerifyingExpiry,
        reconcile: () => reconcilePayment.mutateAsync(bookingId),
        serverClock,
        clearJourney: () => paymentJourneyStorage.clear(),
        showSuccess: () => router.replace(successHref),
        showFailure: () =>
          router.replace(`/failed/${bookingId}?reason=payment` as Href),
        paymentExpiresAt: page?.paymentExpiresAt,
        refreshPage: async () =>
          (await retryPaymentPage()) as {
            isError?: boolean;
            error?: Error | null;
          },
      }),
    [
      bookingId,
      successHref,
      connectivity.isOffline,
      page?.paymentExpiresAt,
      paymentJourneyStorage,
      reconcilePayment,
      retryPaymentPage,
      router,
      serverClock,
    ],
  );

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: page?.paymentExpiresAt,
    serverTimeIso: page?.serverTime,
    onExpire: () => {
      if (!isTerminalPaymentStatus(page?.currentAttempt?.status))
        void reconcileExpiredPayment();
    },
  });

  useEffect(() => {
    reconcilePaymentOnReconnect(
      connectivity.justReconnected,
      reconnectCheckHandled,
      expiryRecoveryError !== undefined,
      expired,
      () => void reconcileExpiredPayment(),
    );
  }, [
    connectivity.justReconnected,
    expired,
    expiryRecoveryError,
    reconcileExpiredPayment,
  ]);

  useEffect(() => {
    if (!page) return;
    updatePaymentNotification({
      isNative,
      status: page.currentAttempt?.status,
      bookingId,
      remainingMs: serverClock.remaining(page.paymentExpiresAt),
      schedule: (notification) => scheduleNotification.execute(notification),
      cancel: (id) => cancelNotification.execute(id),
    });
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
                {expiryRetryLabel(isVerifyingExpiry, connectivity.isOffline)}
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
          onLeave={() => {
            if (leaveWithoutCancel) {
              setConfirmLeave(false);
              router.replace("/" as Href);
              return;
            }
            setLeaveError(undefined);
            void requestPaymentExit({
              cancelBooking: () => cancelBooking.mutateAsync(bookingId),
              reconcilePayment: () => reconcilePayment.mutateAsync(bookingId),
              clearJourney: () => paymentJourneyStorage.clear(),
              clearQueue: clearQueueMembership,
              syncServerTime: (time) => serverClock.sync(time),
            }).then((result) => {
              applyPaymentExitResult({
                result,
                isNative,
                setConfirmLeave,
                setLeaveWithoutCancel,
                setLeaveError,
                resetSession,
                goHome: () => router.replace("/" as Href),
                goSuccess: () => router.replace(successHref),
                goExpired: () => router.replace(`/failed/${bookingId}` as Href),
                goFailed: () =>
                  router.replace(`/failed/${bookingId}?reason=payment` as Href),
                notifyCancelled: () => {
                  void scheduleNotification
                    .execute(paymentCancelled(bookingId))
                    .catch(() => undefined);
                },
              });
            });
          }}
        />
      </View>
    </ScreenFade>
  );
}
