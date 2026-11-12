/**
 * PaymentWebView screen — mobile page-token handoff (RBT-062, D10.3).
 *
 * The payment service returns a site-relative `/pay/{bookingId}` bootstrap URL.
 * Native resolves and validates it, then lets that same-origin FE route exchange
 * the one-use token through PaymentRepository before opening `/payment/{id}`.
 * The page and its server-authoritative timer are reused inside the WebView.
 */
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

import { usePaymentWebView } from "@presentation/hooks/usePaymentWebView";
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
    return `/failed/${encodeURIComponent(bookingId)}`;
  }
  return null;
}

/** Resolve and constrain the BE-issued URL to this booking and the site origin. */
export function resolvePaymentPageUrl(
  pageUrl: string,
  bookingId: string,
  pageToken: string,
  siteUrl = process.env.EXPO_PUBLIC_SITE_URL ??
    "https://rusuh-booking.pages.dev",
): string {
  const configuredSite = new URL(siteUrl);
  const resolved = new URL(pageUrl, `${configuredSite.origin}/`);
  if (resolved.protocol !== "https:") {
    throw new Error("Payment page URL must use HTTPS");
  }
  if (resolved.origin !== configuredSite.origin) {
    throw new Error("Payment page URL must use the configured site origin");
  }

  const route = /^\/pay\/([^/]+)\/?$/.exec(resolved.pathname);
  let routeBookingId: string | null = null;
  try {
    routeBookingId = route ? decodeURIComponent(route[1]) : null;
  } catch {
    routeBookingId = null;
  }
  if (!route || routeBookingId !== bookingId) {
    throw new Error("Payment page URL must point to this booking");
  }
  if (resolved.searchParams.get("ppt") !== pageToken) {
    throw new Error("Payment page URL must carry its one-time page token");
  }
  return resolved.toString();
}

function isConfiguredSiteUrl(url: string, siteUrl: string): boolean {
  try {
    return new URL(url).origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

export function PaymentWebViewScreen({ bookingId }: PaymentWebViewScreenProps) {
  const router = useRouter();
  const { createToken } = usePaymentWebView();
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [retryGeneration, setRetryGeneration] = useState(0);
  const siteUrl =
    process.env.EXPO_PUBLIC_SITE_URL ?? "https://rusuh-booking.pages.dev";

  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await createToken(bookingId);
        if (cancelled) return;
        setPageUrl(
          resolvePaymentPageUrl(
            token.pageUrl,
            bookingId,
            token.pageToken,
            siteUrl,
          ),
        );
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, createToken, retryGeneration, siteUrl]);

  if (Platform.OS === "web") {
    return <PaymentWebViewNotice variant="web" />;
  }

  if (error) {
    return (
      <PaymentWebViewNotice
        variant="error"
        onRetry={() => {
          setError(false);
          setPageUrl(null);
          setRetryGeneration((generation) => generation + 1);
        }}
      />
    );
  }

  if (!pageUrl) {
    return <PaymentWebViewNotice variant="loading" />;
  }

  return (
    <View className="flex-1 bg-background" testID="paywv-container">
      <WebView
        testID="paywv-webview"
        source={{ uri: pageUrl }}
        onMessage={(event) => {
          if (event.nativeEvent.data === "rb-pay-error") setError(true);
        }}
        onError={(event) => {
          const failedUrl = event.nativeEvent.url ?? "";
          if (!failedUrl || isConfiguredSiteUrl(failedUrl, siteUrl)) {
            setError(true);
          }
        }}
        onHttpError={(event) => {
          if (
            event.nativeEvent.statusCode >= 400 &&
            isConfiguredSiteUrl(event.nativeEvent.url ?? "", siteUrl)
          ) {
            setError(true);
          }
        }}
        onNavigationStateChange={(nav: { url: string }) => {
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
