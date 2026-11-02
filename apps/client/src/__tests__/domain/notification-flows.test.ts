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
  paymentSuccess,
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

  it("exposes exactly the four mandated kinds", () => {
    expect(NOTIFICATION_KINDS).toEqual([
      "expiry_reminder",
      "payment_success",
      "admission",
      "event_reminder",
    ]);
  });
});

describe("notificationRoute", () => {
  it("returns the deep link when it is an in-app path", () => {
    expect(notificationRoute({ deepLink: "/success/bk-1" })).toBe("/success/bk-1");
  });
  it("returns null for an absent or non-path link", () => {
    expect(notificationRoute({ deepLink: undefined })).toBeNull();
    expect(notificationRoute({ deepLink: "https://evil.example" })).toBeNull();
  });
});
