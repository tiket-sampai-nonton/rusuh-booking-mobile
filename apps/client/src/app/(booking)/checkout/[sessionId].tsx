// Booking route `/checkout/[sessionId]`. Routing-only shell: reads the param
// and mounts the presentation screen. RBT-050…054.
import { useLocalSearchParams } from "expo-router";

import { CheckoutScreen } from "@presentation/screens/Checkout/CheckoutScreen";

export default function CheckoutRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <CheckoutScreen sessionId={sessionId ?? ""} />;
}
