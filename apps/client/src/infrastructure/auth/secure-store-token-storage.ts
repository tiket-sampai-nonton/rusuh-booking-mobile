/**
 * SecureStoreTokenStorage — adapter for `TokenStorage` over expo-secure-store
 * (RBT-023, E3). The ONLY place expo-secure-store is imported (ARCHITECTURE §3:
 * platform SDKs live in infrastructure, never in domain/application).
 *
 * Native-only: SecureStore persists the auth token in the OS keychain /
 * KeyStore. SecureStore is UNSUPPORTED on web — the composition root binds the
 * in-memory fallback there instead (SECURITY.md: web keeps the token in memory
 * only, so it does not survive a reload).
 *
 * SECURITY: the raw token is written/read only through SecureStore under a
 * fixed key and is NEVER logged.
 */
import * as SecureStore from "expo-secure-store";

import type { TokenStorage } from "@domain/auth/token-storage.port";

/**
 * Fixed keychain key for the auth session token. Alphanumeric + "." / "-" / "_"
 * only, per SecureStore's key constraint.
 */
export const AUTH_TOKEN_KEY = "rusuh.auth.token";

export class SecureStoreTokenStorage implements TokenStorage {
  constructor(private readonly key = AUTH_TOKEN_KEY) {}
  async save(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.key, token);
  }

  async load(): Promise<string | null> {
    return SecureStore.getItemAsync(this.key);
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(this.key);
  }
}
