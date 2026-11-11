import * as SecureStore from "expo-secure-store";

import type { BuyerEmailStorage } from "@domain/auth/buyer-email-storage.port";

export const AUTH_BUYER_EMAIL_KEY = "rusuh.auth.buyer-email";

/** Stores the signed-in checkout email in iOS Keychain / Android Keystore. */
export class SecureStoreBuyerEmailStorage implements BuyerEmailStorage {
  constructor(private readonly key = AUTH_BUYER_EMAIL_KEY) {}

  async save(email: string): Promise<void> {
    await SecureStore.setItemAsync(this.key, email);
  }

  async load(): Promise<string | null> {
    return SecureStore.getItemAsync(this.key);
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(this.key);
  }
}
