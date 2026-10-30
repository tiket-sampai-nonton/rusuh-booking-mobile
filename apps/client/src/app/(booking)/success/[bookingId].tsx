// Booking route `/success/[bookingId]`. Routing-only shell. RBT-070/071.
import { useLocalSearchParams } from "expo-router";

import { SuccessScreen } from "@presentation/screens/Success/SuccessScreen";

export default function SuccessRoute() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return <SuccessScreen bookingId={bookingId ?? ""} />;
}
