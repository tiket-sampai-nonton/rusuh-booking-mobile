export interface PushSubscriptionPort {
  register(
    eventId: string,
    platform: "ANDROID" | "IOS" | "WEB",
    pushToken: string,
  ): Promise<void>;
  remove(eventId: string): Promise<void>;
}
