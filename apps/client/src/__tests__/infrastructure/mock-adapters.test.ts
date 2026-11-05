import { MockEventRepository } from "@infrastructure/__fixtures__/mock-event.repository";
import { MockQueueRepository } from "@infrastructure/__fixtures__/mock-queue.repository";
import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";
import { MockNotificationAdapter } from "@infrastructure/__fixtures__/mock-notification.adapter";
import { MockFileShareAdapter } from "@infrastructure/__fixtures__/mock-file-share.adapter";
import { MockHttpClient } from "@infrastructure/__fixtures__/mock-http-client";
import type { ShareableFile } from "@domain/services/file-share.port";

describe("MockEventRepository", () => {
  const repo = new MockEventRepository();

  it("lists seeded events as summaries", async () => {
    const events = await repo.listEvents();
    // RBT-014 expanded the shared fixtures to ≥5 events (incl. SOLD_OUT/
    // NOT_STARTED/CLOSED); assert the floor rather than a brittle exact count.
    expect(events.length).toBeGreaterThanOrEqual(5);
    expect(events[0]).toMatchObject({
      id: "evt-1",
      name: "Rusuh Fest 2026",
      status: "AVAILABLE",
      slug: "rusuh-fest-2026",
    });
    // listEvents returns summaries — the detail-only `description` is stripped.
    expect(events[0]).not.toHaveProperty("description");
  });

  it("returns detail for a known event", async () => {
    const detail = await repo.getEventDetail("evt-2");
    expect(detail.name).toBe("Nonton Bareng Finale");
    expect(detail.startsAt).toMatch(/^2026-/);
  });

  it("throws for an unknown event", async () => {
    await expect(repo.getEventDetail("nope")).rejects.toThrow(/unknown event nope/);
  });
});

describe("MockQueueRepository", () => {
  it("joins, decrements position, exposes zone/status, and leaves", async () => {
    const repo = new MockQueueRepository();
    const ticket = await repo.join("evt-1");
    expect(ticket).toMatchObject({
      queueId: "q-evt-1",
      eventId: "evt-1",
      position: 5,
      status: "WAITING",
      zone: "POSSIBLE", // position 5 > 3 → POSSIBLE branch
    });
    expect(ticket.nextPollAfterMs).toBe(2000);
    expect(typeof ticket.serverTime).toBe("string");
    await expect(repo.getQueueStatus("evt-1")).resolves.toEqual({
      admissionRatePerMin: 1400,
    });

    const s1 = await repo.getStatus("q-evt-1");
    expect(s1.position).toBe(4);
    expect(s1.zone).toBe("POSSIBLE");
    const s2 = await repo.getStatus("q-evt-1");
    expect(s2.position).toBe(3);
    expect(s2.zone).toBe("GUARANTEED"); // position ≤ 3 → GUARANTEED branch

    // drain to admission (position 0 → status ADMITTED branch)
    await repo.getStatus("q-evt-1");
    await repo.getStatus("q-evt-1");
    const admitted = await repo.getStatus("q-evt-1");
    expect(admitted.position).toBe(0);
    expect(admitted.status).toBe("ADMITTED");

    await repo.leave("q-evt-1");
    // after leaving, an unknown queue falls back to eventId "evt-1" + position 0
    const gone = await repo.getStatus("q-evt-1");
    expect(gone.position).toBe(0);
    expect(gone.eventId).toBe("evt-1"); // events map fallback branch
  });
});

describe("MockPaymentRepository", () => {
  it("creates an attempt and returns the same attempt for a reused key", async () => {
    const repo = new MockPaymentRepository();
    const a1 = await repo.createAttempt("book-1", "QRIS", "key-1");
    expect(a1.status).toBe("AWAITING_PAYMENT");
    const a2 = await repo.createAttempt("book-1", "QRIS", "key-1");
    expect(a2.attemptId).toBe(a1.attemptId); // idempotent reuse

    const a3 = await repo.createAttempt("book-1", "QRIS", "key-2");
    expect(a3.attemptId).not.toBe(a1.attemptId); // new key → new attempt
  });

  it("reads back an existing attempt and throws for an unknown one", async () => {
    const repo = new MockPaymentRepository();
    const a = await repo.createAttempt("book-9", "QRIS", "k");
    expect((await repo.getStatus(a.attemptId)).attemptId).toBe(a.attemptId);
    await expect(repo.getStatus("ghost")).rejects.toThrow(/unknown attempt ghost/);
  });

  it("getStatus settles a pending attempt to PAID after 2 polls (RBT-063)", async () => {
    const repo = new MockPaymentRepository();
    const a = await repo.createAttempt("book-5", "QRIS", "k5");
    expect(a.status).toBe("AWAITING_PAYMENT");
    // poll 1 — still pending
    expect((await repo.getStatus(a.attemptId)).status).toBe("AWAITING_PAYMENT");
    // poll 2 — settles to PAID (authoritative)
    expect((await repo.getStatus(a.attemptId)).status).toBe("PAID");
    // terminal stays terminal; the page restores the PAID attempt
    expect((await repo.getStatus(a.attemptId)).status).toBe("PAID");
    expect((await repo.getPaymentPage("book-5")).currentAttempt?.status).toBe(
      "PAID",
    );
  });

  it("createAttempt returns contract return URLs + the snap redirect (RBT-065)", async () => {
    const repo = new MockPaymentRepository();
    const a = await repo.createAttempt("book-7", "QRIS", "k7");
    expect(a.redirectUrl).toBe("/snap/book-7");
    expect(a.successReturnUrl).toBe("/payment-result/book-7");
    expect(a.failedReturnUrl).toContain("/expired/book-7");
  });

  it("snapCallback PAID/FAILED set terminal status; UNKNOWN stays pending (RBT-065)", async () => {
    const repo = new MockPaymentRepository();
    const paid = await repo.createAttempt("book-a", "QRIS", "ka");
    expect((await repo.snapCallback(paid.attemptId, "PAID")).status).toBe("PAID");
    // getStatus agrees immediately (settled poll)
    expect((await repo.getStatus(paid.attemptId)).status).toBe("PAID");

    const failed = await repo.createAttempt("book-b", "QRIS", "kb");
    expect((await repo.snapCallback(failed.attemptId, "FAILED")).status).toBe(
      "FAILED",
    );

    const unknown = await repo.createAttempt("book-c", "QRIS", "kc");
    expect((await repo.snapCallback(unknown.attemptId, "UNKNOWN")).status).toBe(
      "AWAITING_PAYMENT",
    );
  });

  it("snapCallback throws for an unknown attempt", async () => {
    const repo = new MockPaymentRepository();
    await expect(repo.snapCallback("ghost", "PAID")).rejects.toThrow(
      /unknown attempt ghost/,
    );
  });

  it("serves a payment page: server methods, amount, 10-min deadline (RBT-060)", async () => {
    const repo = new MockPaymentRepository();
    const p = await repo.getPaymentPage("book-1");
    expect(p.bookingId).toBe("book-1");
    expect(p.amountMinor).toBe(45000000);
    expect(p.methods).toContain("QRIS");
    expect(p.methods).not.toContain("CREDIT_CARD" as never);
    // paymentExpiresAt is ~10 min after serverTime.
    const delta = Date.parse(p.paymentExpiresAt) - Date.parse(p.serverTime);
    expect(delta).toBeGreaterThanOrEqual(590_000);
    expect(delta).toBeLessThanOrEqual(610_000);
    expect(p.currentAttempt).toBeUndefined(); // none yet
  });

  it("page restores the in-flight attempt after one is created (refresh-safe)", async () => {
    const repo = new MockPaymentRepository();
    const a = await repo.createAttempt("book-1", "QRIS", "k1");
    const p = await repo.getPaymentPage("book-1");
    expect(p.currentAttempt?.attemptId).toBe(a.attemptId);
  });
});

describe("MockNotificationAdapter", () => {
  it("grants permission, records schedules, and returns a push token", async () => {
    const adapter = new MockNotificationAdapter();
    expect(await adapter.requestPermission()).toBe(true);
    await adapter.scheduleLocal({ kind: "payment_success", title: "T", body: "B" });
    expect(adapter.scheduled).toHaveLength(1);
    expect(adapter.scheduled[0].title).toBe("T");
    expect(await adapter.registerForRemotePush()).toBe("mock-push-token");
  });
});

describe("MockFileShareAdapter", () => {
  const file: ShareableFile = {
    fileName: "ticket.png",
    mimeType: "image/png",
    base64: "AAAA",
  };

  it("records saved and shared files", async () => {
    const adapter = new MockFileShareAdapter();
    await adapter.save(file);
    await adapter.share(file);
    expect(adapter.saved).toEqual([file]);
    expect(adapter.shared).toEqual([file]);
  });
});

describe("MockHttpClient", () => {
  it("refuses any real request in mock mode", async () => {
    const client = new MockHttpClient();
    await expect(
      client.request({ method: "GET", url: "/events" }),
    ).rejects.toThrow(/no real HTTP in mock mode/);
  });
});
