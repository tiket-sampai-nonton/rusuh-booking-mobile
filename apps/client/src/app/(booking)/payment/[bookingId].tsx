import { useLocalSearchParams } from "expo-router";
import { Fragment } from "react";

import { Seo } from "@presentation/components/Seo";
import { PaymentScreen } from "@presentation/screens/Payment";

// Booking route `/payment/[bookingId]` — RBT-060 payment page (summary +
// method + server timer). noindex: a crawler must never see payment state.
export default function PaymentRoute() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const id = bookingId ?? "";
  return (
    <Fragment>
      <Seo
        title="Pembayaran"
        description="Selesaikan pembayaran tiket."
        path={`/payment/${id}`}
        noindex
      />
      <PaymentScreen bookingId={id} />
    </Fragment>
  );
}
