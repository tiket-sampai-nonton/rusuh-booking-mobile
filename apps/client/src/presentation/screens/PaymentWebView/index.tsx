/** Open the backend-issued Midtrans redirect in a native WebView. */
import { useNavigation, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Platform, Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { usePayment } from "@presentation/hooks/usePayment";
import { useConnectivity } from "@presentation/hooks/useConnectivity";
import { useSessionStore } from "@presentation/stores/session-store";
import { ConnectivityBanner } from "@presentation/components/ConnectivityBanner";
import { useServices } from "@providers/service-context";
import { apiErrorMessage } from "@presentation/utils/api-error-message";
import type { PaymentStatus } from "@domain/repositories/payment.repository";
import {
  clearPaymentHandoff,
  getPaymentHandoff,
  type PaymentReturnUrls,
} from "@presentation/stores/payment-handoff";
import { PaymentWebViewNotice } from "./fragments/PaymentWebViewNotice";

export interface PaymentWebViewScreenProps {
  readonly bookingId: string;
}

/** Map a trusted site callback to the app's payment result route. */
export function resolveWebViewNav(
  url: string,
  bookingId: string,
  attemptId?: string,
  siteUrl = process.env.EXPO_PUBLIC_SITE_URL ??
    "https://rusuh-booking.pages.dev",
): string | null {
  let target: URL;
  try {
    target = new URL(url);
    if (target.origin !== new URL(siteUrl).origin) return null;
  } catch {
    return null;
  }

  const routeIdMatches = (value: string): boolean => {
    try {
      return decodeURIComponent(value) === bookingId;
    } catch {
      return false;
    }
  };
  const success = /^\/success\/([^/]+)\/?$/.exec(target.pathname);
  if (success && routeIdMatches(success[1])) {
    const query = attemptId
      ? `?attemptId=${encodeURIComponent(attemptId)}`
      : "";
    return `/payment-result/${encodeURIComponent(bookingId)}${query}`;
  }

  const result = /^\/payment-result\/([^/]+)\/?$/.exec(target.pathname);
  if (result && routeIdMatches(result[1])) {
    const callbackAttempt = target.searchParams.get("attemptId");
    return `/payment-result/${encodeURIComponent(bookingId)}${
      callbackAttempt ? `?attemptId=${encodeURIComponent(callbackAttempt)}` : ""
    }`;
  }

  const failure = /^\/(?:failed|expired)(?:\/([^/]+))?\/?$/.exec(
    target.pathname,
  );
  if (failure && (failure[1] === undefined || routeIdMatches(failure[1]))) {
    return `/payment-result/${encodeURIComponent(bookingId)}`;
  }
  return null;
}

function isConfiguredSiteUrl(url: string, siteUrl: string): boolean {
  try {
    return new URL(url).origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

export function isBackendPaymentReturn(
  url: string,
  returns?: PaymentReturnUrls,
): boolean {
  try {
    const current = new URL(url);
    if (current.protocol !== "https:") return false;
    return [returns?.successReturnUrl, returns?.failedReturnUrl].some(
      (value) => {
        if (!value) return false;
        const expected = new URL(value);
        return (
          expected.protocol === "https:" &&
          current.origin === expected.origin &&
          current.pathname === expected.pathname
        );
      },
    );
  } catch {
    return false;
  }
}

export function PaymentWebViewScreen({ bookingId }: PaymentWebViewScreenProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const [handoff] = useState(() => getPaymentHandoff(bookingId));
  const pageUrl = handoff?.url;
  const [error, setError] = useState(false);
  const [retryGeneration, setRetryGeneration] = useState(0);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string>();
  const allowRouteChange = useRef(false);
  const closeInFlight = useRef(false);
  const connectivity = useConnectivity();
  const { cancelBooking, reconcilePayment } = usePayment();
  const { paymentJourneyStorage, serverClock } = useServices();
  const eventId = useSessionStore((state) => state.eventId);
  const successHref =
    `/success/${encodeURIComponent(bookingId)}${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}` as Href;
  const paymentHref =
    `/payment/${encodeURIComponent(bookingId)}${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}` as Href;
  const siteUrl =
    process.env.EXPO_PUBLIC_SITE_URL ?? "https://rusuh-booking.pages.dev";

  useEffect(() => () => clearPaymentHandoff(bookingId), [bookingId]);

  const navigateAfterReconciliation = useCallback(
    async (status: PaymentStatus) => {
      if (status === "PAID") {
        await paymentJourneyStorage.clear().catch(() => undefined);
        allowRouteChange.current = true;
        router.replace(successHref);
      } else if (status === "FAILED" || status === "EXPIRED") {
        await paymentJourneyStorage.clear().catch(() => undefined);
        allowRouteChange.current = true;
        router.replace(`/failed/${bookingId}?reason=payment` as Href);
      } else {
        // Payment is still open or cannot yet be cancelled. The payment route
        // fetches fresh BE state and offers the existing SNAP attempt to resume.
        allowRouteChange.current = true;
        router.replace(paymentHref);
      }
    },
    [bookingId, paymentHref, paymentJourneyStorage, router, successHref],
  );

  const resumeAfterReconnect = useCallback(async (): Promise<void> => {
    if (closeInFlight.current) return;
    closeInFlight.current = true;
    setClosing(true);
    setCloseError(undefined);
    try {
      const status = await reconcilePayment.mutateAsync(bookingId);
      if (status.serverTime) serverClock.sync(status.serverTime);
      if (
        status.status === "PAID" ||
        status.status === "FAILED" ||
        status.status === "EXPIRED"
      ) {
        await navigateAfterReconciliation(status.status);
        return;
      }
      const deadline = status.paymentExpiresAt;
      if (deadline && serverClock.remaining(deadline) > 0 && pageUrl) {
        setError(false);
        setRetryGeneration((generation) => generation + 1);
        return;
      }
      await navigateAfterReconciliation(status.status);
    } catch (statusError) {
      setCloseError(
        apiErrorMessage(
          statusError,
          "Status pembayaran belum dapat diperiksa. Coba lagi saat koneksi stabil.",
        ),
      );
    } finally {
      closeInFlight.current = false;
      setClosing(false);
    }
  }, [
    bookingId,
    navigateAfterReconciliation,
    pageUrl,
    reconcilePayment,
    serverClock,
  ]);

  const closeSnap = useCallback(async (): Promise<void> => {
    if (closeInFlight.current) return;
    closeInFlight.current = true;
    setClosing(true);
    setCloseError(undefined);
    try {
      if (connectivity.isOffline) {
        await navigateAfterReconciliation("AWAITING_PAYMENT");
        return;
      }
      try {
        const booking = await cancelBooking.mutateAsync(bookingId);
        if (booking.status === "PAID") {
          await navigateAfterReconciliation("PAID");
        } else if (booking.status === "EXPIRED") {
          await navigateAfterReconciliation("EXPIRED");
        } else if (booking.status === "CANCELLED") {
          await paymentJourneyStorage.clear().catch(() => undefined);
          allowRouteChange.current = true;
          router.replace("/" as Href);
        } else {
          await navigateAfterReconciliation("AWAITING_PAYMENT");
        }
      } catch {
        // BOOKING_LOCKED is expected once SNAP created an attempt. Reconcile
        // the payment status instead of claiming that close cancelled it.
        try {
          const status = await reconcilePayment.mutateAsync(bookingId);
          await navigateAfterReconciliation(status.status);
        } catch (statusError) {
          // Keep the booking reference and return to the BE-gated payment page.
          setCloseError(
            apiErrorMessage(
              statusError,
              "Status pembayaran belum dapat dipastikan. Sambungkan kembali untuk melanjutkan.",
            ),
          );
          await navigateAfterReconciliation("AWAITING_PAYMENT");
        }
      }
    } finally {
      closeInFlight.current = false;
      setClosing(false);
    }
  }, [
    bookingId,
    cancelBooking,
    connectivity.isOffline,
    navigateAfterReconciliation,
    paymentJourneyStorage,
    reconcilePayment,
    router,
  ]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (allowRouteChange.current) return;
      const actionType = event.data.action.type;
      if (
        actionType === "GO_BACK" ||
        actionType === "POP" ||
        actionType === "POP_TO_TOP"
      ) {
        event.preventDefault();
        void closeSnap();
      }
    });
    return unsubscribe;
  }, [closeSnap, navigation]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        void closeSnap();
        return true;
      },
    );
    return () => subscription.remove();
  }, [closeSnap]);

  const reconnectCheckHandled = useRef(false);
  useEffect(() => {
    if (!connectivity.justReconnected) {
      reconnectCheckHandled.current = false;
      return;
    }
    if (error && !reconnectCheckHandled.current) {
      reconnectCheckHandled.current = true;
      void resumeAfterReconnect();
    }
  }, [connectivity.justReconnected, error, resumeAfterReconnect]);

  if (Platform.OS === "web") {
    return <PaymentWebViewNotice variant="web" />;
  }

  return (
    <View className="flex-1 bg-background" testID="paywv-container">
      <View className="h-14 flex-row items-center justify-between border-b-2 border-ink px-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutup pembayaran SNAP"
          disabled={closing}
          onPress={() => void closeSnap()}
          testID="paywv-close"
          className="min-h-11 justify-center border-2 border-ink px-4"
        >
          <Text className="text-sm font-bold">
            {closing ? "MEMERIKSA…" : "KEMBALI"}
          </Text>
        </Pressable>
        <Text className="text-sm font-bold">PEMBAYARAN</Text>
      </View>
      <ConnectivityBanner
        isOffline={connectivity.isOffline}
        justReconnected={connectivity.justReconnected}
        detail="Koneksi SNAP terputus. Pembayaran tidak otomatis dibatalkan; status akan diperiksa saat koneksi kembali."
      />
      {closeError ? (
        <Text
          className="border-b-2 border-ink px-4 py-3 text-sm"
          testID="paywv-close-error"
        >
          {closeError}
        </Text>
      ) : null}
      {error || !pageUrl ? (
        <View className="flex-1 items-center justify-center p-6">
          <PaymentWebViewNotice
            variant="error"
            onRetry={
              pageUrl && !connectivity.isOffline
                ? () => void resumeAfterReconnect()
                : undefined
            }
          />
        </View>
      ) : (
        <WebView
          key={retryGeneration}
          testID="paywv-webview"
          source={{ uri: pageUrl }}
          onError={(event) => {
            const failedUrl = event.nativeEvent.url ?? "";
            if (
              !failedUrl ||
              failedUrl === pageUrl ||
              isConfiguredSiteUrl(failedUrl, siteUrl)
            ) {
              setError(true);
            }
          }}
          onHttpError={(event) => {
            if (
              event.nativeEvent.statusCode >= 400 &&
              (event.nativeEvent.url === pageUrl ||
                isConfiguredSiteUrl(event.nativeEvent.url ?? "", siteUrl))
            ) {
              setError(true);
            }
          }}
          onNavigationStateChange={(nav: { url: string }) => {
            if (isBackendPaymentReturn(nav.url, handoff?.returns)) {
              allowRouteChange.current = true;
              router.replace(
                `/payment-result/${encodeURIComponent(bookingId)}` as Href,
              );
              return;
            }
            const route = resolveWebViewNav(
              nav.url,
              bookingId,
              undefined,
              siteUrl,
            );
            if (route) {
              allowRouteChange.current = true;
              router.replace(route as Href);
            }
          }}
        />
      )}
    </View>
  );
}
