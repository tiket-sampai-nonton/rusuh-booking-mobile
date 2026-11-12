import { useLocalSearchParams } from "expo-router";
import { Fragment } from "react";

import { Seo } from "@presentation/components/Seo";
import { PaymentWebViewScreen } from "@presentation/screens/PaymentWebView";

// Booking route `/payment-webview/[bookingId]` opens the SNAP WebView.
export default function PaymentWebViewRoute() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const id = bookingId ?? "";
  return (
    <Fragment>
      <Seo
        title="Pembayaran"
        description="Membuka pembayaran."
        path={`/payment-webview/${id}`}
        noindex
      />
      <PaymentWebViewScreen bookingId={id} />
    </Fragment>
  );
}
