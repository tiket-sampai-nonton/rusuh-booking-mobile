/** Open the backend-issued Midtrans redirect in a native WebView. */
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

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
  const [handoff] = useState(() => getPaymentHandoff(bookingId));
  const pageUrl = handoff?.url;
  const [error, setError] = useState(false);
  const [retryGeneration, setRetryGeneration] = useState(0);
  const siteUrl =
    process.env.EXPO_PUBLIC_SITE_URL ?? "https://rusuh-booking.pages.dev";

  useEffect(() => () => clearPaymentHandoff(bookingId), [bookingId]);

  if (Platform.OS === "web") {
    return <PaymentWebViewNotice variant="web" />;
  }

  if (error || !pageUrl) {
    return (
      <PaymentWebViewNotice
        variant="error"
        onRetry={() => {
          setError(false);
          if (!pageUrl) router.back();
          else setRetryGeneration((generation) => generation + 1);
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-background" testID="paywv-container">
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
          if (route) router.replace(route as Href);
        }}
      />
    </View>
  );
}
