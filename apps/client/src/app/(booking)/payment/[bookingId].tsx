// Booking route `/payment/[bookingId]`. Routing-only shell. RBT-060/061.
import { useLocalSearchParams } from "expo-router";

import { PaymentScreen } from "@presentation/screens/Payment";

export default function PaymentRoute() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return <PaymentScreen bookingId={bookingId ?? ""} />;
}
