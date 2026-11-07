import type { PushSubscriptionPort } from "@domain/services/push-subscription.port";
import { assertOk } from "@infrastructure/api/envelope";
import type { HttpClient } from "@infrastructure/http/http-client";

export class HttpPushSubscriptionAdapter implements PushSubscriptionPort {
  constructor(private readonly http: HttpClient) {}
  async register(
    eventId: string,
    platform: "ANDROID" | "IOS" | "WEB",
    pushToken: string,
  ): Promise<void> {
    assertOk(
      await this.http.request({
        method: "POST",
        url: "push-subscriptions",
        body: { eventId, platform, pushToken },
      }),
    );
  }
  async remove(eventId: string): Promise<void> {
    assertOk(
      await this.http.request({
        method: "DELETE",
        url: `push-subscriptions/${encodeURIComponent(eventId)}`,
      }),
    );
  }
}
