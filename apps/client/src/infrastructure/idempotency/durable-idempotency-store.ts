import type { IdempotencyStore } from "@domain/idempotency/idempotency-store.port";

/** Persist non-secret action keys across reloads; native values live in Keychain/Keystore. */
export class DurableIdempotencyStore implements IdempotencyStore {
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
    return value || undefined;
  }
  set(actionId: string, value: string): void {
    const key = this.storageKey(actionId);
    if (this.platform === "web") globalThis.localStorage.setItem(key, value);
    else this.secureStore().setItem(key, value);
  }
  delete(actionId: string): void {
    const key = this.storageKey(actionId);
    if (this.platform === "web") globalThis.localStorage.removeItem(key);
    else this.secureStore().setItem(key, "");
  }
  private secureStore(): typeof import("expo-secure-store") {
    return require("expo-secure-store") as typeof import("expo-secure-store");
  }
}
