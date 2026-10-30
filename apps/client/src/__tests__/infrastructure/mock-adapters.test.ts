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
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ id: "evt-1", name: "Rusuh Fest 2026" });
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
  it("joins, decrements position on status, and leaves", async () => {
    const repo = new MockQueueRepository();
    const ticket = await repo.join("evt-1");
    expect(ticket).toEqual({ queueId: "q-evt-1", position: 5 });

    const s1 = await repo.getStatus("q-evt-1");
    expect(s1.position).toBe(4);
    const s2 = await repo.getStatus("q-evt-1");
    expect(s2.position).toBe(3);

    await repo.leave("q-evt-1");
    // after leaving, an unknown queue reports position 0 (floor branch)
    const s3 = await repo.getStatus("q-evt-1");
    expect(s3.position).toBe(0);
    const s4 = await repo.getStatus("q-evt-1");
    expect(s4.position).toBe(0);
  });
});

describe("MockPaymentRepository", () => {
  it("creates an attempt and returns the same attempt for a reused key", async () => {
    const repo = new MockPaymentRepository();
    const a1 = await repo.createAttempt("book-1", "key-1");
    expect(a1.status).toBe("AWAITING_PAYMENT");
    const a2 = await repo.createAttempt("book-1", "key-1");
    expect(a2.attemptId).toBe(a1.attemptId); // idempotent reuse

    const a3 = await repo.createAttempt("book-1", "key-2");
    expect(a3.attemptId).not.toBe(a1.attemptId); // new key → new attempt
  });

  it("reads back an existing attempt and throws for an unknown one", async () => {
    const repo = new MockPaymentRepository();
    const a = await repo.createAttempt("book-9", "k");
    expect((await repo.getStatus(a.attemptId)).attemptId).toBe(a.attemptId);
    await expect(repo.getStatus("ghost")).rejects.toThrow(/unknown attempt ghost/);
  });
});

describe("MockNotificationAdapter", () => {
  it("grants permission, records schedules, and returns a push token", async () => {
    const adapter = new MockNotificationAdapter();
    expect(await adapter.requestPermission()).toBe(true);
    await adapter.scheduleLocal({ title: "T", body: "B" });
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
