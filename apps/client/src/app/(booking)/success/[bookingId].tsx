import { useLocalSearchParams } from "expo-router";

import { SuccessScreen } from "@presentation/screens/Success";

// Booking route `/success/[bookingId]` — RBT-070 confirmed-order summary
// (re-verifies PAID, shows orderId/qty/amount/masked NIK). The e-ticket QR +
// download/share is RBT-071. noindex is set by the screen's own <Seo>
// (transactional ticket/NIK, SECURITY §6.5).
export default function SuccessRoute() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return <SuccessScreen bookingId={bookingId ?? ""} />;
}
