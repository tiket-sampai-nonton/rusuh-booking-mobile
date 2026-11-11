/**
 * ScheduleLocalNotification — application use case that sends a platform
 * neutral notification through the domain port. Native delivery is bound to
 * Notifee at the composition root; application and domain remain framework-free.
 */
import type {
  LocalNotification,
  NotificationPort,
} from "@domain/services/notification.port";

export class ScheduleLocalNotification {
  constructor(private readonly notifications: NotificationPort) {}

  execute(notification: LocalNotification): Promise<void> {
    return this.notifications.scheduleLocal(notification);
  }
}
