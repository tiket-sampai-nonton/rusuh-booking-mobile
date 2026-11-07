import { useLocalSearchParams } from "expo-router";

import { PaymentResultScreen } from "@presentation/screens/PaymentResult";

// Booking route `/payment-result/[bookingId]` — RBT-063 authoritative result
// gate. The SNAP callback returns here; the screen verifies server-side before
// routing to /success or /expired. `attemptId` comes via the return query.
// noindex is set by the screen's own <Seo> (payment/ticket result, SECURITY §6.5).
export default function PaymentResultRoute() {
  const { bookingId, attemptId } = useLocalSearchParams<{
    bookingId: string;
    attemptId?: string;
  }>();
  return (
    <PaymentResultScreen bookingId={bookingId ?? ""} attemptId={attemptId} />
  );
}
