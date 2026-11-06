import { useLocalSearchParams } from "expo-router";
import { Fragment } from "react";

import { Seo } from "@presentation/components/Seo";
import { CheckoutScreen } from "@presentation/screens/Checkout";

// Booking route `/checkout/[sessionId]` — RBT-051 ticket item list + rules.
// noindex: transactional page (SECURITY / §6.5).
export default function CheckoutRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const id = sessionId ?? "";
  return (
    <Fragment>
      <Seo
        title="Checkout"
        description="Pilih tiket."
        path={`/checkout/${id}`}
        noindex
      />
      <CheckoutScreen sessionId={id} />
    </Fragment>
  );
}
