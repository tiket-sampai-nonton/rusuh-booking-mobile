/**
 * useNotifications — wires notification permission/registration + the tap→route
 * deep link (RBT-072, E8, AC1). Native only; on web it is a no-op (web push is
 * RBT-073). The backend/flows decide WHAT to send; this hook handles the device
 * side: ask permission + register for push on mount, and when the user TAPS a
 * notification, route to its `deepLink` via expo-router.
 *
 * Native SDK details stay behind NotificationPort; the route resolution uses
 * the pure `notificationRoute` rule.
 */
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { notificationRoute } from "@domain/rules/notification-flows";
import { useServices } from "@providers/service-context";

/** The subset of a tapped notification's data we route on. */
export interface TappedNotificationData {
  readonly deepLink?: string;
}

/** Pure: given a tap's data, the route to open (or null to stay). Exported for test. */
export function routeForTap(
  data: TappedNotificationData | undefined,
): string | null {
  if (!data) return null;
  return notificationRoute({ deepLink: data.deepLink });
}

export function useNotifications(): void {
  const router = useRouter();
  const { notification } = useServices();

  useEffect(() => {
    // Listen before requesting permission/token so a cold-start notification tap
    // is not missed while the optional remote registration is in progress.
    const unsubscribe = notification.subscribeToResponses((data) => {
      const route = routeForTap(data as TappedNotificationData | undefined);
      if (route) router.push(route as Href);
    });

    // Remote push is optional and may be unavailable in Expo Go or offline.
    void notification.registerForRemotePush().catch(() => undefined);

    return unsubscribe;
    // notification is a stable DI binding; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
