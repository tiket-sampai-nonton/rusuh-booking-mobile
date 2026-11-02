/**
 * SecureStoreQueueMembership — adapter for `QueueMembershipStorage` over
 * expo-secure-store (RBT-041, E5 Queue). Mirrors the RBT-023
 * `SecureStoreTokenStorage` split: one of the ONLY places expo-secure-store is
 * imported (ARCHITECTURE §3: platform SDKs live in infrastructure, never in
 * domain/application).
 *
 * Native-only: SecureStore persists under a fixed key in the OS keychain /
 * KeyStore so the anonymous waiting-room membership survives app restart.
 * SecureStore is UNSUPPORTED on web — the composition root binds the in-memory
 * fallback there instead (web membership lives in memory only, does not survive
 * a reload).
 *
 * The membership (eventId + queueId) is not a secret, but it is persisted
 * through SecureStore to reuse the ONE native storage dependency already added
 * in RBT-023 rather than pulling in a second storage SDK.
 */
import * as SecureStore from "expo-secure-store";

import type {
  QueueMembership,
  QueueMembershipStorage,
} from "@domain/queue/queue-membership.port";

/**
 * Fixed keychain key for the waiting-room membership. Alphanumeric + "." / "-" /
 * "_" only, per SecureStore's key constraint.
 */
export const QUEUE_MEMBERSHIP_KEY = "rusuh.queue.membership";

export class SecureStoreQueueMembership implements QueueMembershipStorage {
  async save(membership: QueueMembership): Promise<void> {
    await SecureStore.setItemAsync(
      QUEUE_MEMBERSHIP_KEY,
      JSON.stringify(membership),
    );
  }

  async load(): Promise<QueueMembership | null> {
    const raw = await SecureStore.getItemAsync(QUEUE_MEMBERSHIP_KEY);
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<QueueMembership>;
      // Defensive: only resume a well-formed record; a malformed value (older
      // schema, manual tamper) is treated as "no membership".
      if (
        typeof parsed?.eventId === "string" &&
        typeof parsed?.queueId === "string"
      ) {
        return { eventId: parsed.eventId, queueId: parsed.queueId };
      }
      return null;
    } catch {
      return null;
    }
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(QUEUE_MEMBERSHIP_KEY);
  }
}
