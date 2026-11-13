import { MockQueueRepository } from "@infrastructure/__fixtures__/mock-queue.repository";

describe("Maestro queue scenarios", () => {
  it("keeps the default adaptive queue progressing to admission", async () => {
    const repo = new MockQueueRepository();
    const entry = await repo.join("evt-1");
    expect(entry.status).toBe("WAITING");
    for (let i = 0; i < 4; i += 1) {
      expect((await repo.getStatus(entry.queueId)).status).toBe("WAITING");
    }
    expect((await repo.getStatus(entry.queueId)).status).toBe("ADMITTED");
  });

  it("admits immediately when configured", async () => {
    expect(
      (await new MockQueueRepository("admitted").join("evt-1")).status,
    ).toBe("ADMITTED");
  });

  it("reports sold out after joining", async () => {
    const repo = new MockQueueRepository("sold-out");
    const entry = await repo.join("evt-1");
    expect((await repo.getStatus(entry.queueId)).status).toBe("SOLD_OUT");
  });

  it("rejects a missed claim", async () => {
    const repo = new MockQueueRepository("turn-missed");
    const entry = await repo.join("evt-1");
    expect(entry.status).toBe("ADMITTED");
    await expect(repo.claim(entry.queueId, "evt-1")).rejects.toMatchObject({
      code: "TURN_MISSED",
    });
  });
});
