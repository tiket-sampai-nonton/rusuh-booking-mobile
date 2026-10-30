import {
  assertOk,
  parseRetryAfterMs,
  TransportError,
  unwrap,
} from "@infrastructure/api/envelope";
import type { HttpResponse } from "@infrastructure/http/http-client";

function res<T>(
  status: number,
  data: T,
  headers: Record<string, string> = {},
): HttpResponse<T> {
  return { status, headers, data };
}

describe("unwrap", () => {
  it("returns data from a success envelope", () => {
    const out = unwrap<{ x: number }>(
      res(200, { meta: { code: 200 }, data: { x: 1 } }),
    );
    expect(out).toEqual({ x: 1 });
  });

  it("throws TransportError on an error envelope (data null)", () => {
    expect(() =>
      unwrap(res(200, { meta: { code: 1500, message: "boom" }, data: null })),
    ).toThrow(TransportError);
    try {
      unwrap(res(200, { meta: { code: 1500, message: "boom" }, data: null }));
    } catch (e) {
      expect(e).toBeInstanceOf(TransportError);
      expect((e as TransportError).code).toBe(1500);
      expect((e as TransportError).message).toBe("boom");
    }
  });

  it("throws on non-2xx even with a meta envelope", () => {
    try {
      unwrap(res(400, { meta: { code: 1200, message: "bad" }, data: null }));
    } catch (e) {
      expect((e as TransportError).httpStatus).toBe(400);
      expect((e as TransportError).code).toBe(1200);
    }
  });

  it("throws when body is not an envelope (2xx)", () => {
    expect(() => unwrap(res(200, { nope: true }))).toThrow(/missing meta/);
  });

  it("throws when body is not an envelope (non-2xx)", () => {
    try {
      unwrap(res(503, "down"));
    } catch (e) {
      expect((e as TransportError).code).toBe(503);
      expect((e as TransportError).message).toBe("HTTP 503");
    }
  });

  it("parses Retry-After into retryAfterMs on the error", () => {
    try {
      unwrap(
        res(429, { meta: { code: 429 }, data: null }, { "retry-after": "2" }),
      );
    } catch (e) {
      expect((e as TransportError).retryAfterMs).toBe(2000);
    }
  });
});

describe("assertOk", () => {
  it("passes on 2xx", () => {
    expect(() => assertOk(res(204, null))).not.toThrow();
  });
  it("throws with meta code on an error envelope", () => {
    try {
      assertOk(res(409, { meta: { code: 1900, message: "expired" }, data: null }));
    } catch (e) {
      expect((e as TransportError).code).toBe(1900);
    }
  });
  it("throws with http status when no meta", () => {
    try {
      assertOk(res(500, "oops"));
    } catch (e) {
      expect((e as TransportError).code).toBe(500);
      expect((e as TransportError).message).toBe("HTTP 500");
    }
  });
});

describe("parseRetryAfterMs", () => {
  it("returns undefined when absent", () => {
    expect(parseRetryAfterMs({})).toBeUndefined();
  });
  it("reads the capitalized header too", () => {
    expect(parseRetryAfterMs({ "Retry-After": "3" })).toBe(3000);
  });
  it("ignores a non-numeric value", () => {
    expect(parseRetryAfterMs({ "retry-after": "soon" })).toBeUndefined();
  });
});

describe("TransportError", () => {
  it("defaults the message from the code", () => {
    const e = new TransportError({ code: 42, httpStatus: 500 });
    expect(e.message).toContain("42");
    expect(e).toBeInstanceOf(Error);
  });
});
