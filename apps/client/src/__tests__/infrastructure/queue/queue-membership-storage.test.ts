/**
 * RBT-041 — QueueMembershipStorage adapters.
 *
 * 1. InMemoryQueueMembership (web/test binding): pure-TS save/load/clear
 *    round-trip, null on empty, overwrite, idempotent clear, defensive copy.
 * 2. SecureStoreQueueMembership (native binding): mocks the expo-secure-store
 *    SDK and asserts it persists JSON under the fixed key, parses it back,
 *    tolerates a missing / malformed value, and deletes on clear.
 */
import * as SecureStore from "expo-secure-store";

import type { QueueMembership } from "@domain/queue/queue-membership.port";
import { InMemoryQueueMembership } from "@infrastructure/__fixtures__/in-memory-queue-membership";
import {
  QUEUE_MEMBERSHIP_KEY,
  SecureStoreQueueMembership,
} from "@infrastructure/queue/secure-store-queue-membership";

// Mock the native SDK (hoisted above imports by babel-jest).
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(async () => undefined),
  getItemAsync: jest.fn(async () => null),
  deleteItemAsync: jest.fn(async () => undefined),
}));

const M: QueueMembership = { eventId: "evt-1", queueId: "q-evt-1" };

describe("InMemoryQueueMembership", () => {
  it("round-trips save → load", async () => {
    const store = new InMemoryQueueMembership();
    await store.save(M);
    expect(await store.load()).toEqual(M);
  });

  it("load on an empty store returns null", async () => {
    expect(await new InMemoryQueueMembership().load()).toBeNull();
  });

  it("save overwrites the previous membership", async () => {
    const store = new InMemoryQueueMembership();
    await store.save(M);
    await store.save({ eventId: "evt-2", queueId: "q-evt-2" });
    expect(await store.load()).toEqual({
      eventId: "evt-2",
      queueId: "q-evt-2",
    });
  });

  it("clear after save returns null", async () => {
    const store = new InMemoryQueueMembership();
    await store.save(M);
    await store.clear();
    expect(await store.load()).toBeNull();
  });

  it("clear on an empty store is a no-op (idempotent)", async () => {
    const store = new InMemoryQueueMembership();
    await expect(store.clear()).resolves.toBeUndefined();
    expect(await store.load()).toBeNull();
  });

  it("stores and returns a defensive copy (no mutation by reference)", async () => {
    const store = new InMemoryQueueMembership();
    const input = { eventId: "evt-1", queueId: "q-evt-1" };
    await store.save(input);
    const loaded = await store.load();
    // Mutating the original input must not affect the stored value.
    (input as { eventId: string }).eventId = "tampered";
    expect(loaded).toEqual(M);
    expect((await store.load())?.eventId).toBe("evt-1");
  });
});

// -- Native adapter over a mocked expo-secure-store SDK ----------------------

const setItem = SecureStore.setItemAsync as jest.Mock;
const getItem = SecureStore.getItemAsync as jest.Mock;
const deleteItem = SecureStore.deleteItemAsync as jest.Mock;

describe("SecureStoreQueueMembership", () => {
  beforeEach(() => {
    setItem.mockClear();
    getItem.mockClear();
    deleteItem.mockClear();
  });

  it("save() writes the membership as JSON under the fixed key", async () => {
    await new SecureStoreQueueMembership().save(M);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith(
      QUEUE_MEMBERSHIP_KEY,
      JSON.stringify(M),
    );
  });

  it("load() reads + parses the stored JSON back into a membership", async () => {
    getItem.mockResolvedValueOnce(JSON.stringify(M));
    expect(await new SecureStoreQueueMembership().load()).toEqual(M);
    expect(getItem).toHaveBeenCalledWith(QUEUE_MEMBERSHIP_KEY);
  });

  it("load() returns null when nothing is stored", async () => {
    getItem.mockResolvedValueOnce(null);
    expect(await new SecureStoreQueueMembership().load()).toBeNull();
  });

  it("load() returns null for a malformed / incomplete stored value", async () => {
    getItem.mockResolvedValueOnce("{ not json");
    expect(await new SecureStoreQueueMembership().load()).toBeNull();
    getItem.mockResolvedValueOnce(JSON.stringify({ eventId: "evt-1" }));
    expect(await new SecureStoreQueueMembership().load()).toBeNull();
  });

  it("clear() deletes the stored key", async () => {
    await new SecureStoreQueueMembership().clear();
    expect(deleteItem).toHaveBeenCalledWith(QUEUE_MEMBERSHIP_KEY);
  });
});
