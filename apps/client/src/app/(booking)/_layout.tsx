import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

import { readUseMocksFlag } from "@providers/container";
import { useSessionStore } from "@presentation/stores/session-store";

/**
 * Layout for the (booking) route group. Routing-only.
 *
 * DEV/MOCK SEED (mock mode only): a `?seed=1` query on a booking route seeds a
 * queue entry into the session store so the waiting room can be reached by a
 * direct deep link (e.g. /waiting/evt-1?seed=1 in Expo Go for native QA). It is
 * a no-op unless EXPO_PUBLIC_USE_MOCKS is on, so it can never affect a real
 * build. Downstream screens (checkout/payment/success) are reached by the
 * normal in-app flow, which carries their own server-issued ids.
 */
export default function BookingLayout() {
  const { seed, eventId } = useLocalSearchParams<{
    seed?: string;
    eventId?: string;
  }>();
  const setQueue = useSessionStore((s) => s.setQueue);

  useEffect(() => {
    if (seed !== "1" || !readUseMocksFlag()) return;
    const id = eventId ?? "evt-1";
    setQueue(id, `q-${id}`, "WAITING");
  }, [seed, eventId, setQueue]);

  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
