/**
 * PaymentWebView screen — mobile page-token WebView reuse (RBT-062, D10.3).
 *
 * The mobile app opens the SNAP/payment `pageUrl` inside a WebView and exchanges
 * the one-time page token for the `rb_pay` session cookie so the SAME FE payment
 * page is reused — the server-authoritative timer is unaffected because it is
 * computed from `paymentExpiresAt`/`serverTime`, not a client clock, so moving
 * into the WebView never resets it.
 *
 * On web there is no WebView handoff (the browser is already on the page), so
 * this screen is a no-op notice there. Native renders the WebView. FE-NEED (O2):
 * endpoints mocked until the BE delivers.
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

/**
 * Map a WebView navigation URL to the result route, or null to stay. The SNAP
 * gateway returns to successReturnUrl/failedReturnUrl; the FE routes on that
 * but NEVER marks PAID itself. A SUCCESS callback goes to the RBT-063 result
 * gate (`/payment-result/...`), which verifies the authoritative status before
 * showing /success — the callback URL alone never renders PAID. A failed/expired
 * callback can route straight to /expired (no success claim to verify).
 *
 * @param attemptId carried into the result gate so it can verify this attempt.
 */
export function resolveWebViewNav(
  url: string,
  bookingId: string,
  attemptId?: string,
): string | null {
  if (url.includes("/success/")) {
    const q = attemptId ? `?attemptId=${encodeURIComponent(attemptId)}` : "";
    return `/payment-result/${bookingId}${q}`;
  }
  if (url.includes("/failed") || url.includes("/expired")) {
    return `/expired/${bookingId}`;
  }
  return null;
}

export function PaymentWebViewScreen({ bookingId }: PaymentWebViewScreenProps) {
  const router = useRouter();
  const { createToken, exchange } = usePaymentWebView();
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const token = await createToken(bookingId);
        if (cancelled) return;
        setPageUrl(token.pageUrl);
        setPageToken(token.pageToken);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // createToken is stable for the booking; run once per booking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // On web there is no WebView handoff — reuse the page directly.
  if (Platform.OS === "web") {
    return <PaymentWebViewNotice variant="web" />;
  }

  if (error) {
    return <PaymentWebViewNotice variant="error" />;
  }

  if (!pageUrl) {
    return <PaymentWebViewNotice variant="loading" />;
  }

  return (
    <View className="flex-1 bg-background" testID="paywv-container">
      <WebView
        testID="paywv-webview"
        source={{ uri: pageUrl }}
        // On load, exchange the one-time token for the rb_pay cookie so the FE
        // payment page is reused inside the WebView (D10.3).
        onLoadEnd={() => {
          if (pageToken) void exchange(pageToken).catch(() => setError(true));
        }}
        // A SNAP success/failed return navigates the app to the result route.
        onNavigationStateChange={(nav: { url: string }) => {
          const route = resolveWebViewNav(nav.url, bookingId);
          if (route) router.replace(route as Href);
        }}
      />
    </View>
  );
}
