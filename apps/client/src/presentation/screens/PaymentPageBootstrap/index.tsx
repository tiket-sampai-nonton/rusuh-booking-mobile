/**
 * Payment page bootstrap (RBT-062): exchange the BE's one-use page token from
 * inside the same-origin WebView page context, then enter the existing payment
 * screen. The repository owns transport and cookie credentials.
 */
import { useRouter, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { usePaymentWebView } from "@presentation/hooks/usePaymentWebView";
import { PaymentWebViewNotice } from "../PaymentWebView/fragments/PaymentWebViewNotice";

export interface PaymentPageBootstrapProps {
  readonly bookingId: string;
  readonly pageToken?: string;
}

function notifyNativeExchangeFailure(): void {
  const bridge = (
    globalThis as typeof globalThis & {
      ReactNativeWebView?: { postMessage: (message: string) => void };
    }
  ).ReactNativeWebView;
  bridge?.postMessage("rb-pay-error");
}

export function PaymentPageBootstrap({
  bookingId,
  pageToken,
}: PaymentPageBootstrapProps) {
  const router = useRouter();
  const { exchange } = usePaymentWebView();
  const [error, setError] = useState(false);
  const [retryGeneration, setRetryGeneration] = useState(0);
  const pendingExchange = useRef<{
    pageToken: string;
    promise: Promise<void>;
  } | null>(null);
  const useMocks =
    process.env.EXPO_PUBLIC_USE_MOCKS !== "false" &&
    process.env.EXPO_PUBLIC_USE_MOCKS !== "0";

  useEffect(() => {
    if (!bookingId || !pageToken) {
      setError(true);
      notifyNativeExchangeFailure();
      return;
    }

    // A development mock token belongs to the native mock adapter instance;
    // it cannot be exchanged by the separately running WebView bundle.
    if (useMocks) {
      router.replace(`/payment/${encodeURIComponent(bookingId)}` as Href);
      return;
    }

    let active = true;
    if (pendingExchange.current?.pageToken !== pageToken) {
      pendingExchange.current = {
        pageToken,
        promise: exchange(pageToken),
      };
    }

    // Reuse the same promise across React Strict Mode effect replays so the
    // one-use token is never exchanged twice by a mount/unmount simulation.
    void pendingExchange.current.promise.then(
      () => {
        if (active) {
          router.replace(`/payment/${encodeURIComponent(bookingId)}` as Href);
        }
      },
      () => {
        if (active) {
          setError(true);
          notifyNativeExchangeFailure();
        }
      },
    );

    return () => {
      active = false;
    };
  }, [bookingId, exchange, pageToken, retryGeneration, router, useMocks]);

  if (error) {
    return (
      <PaymentWebViewNotice
        variant="error"
        onRetry={
          pageToken
            ? () => {
                pendingExchange.current = null;
                setError(false);
                setRetryGeneration((generation) => generation + 1);
              }
            : undefined
        }
      />
    );
  }

  return <PaymentWebViewNotice variant="loading" />;
}
