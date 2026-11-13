import { CompositeUserDataStorage } from "@infrastructure/platform/composite-user-data-storage";

describe("CompositeUserDataStorage", () => {
  it("clears every persisted user and journey store plus idempotency keys", async () => {
    const clear = jest.fn().mockResolvedValue(undefined);
    const clearAll = jest.fn();
    const storage = new CompositeUserDataStorage([{ clear }, { clear }], {
      clearAll,
    } as never);

    await storage.clear();

    expect(clear).toHaveBeenCalledTimes(2);
    expect(clearAll).toHaveBeenCalledTimes(1);
  });

  it("attempts every cleanup and reports a partial failure", async () => {
    const rejected = jest.fn().mockRejectedValue(new Error("storage locked"));
    const completed = jest.fn().mockResolvedValue(undefined);
    const storage = new CompositeUserDataStorage(
      [{ clear: rejected }, { clear: completed }],
      { clearAll: jest.fn() } as never,
    );

    await expect(storage.clear()).rejects.toThrow(
      "Sebagian data lokal belum berhasil dihapus.",
    );
    expect(rejected).toHaveBeenCalledTimes(1);
    expect(completed).toHaveBeenCalledTimes(1);
  });
});
