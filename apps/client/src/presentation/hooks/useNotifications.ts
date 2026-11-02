/**
 * useNotifications — wires notification permission/registration + the tap→route
 * deep link (RBT-072, E8, AC1). Native only; on web it is a no-op (web push is
 * RBT-073). The backend/flows decide WHAT to send; this hook handles the device
 * side: ask permission + register for push on mount, and when the user TAPS a
 * notification, route to its `deepLink` via expo-router.
 *
 * expo-notifications is required lazily so importing this hook on web/test loads
 * nothing; the route resolution uses the pure `notificationRoute` rule.
 */
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import { notificationRoute } from "@domain/rules/notification-flows";
import { useServices } from "@providers/service-context";

/** The subset of a tapped notification's data we route on. */
export interface TappedNotificationData {
  readonly deepLink?: string;
}

/** Pure: given a tap's data, the route to open (or null to stay). Exported for test. */
export function routeForTap(data: TappedNotificationData | undefined): string | null {
  if (!data) return null;
  return notificationRoute({ deepLink: data.deepLink });
}

export function useNotifications(): void {
  const router = useRouter();
  const { notification } = useServices();

  useEffect(() => {
    if (Platform.OS === "web") return; // web push is RBT-073
    let subscription: { remove: () => void } | undefined;

    void (async () => {
      // Ask permission + register for remote push (token handed to the BE later).
      await notification.registerForRemotePush();
      const api = require("expo-notifications") as typeof import("expo-notifications");
      // Tap handler: route to the notification's deep link.
      subscription = api.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as
          | TappedNotificationData
          | undefined;
        const route = routeForTap(data);
        if (route) router.push(route as Href);
      });
    })();

    return () => subscription?.remove();
    // notification is a stable DI binding; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
