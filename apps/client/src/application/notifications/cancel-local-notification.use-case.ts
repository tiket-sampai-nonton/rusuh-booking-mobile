/** CancelLocalNotification — application use case over the notification port. */
import type { NotificationPort } from "@domain/services/notification.port";

export class CancelLocalNotification {
  constructor(private readonly notifications: NotificationPort) {}

  execute(notificationId: string): Promise<void> {
    return this.notifications.cancelLocal(notificationId);
  }
}
