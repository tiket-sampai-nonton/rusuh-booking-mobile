import { DurableIdempotencyStore } from "@infrastructure/idempotency/durable-idempotency-store";

describe("DurableIdempotencyStore", () => {
  it("reuses web action keys after recreation and clears all keys at logout", async () => {
    const values = new Map<string, string>();
    const old = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        get length() {
          return values.size;
        },
        key: (index: number) => Array.from(values.keys())[index] ?? null,
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
    try {
      new DurableIdempotencyStore("web").set(
        "hold-session-1",
        "idem-1234567890",
      );
      const restored = new DurableIdempotencyStore("web");
      expect(restored.get("hold-session-1")).toBe("idem-1234567890");
      await new DurableIdempotencyStore("web").clearAll();
      expect(restored.get("hold-session-1")).toBeUndefined();
      restored.delete("hold-session-1");
      expect(restored.get("hold-session-1")).toBeUndefined();
    } finally {
      if (old) Object.defineProperty(globalThis, "localStorage", old);
      else Reflect.deleteProperty(globalThis, "localStorage");
    }
  });
});
