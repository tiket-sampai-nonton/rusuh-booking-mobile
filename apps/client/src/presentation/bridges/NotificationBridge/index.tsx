import { useNotifications } from "@presentation/hooks/useNotifications";

/** Registers native push notifications and notification deep links. */
export function NotificationBridge() {
  useNotifications();
  return null;
}
