/**
 * RBT-023 — session lifecycle unit tests (persist / restore / clear) + the
 * InMemoryTokenStorage adapter.
 *
 * Pure-TS tests against the in-memory adapter (no React/RN/Expo). They assert
 * the save/load/clear round-trip, that restore on an empty store returns null,
 * and that clear-after-save returns null.
 */
import { ClearSession } from "@application/auth/clear-session.use-case";
import { PersistSession } from "@application/auth/persist-session.use-case";
import { RestoreSession } from "@application/auth/restore-session.use-case";
import type { TokenStorage } from "@domain/auth/token-storage.port";
import { InMemoryTokenStorage } from "@infrastructure/__fixtures__/in-memory-token-storage";

describe("InMemoryTokenStorage", () => {
  it("round-trips save → load", async () => {
    const storage = new InMemoryTokenStorage();
    await storage.save("tok-1");
    expect(await storage.load()).toBe("tok-1");
  });

  it("load on an empty store returns null", async () => {
    const storage = new InMemoryTokenStorage();
    expect(await storage.load()).toBeNull();
  });

  it("save overwrites the previous token", async () => {
    const storage = new InMemoryTokenStorage();
    await storage.save("tok-1");
    await storage.save("tok-2");
    expect(await storage.load()).toBe("tok-2");
  });

  it("clear after save returns null", async () => {
    const storage = new InMemoryTokenStorage();
    await storage.save("tok-1");
    await storage.clear();
    expect(await storage.load()).toBeNull();
  });

  it("clear on an empty store is a no-op (idempotent)", async () => {
    const storage = new InMemoryTokenStorage();
    await expect(storage.clear()).resolves.toBeUndefined();
    expect(await storage.load()).toBeNull();
  });
});

describe("session lifecycle use cases", () => {
  let storage: TokenStorage;
  beforeEach(() => {
    storage = new InMemoryTokenStorage();
  });

  it("PersistSession saves the token so RestoreSession returns it", async () => {
    await new PersistSession(storage).execute("tok-x");
    expect(await new RestoreSession(storage).execute()).toBe("tok-x");
  });

  it("RestoreSession returns null when no session was persisted", async () => {
    expect(await new RestoreSession(storage).execute()).toBeNull();
  });

  it("ClearSession removes a persisted token (sign-out)", async () => {
    await new PersistSession(storage).execute("tok-x");
    await new ClearSession(storage).execute();
    expect(await new RestoreSession(storage).execute()).toBeNull();
  });

  it("ClearSession also removes the persisted checkout email", async () => {
    const buyerEmailStorage = {
      save: jest.fn().mockResolvedValue(undefined),
      load: jest.fn().mockResolvedValue("buyer@example.com"),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    await new ClearSession(storage, buyerEmailStorage).execute();
    expect(buyerEmailStorage.clear).toHaveBeenCalledTimes(1);
  });

  it("full lifecycle: persist → restore → clear → restore(null)", async () => {
    const persist = new PersistSession(storage);
    const restore = new RestoreSession(storage);
    const clear = new ClearSession(storage);

    await persist.execute("session-token");
    expect(await restore.execute()).toBe("session-token");
    await clear.execute();
    expect(await restore.execute()).toBeNull();
  });
});
