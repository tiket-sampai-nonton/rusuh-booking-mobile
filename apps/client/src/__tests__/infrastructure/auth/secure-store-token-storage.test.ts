/**
 * RBT-023 — SecureStoreTokenStorage unit tests.
 *
 * expo-secure-store is MOCKED (jest.mock) so no native keychain is touched: an
 * in-memory map stands in for the secure store. The tests assert the adapter
 * delegates to setItemAsync/getItemAsync/deleteItemAsync under the fixed key
 * and round-trips save → load → clear.
 */
import * as SecureStore from "expo-secure-store";

import {
  AUTH_TOKEN_KEY,
  SecureStoreTokenStorage,
} from "@infrastructure/auth/secure-store-token-storage";

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe("SecureStoreTokenStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("save delegates to setItemAsync under the fixed key", async () => {
    await new SecureStoreTokenStorage().save("tok-1");
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
      AUTH_TOKEN_KEY,
      "tok-1",
    );
  });

  it("round-trips save → load through SecureStore", async () => {
    const storage = new SecureStoreTokenStorage();
    await storage.save("tok-2");
    expect(await storage.load()).toBe("tok-2");
    expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
  });

  it("load returns null when the store has no token", async () => {
    const storage = new SecureStoreTokenStorage();
    await storage.clear();
    expect(await storage.load()).toBeNull();
  });

  it("clear delegates to deleteItemAsync and empties the store", async () => {
    const storage = new SecureStoreTokenStorage();
    await storage.save("tok-3");
    await storage.clear();
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      AUTH_TOKEN_KEY,
    );
    expect(await storage.load()).toBeNull();
  });
});
