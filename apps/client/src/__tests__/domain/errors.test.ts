import { DomainError } from "@domain/errors/domain-error";
import {
  createReadDeduper,
  mapError,
} from "@domain/errors/error-mapper";
import { ERROR_SPECS, UNKNOWN_SPEC } from "@domain/errors/messages.id";

describe("domain/errors — mapError", () => {
  it("maps every known contract code to a typed DomainError with a Bahasa message", () => {
    for (const [code, spec] of Object.entries(ERROR_SPECS)) {
      const err = mapError({ code });
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe(code);
      expect(err.kind).toBe(spec.kind);
      expect(err.userMessage).toBe(spec.message);
      expect(err.userMessage.length).toBeGreaterThan(0);
    }
  });

  it("surfaces retryAfterMs ONLY on rate-limited errors", () => {
    const rl = mapError({ code: "RATE_LIMITED", retryAfterMs: 3000 });
    expect(rl.kind).toBe("rate_limited");
    expect(rl.retryAfterMs).toBe(3000);

    // A non-rate-limited code ignores retryAfterMs.
    const other = mapError({ code: "SESSION_EXPIRED", retryAfterMs: 3000 });
    expect(other.retryAfterMs).toBeUndefined();
  });

  it("falls back to UNKNOWN for an unrecognized code", () => {
    const err = mapError({ code: "SOMETHING_NEW" });
    expect(err.kind).toBe("unknown");
    expect(err.userMessage).toBe(UNKNOWN_SPEC.message);
    expect(err.code).toBe("SOMETHING_NEW");
  });

  it("maps the key funnel errors to the right kinds", () => {
    expect(mapError({ code: "EVENT_SOLD_OUT" }).kind).toBe("sold_out");
    expect(mapError({ code: "BUYER_QUOTA_EXHAUSTED" }).kind).toBe("quota");
    expect(mapError({ code: "SESSION_EXPIRED" }).kind).toBe("session_expired");
    expect(mapError({ code: "UNAUTHORIZED" }).kind).toBe("auth");
    expect(mapError({ code: "VALIDATION_ERROR" }).kind).toBe("validation");
    expect(mapError({ code: "DEPENDENCY_UNAVAILABLE" }).kind).toBe("dependency");
    expect(mapError({ code: "NOT_FOUND" }).kind).toBe("not_found");
    expect(mapError({ code: "BOOKING_LOCKED" }).kind).toBe("conflict");
  });

  it("DomainError is a real Error with a diagnostic message", () => {
    const e = mapError({ code: "OTP_INVALID" });
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toContain("OTP_INVALID");
  });
});

describe("domain/errors — createReadDeduper", () => {
  it("returns the SAME in-flight promise for concurrent identical keys", async () => {
    const dedupe = createReadDeduper();
    let calls = 0;
    const factory = () => {
      calls += 1;
      return new Promise<number>((res) => setTimeout(() => res(42), 10));
    };
    const a = dedupe("events", factory);
    const b = dedupe("events", factory);
    expect(a).toBe(b); // same promise
    expect(await a).toBe(42);
    expect(calls).toBe(1); // factory ran once for the burst
  });

  it("runs a fresh read after the previous one settled", async () => {
    const dedupe = createReadDeduper();
    let calls = 0;
    const factory = () => {
      calls += 1;
      return Promise.resolve(calls);
    };
    expect(await dedupe("k", factory)).toBe(1);
    expect(await dedupe("k", factory)).toBe(2); // cleared after settle → fresh
  });

  it("keeps distinct keys independent", async () => {
    const dedupe = createReadDeduper();
    const a = dedupe("a", () => Promise.resolve("A"));
    const b = dedupe("b", () => Promise.resolve("B"));
    expect(a).not.toBe(b);
    expect(await a).toBe("A");
    expect(await b).toBe("B");
  });

  it("clears the in-flight entry even when the read rejects", async () => {
    const dedupe = createReadDeduper();
    let calls = 0;
    const factory = () => {
      calls += 1;
      return Promise.reject(new Error("boom"));
    };
    await expect(dedupe("k", factory)).rejects.toThrow("boom");
    // after rejection the entry is cleared → a retry invokes the factory again
    await expect(dedupe("k", factory)).rejects.toThrow("boom");
    expect(calls).toBe(2);
  });
});
