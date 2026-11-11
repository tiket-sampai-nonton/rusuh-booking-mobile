import {
  WebLocalStorageTokenStorage,
  WEB_AUTH_TOKEN_KEY,
} from "@infrastructure/auth/web-local-storage-token-storage";

describe("WebLocalStorageTokenStorage", () => {
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const values = new Map<string, string>();
  const storage = {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => values.set(key, value)),
    removeItem: jest.fn((key: string) => values.delete(key)),
  };

  beforeEach(() => {
    values.clear();
    jest.clearAllMocks();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    });
  });

  afterAll(() => {
    if (originalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    } else {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  });

  it("persists, reads, and clears an access token without logging it", async () => {
    const tokenStore = new WebLocalStorageTokenStorage();
    await tokenStore.save("access-token");
    expect(await tokenStore.load()).toBe("access-token");
    expect(await new WebLocalStorageTokenStorage().load()).toBe("access-token");
    expect(storage.setItem).toHaveBeenCalledWith(
      WEB_AUTH_TOKEN_KEY,
      "access-token",
    );
    await tokenStore.clear();
    expect(await tokenStore.load()).toBeNull();
  });

  it("uses an independent key for refresh-token persistence", async () => {
    const refreshStore = new WebLocalStorageTokenStorage("rusuh.auth.refresh");
    await refreshStore.save("refresh-token");
    expect(storage.getItem("rusuh.auth.refresh")).toBe("refresh-token");
  });

  it("gracefully falls back when browser storage is unavailable", async () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("storage disabled");
      },
    });
    const tokenStore = new WebLocalStorageTokenStorage();
    await expect(tokenStore.load()).resolves.toBeNull();
    await expect(tokenStore.save("access-token")).resolves.toBeUndefined();
    await expect(tokenStore.clear()).resolves.toBeUndefined();
  });
});
