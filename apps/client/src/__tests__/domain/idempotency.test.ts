import {
  IdempotencyKeys,
  generateKey,
} from "@domain/idempotency/idempotency-key";
import { InMemoryIdempotencyStore } from "@infrastructure/__fixtures__/in-memory-idempotency-store";

describe("domain/IdempotencyKeys", () => {
  it("mints a key and persists it under the actionId", () => {
    const store = new InMemoryIdempotencyStore();
    const keys = new IdempotencyKeys(store);
    const k = keys.mint("createBooking:sess-1");
    expect(k).toMatch(/^idem_/);
    expect(store.get("createBooking:sess-1")).toBe(k);
  });

  it("reuses the SAME key on retry/refresh (mint called again)", () => {
    const store = new InMemoryIdempotencyStore();
    const keys = new IdempotencyKeys(store);
    const first = keys.mint("createBooking:sess-1");
    const second = keys.mint("createBooking:sess-1");
    expect(second).toBe(first);
  });

  it("double-submit of one action uses ONE key", () => {
    const store = new InMemoryIdempotencyStore();
    // deterministic generator to prove only ONE generation happened
    let calls = 0;
    const keys = new IdempotencyKeys(store, () => {
      calls += 1;
      return `k-${calls}`;
    });
    const a = keys.mint("pay:booking-9");
    const b = keys.mint("pay:booking-9");
    expect(a).toBe("k-1");
    expect(b).toBe("k-1");
    expect(calls).toBe(1); // generated exactly once despite two submits
  });

  it("peek reads without minting", () => {
    const store = new InMemoryIdempotencyStore();
    const keys = new IdempotencyKeys(store);
    expect(keys.peek("x")).toBeUndefined();
    const k = keys.mint("x");
    expect(keys.peek("x")).toBe(k);
  });

  it("clear removes the key (terminal) so a new action mints fresh", () => {
    const store = new InMemoryIdempotencyStore();
    let calls = 0;
    const keys = new IdempotencyKeys(store, () => `k-${++calls}`);
    const first = keys.mint("a");
    keys.clear("a");
    expect(keys.peek("a")).toBeUndefined();
    const second = keys.mint("a");
    expect(second).not.toBe(first); // fresh key after clear
    expect(second).toBe("k-2");
  });

  it("distinct actions get distinct keys", () => {
    const store = new InMemoryIdempotencyStore();
    const keys = new IdempotencyKeys(store);
    expect(keys.mint("a")).not.toBe(keys.mint("b"));
  });

  it("generateKey produces a unique, prefixed token", () => {
    const a = generateKey();
    const b = generateKey();
    expect(a).toMatch(/^idem_[0-9a-f]+_[0-9a-f]+$/);
    expect(a).not.toBe(b);
  });
});

describe("InMemoryIdempotencyStore", () => {
  it("get/set/delete round-trip", () => {
    const s = new InMemoryIdempotencyStore();
    expect(s.get("k")).toBeUndefined();
    s.set("k", "v");
    expect(s.get("k")).toBe("v");
    s.delete("k");
    expect(s.get("k")).toBeUndefined();
  });
});
