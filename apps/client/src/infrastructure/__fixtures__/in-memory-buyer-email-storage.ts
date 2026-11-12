import type { BuyerEmailStorage } from "@domain/auth/buyer-email-storage.port";

/** Process-lifetime implementation for mock mode and deterministic tests. */
export class InMemoryBuyerEmailStorage implements BuyerEmailStorage {
  private email: string | null = null;

  async save(email: string): Promise<void> {
    this.email = email;
  }

  async load(): Promise<string | null> {
    return this.email;
  }

  async clear(): Promise<void> {
    this.email = null;
  }
}
