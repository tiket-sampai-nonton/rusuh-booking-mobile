import type { IdempotencyStore } from "@domain/idempotency/idempotency-store.port";

/** Persist non-secret action keys across reloads; native values live in Keychain/Keystore. */
export class DurableIdempotencyStore implements IdempotencyStore {
  private static readonly REGISTRY_KEY = "rusuh.idempotency.registry";

  constructor(private readonly platform: string) {}
  private storageKey(actionId: string): string {
    if (!/^[A-Za-z0-9_.-]+$/.test(actionId))
      throw new Error("Invalid idempotency action ID");
    return `rusuh.idempotency.${actionId}`;
  }
  get(actionId: string): string | undefined {
    const key = this.storageKey(actionId);
    const value =
      this.platform === "web"
        ? globalThis.localStorage.getItem(key)
        : this.secureStore().getItem(key);
    if (value) this.registerAction(actionId);
    return value || undefined;
  }
  set(actionId: string, value: string): void {
    const key = this.storageKey(actionId);
    this.registerAction(actionId);
    if (this.platform === "web") {
      globalThis.localStorage.setItem(key, value);
    } else {
      this.secureStore().setItem(key, value);
    }
  }
  delete(actionId: string): void {
    const key = this.storageKey(actionId);
    if (this.platform === "web") globalThis.localStorage.removeItem(key);
    else this.secureStore().setItem(key, "");
  }

  async clearAll(): Promise<void> {
    if (this.platform === "web") {
      const storage = globalThis.localStorage;
      const keys = Array.from({ length: storage.length }, (_, index) =>
        storage.key(index),
      ).filter(
        (key): key is string => key?.startsWith("rusuh.idempotency.") ?? false,
      );
      keys.forEach((key) => storage.removeItem(key));
      return;
    }

    const store = this.secureStore();
    await Promise.all(
      this.registeredActions().map((actionId) =>
        store.deleteItemAsync(this.storageKey(actionId)),
      ),
    );
    await store.deleteItemAsync(DurableIdempotencyStore.REGISTRY_KEY);
  }

  private registerAction(actionId: string): void {
    const actions = this.registeredActions();
    if (actions.includes(actionId)) return;
    const serialized = JSON.stringify([...actions, actionId]);
    if (this.platform === "web") {
      globalThis.localStorage.setItem(
        DurableIdempotencyStore.REGISTRY_KEY,
        serialized,
      );
    } else {
      this.secureStore().setItem(
        DurableIdempotencyStore.REGISTRY_KEY,
        serialized,
      );
    }
  }

  private registeredActions(): string[] {
    const serialized =
      this.platform === "web"
        ? globalThis.localStorage.getItem(DurableIdempotencyStore.REGISTRY_KEY)
        : this.secureStore().getItem(DurableIdempotencyStore.REGISTRY_KEY);
    if (!serialized) return [];
    try {
      const parsed: unknown = JSON.parse(serialized);
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      return [];
    }
  }

  private secureStore(): typeof import("expo-secure-store") {
    return require("expo-secure-store") as typeof import("expo-secure-store");
  }
}
