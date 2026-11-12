import { useLocalSearchParams } from "expo-router";

import { Seo } from "@presentation/components/Seo";
import { PaymentPageBootstrap } from "@presentation/screens/PaymentPageBootstrap";

// The Payment Service issues `/pay/{bookingId}?ppt=…&embedded=1`. Keep this
// noindex route as the native WebView bridge to the app's regular payment page.
export default function PaymentBootstrapRoute() {
  const { bookingId, ppt } = useLocalSearchParams<{
    bookingId: string;
    ppt?: string;
  }>();
  const id = bookingId ?? "";

  return (
    <>
      <Seo
        title="Membuka pembayaran"
        description="Menyiapkan sesi pembayaran yang aman."
        path={`/pay/${id}`}
        noindex
      />
      <PaymentPageBootstrap bookingId={id} pageToken={ppt} />
    </>
  );
}
