/**
 * RBT-072 — notification-flows domain rule (pure): the 4 required flows carry
 * the right deep link, and notificationRoute resolves a tap target.
 */
import {
  admission,
  eventReminder,
  expiryReminder,
  notificationRoute,
  NOTIFICATION_KINDS,
  paymentCancelled,
  paymentFailure,
  paymentSuccess,
  paymentTimeout,
  queueTimeout,
  waitingRoomLeft,
} from "@domain/rules/notification-flows";

describe("required notification flows (RBT-072 AC1)", () => {
  it("expiry reminder → /payment/<booking>, carries schedule time", () => {
    const n = expiryReminder("bk-1", 123);
    expect(n.kind).toBe("expiry_reminder");
    expect(n.deepLink).toBe("/payment/bk-1");
    expect(n.scheduledAtMs).toBe(123);
    expect(n.title.length).toBeGreaterThan(0);
  });

  it("payment success → /success/<booking>", () => {
    const n = paymentSuccess("bk-1");
    expect(n.kind).toBe("payment_success");
    expect(n.deepLink).toBe("/success/bk-1");
    expect(n.notificationId).toBe("payment-success-bk-1");
  });

  it("payment failure gives a retry path without claiming the ticket is lost", () => {
    const n = paymentFailure("bk-1");
    expect(n.kind).toBe("payment_failure");
    expect(n.deepLink).toBe("/payment/bk-1");
    expect(n.body).toContain("bisa coba lagi");
  });

  it("payment timeout links to the order and can be scheduled", () => {
    const n = paymentTimeout("bk-2", 1234);
    expect(n.kind).toBe("payment_timeout");
    expect(n.notificationId).toBe("payment-timeout-bk-2");
    expect(n.deepLink).toBe("/payment/bk-2");
    expect(n.scheduledAtMs).toBe(1234);
  });

  it("queue timeout is tied to the queue and event", () => {
    const n = queueTimeout("queue-3", "evt-3");
    expect(n.kind).toBe("queue_timeout");
    expect(n.notificationId).toBe("queue-timeout-queue-3");
    expect(n.deepLink).toBe("/events/evt-3");
  });

  it("confirmed cancellation directs the buyer home to start again", () => {
    const n = paymentCancelled("bk-1");
    expect(n.kind).toBe("payment_cancelled");
    expect(n.deepLink).toBe("/");
    expect(n.body).toContain("Pesananmu sudah dibatalkan");
  });

  it("leaving the waiting room links back to the same event", () => {
    const n = waitingRoomLeft("evt-1");
    expect(n.kind).toBe("waiting_room_left");
    expect(n.deepLink).toBe("/events/evt-1");
  });

  it("admission → /checkout/<session>", () => {
    const n = admission("s-9");
    expect(n.kind).toBe("admission");
    expect(n.deepLink).toBe("/checkout/s-9");
  });

  it("event reminder → /events/<event>, carries schedule time", () => {
    const n = eventReminder("evt-7", 456);
    expect(n.kind).toBe("event_reminder");
    expect(n.deepLink).toBe("/events/evt-7");
    expect(n.scheduledAtMs).toBe(456);
  });

  it("exposes all domain notification kinds", () => {
    expect(NOTIFICATION_KINDS).toEqual([
      "expiry_reminder",
      "payment_success",
      "payment_failure",
      "payment_timeout",
      "payment_cancelled",
      "waiting_room_left",
      "queue_timeout",
      "admission",
      "event_reminder",
    ]);
  });
});

describe("notificationRoute", () => {
  it("returns the deep link when it is an in-app path", () => {
    expect(notificationRoute({ deepLink: "/success/bk-1" })).toBe(
      "/success/bk-1",
    );
  });
  it("returns null for an absent or non-path link", () => {
    expect(notificationRoute({ deepLink: undefined })).toBeNull();
    expect(notificationRoute({ deepLink: "https://evil.example" })).toBeNull();
  });
});
