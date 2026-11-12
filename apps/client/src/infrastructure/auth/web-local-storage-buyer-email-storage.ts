import type { BuyerEmailStorage } from "@domain/auth/buyer-email-storage.port";

export const WEB_AUTH_BUYER_EMAIL_KEY = "rusuh.auth.buyer-email";

/** Browser persistence adapter; web localStorage is readable by page scripts. */
export class WebLocalStorageBuyerEmailStorage implements BuyerEmailStorage {
  constructor(private readonly key = WEB_AUTH_BUYER_EMAIL_KEY) {}

  async save(email: string): Promise<void> {
    this.storage()?.setItem(this.key, email);
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
      return undefined;
    }
  }
}
