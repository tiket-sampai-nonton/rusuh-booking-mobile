import * as SecureStore from "expo-secure-store";

import {
  AUTH_BUYER_EMAIL_KEY,
  SecureStoreBuyerEmailStorage,
} from "@infrastructure/auth/secure-store-buyer-email-storage";
import {
  WEB_AUTH_BUYER_EMAIL_KEY,
  WebLocalStorageBuyerEmailStorage,
} from "@infrastructure/auth/web-local-storage-buyer-email-storage";

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

describe("BuyerEmailStorage adapters", () => {
  beforeEach(() => jest.clearAllMocks());

  it("round-trips email in SecureStore", async () => {
    const storage = new SecureStoreBuyerEmailStorage();
    await storage.save("buyer@example.com");
    expect(await storage.load()).toBe("buyer@example.com");
    await storage.clear();
    expect(await storage.load()).toBeNull();
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
      AUTH_BUYER_EMAIL_KEY,
      "buyer@example.com",
    );
  });

  it("round-trips email in web localStorage", async () => {
    const values = new Map<string, string>();
    const localStorageStub = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: localStorageStub,
    });

    const storage = new WebLocalStorageBuyerEmailStorage();
    await storage.save("buyer@example.com");
    expect(await storage.load()).toBe("buyer@example.com");
    expect(values.get(WEB_AUTH_BUYER_EMAIL_KEY)).toBe("buyer@example.com");
    await storage.clear();
    expect(await storage.load()).toBeNull();
  });
});
