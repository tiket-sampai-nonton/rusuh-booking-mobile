/**
 * WebLocalStorageTokenStorage — browser persistence adapter for TokenStorage.
 *
 * Local storage is used for web access and refresh tokens so an account session
 * survives page refreshes. Native platforms continue to use SecureStore. Token
 * values are never logged; prefer HttpOnly cookies when the BE contract allows.
 */
import type { TokenStorage } from "@domain/auth/token-storage.port";

export const WEB_AUTH_TOKEN_KEY = "rusuh.auth.token";

export class WebLocalStorageTokenStorage implements TokenStorage {
  constructor(private readonly key = WEB_AUTH_TOKEN_KEY) {}

  async save(token: string): Promise<void> {
    this.storage()?.setItem(this.key, token);
  }

  async load(): Promise<string | null> {
    return this.storage()?.getItem(this.key) ?? null;
  }

  async clear(): Promise<void> {
    this.storage()?.removeItem(this.key);
  }

  private storage(): Storage | undefined {
    try {
      return globalThis.localStorage === undefined
        ? undefined
        : globalThis.localStorage;
    } catch {
      // Browser privacy settings may disable storage; keep SSR and guest flows usable.
      return undefined;
    }
  }
}
