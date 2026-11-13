import * as SecureStore from "expo-secure-store";

import type {
  PaymentJourneyReference,
  PaymentJourneyStorage,
} from "@domain/services/payment-journey-storage.port";

const STORAGE_KEY = "rusuh.payment.booking-reference";

export class PlatformPaymentJourneyStorage implements PaymentJourneyStorage {
  constructor(private readonly platform: "web" | "native") {}

  async load(): Promise<PaymentJourneyReference | null> {
    if (this.platform === "native") {
      return this.parse(await SecureStore.getItemAsync(STORAGE_KEY));
    }
    try {
      return this.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? null);
    } catch {
      return null;
    }
  }

  async save(reference: PaymentJourneyReference): Promise<void> {
    if (!reference.bookingId) return;
    const serialized = JSON.stringify(reference);
    if (this.platform === "native") {
      await SecureStore.setItemAsync(STORAGE_KEY, serialized);
      return;
    }
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, serialized);
    } catch {
      // The current journey remains usable for this app session if storage is unavailable.
    }
  }

  private parse(raw: string | null): PaymentJourneyReference | null {
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "bookingId" in parsed &&
        typeof parsed.bookingId === "string" &&
        parsed.bookingId.length > 0
      ) {
        const eventId =
          "eventId" in parsed && typeof parsed.eventId === "string"
            ? parsed.eventId
            : undefined;
        return { bookingId: parsed.bookingId, eventId };
      }
    } catch {
      // Read the legacy v1 format, which stored the booking id as a plain string.
      return { bookingId: raw };
    }
    return null;
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
  private reference: PaymentJourneyReference | null = null;

  async load(): Promise<PaymentJourneyReference | null> {
    return this.reference;
  }

  async save(reference: PaymentJourneyReference): Promise<void> {
    this.reference = reference;
  }

  async clear(): Promise<void> {
    this.reference = null;
  }
}
