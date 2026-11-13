import * as SecureStore from "expo-secure-store";

import type { PaymentJourneyStorage } from "@domain/services/payment-journey-storage.port";

const STORAGE_KEY = "rusuh.payment.booking-reference";

export class PlatformPaymentJourneyStorage implements PaymentJourneyStorage {
  constructor(private readonly platform: "web" | "native") {}

  async load(): Promise<string | null> {
    if (this.platform === "native") {
      return SecureStore.getItemAsync(STORAGE_KEY);
    }
    try {
      return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  async save(bookingId: string): Promise<void> {
    if (!bookingId) return;
    if (this.platform === "native") {
      await SecureStore.setItemAsync(STORAGE_KEY, bookingId);
      return;
    }
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, bookingId);
    } catch {
      // The current journey remains usable for this app session if storage is unavailable.
    }
  }

  async clear(): Promise<void> {
    if (this.platform === "native") {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      return;
    }
    try {
      globalThis.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      // A stale reference is harmless; the BE status gate still controls access.
    }
  }
}

export class InMemoryPaymentJourneyStorage implements PaymentJourneyStorage {
  private bookingId: string | null = null;

  async load(): Promise<string | null> {
    return this.bookingId;
  }

  async save(bookingId: string): Promise<void> {
    this.bookingId = bookingId;
  }

  async clear(): Promise<void> {
    this.bookingId = null;
  }
}
