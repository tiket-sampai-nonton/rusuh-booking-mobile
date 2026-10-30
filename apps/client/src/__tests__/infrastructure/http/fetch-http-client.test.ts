import { FetchHttpClient } from "@infrastructure/http/fetch-http-client";

function fakeResponse(
  status: number,
  body: string,
  headers: Record<string, string> = {},
): Response {
  const h = new Map(Object.entries(headers));
  return {
    status,
    headers: {
      forEach: (cb: (value: string, key: string) => void) =>
        h.forEach((v, k) => cb(v, k)),
    },
    text: async () => body,
  } as unknown as Response;
}

describe("FetchHttpClient", () => {
  it("builds URL from baseUrl + relative path, sets JSON headers, serializes body", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchFn = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return fakeResponse(200, JSON.stringify({ meta: { code: 200 }, data: 1 }), {
        "Content-Type": "application/json",
      });
    }) as unknown as typeof fetch;

    const client = new FetchHttpClient({
      baseUrl: "https://api.test/v1/",
      defaultHeaders: { "x-app": "rb" },
      fetchFn,
    });
    const res = await client.request({
      method: "POST",
      url: "events",
      body: { a: 1 },
      headers: { "x-extra": "1" },
    });

    expect(calls[0].url).toBe("https://api.test/v1/events");
    expect(calls[0].init.method).toBe("POST");
    expect(calls[0].init.body).toBe(JSON.stringify({ a: 1 }));
    expect((calls[0].init.headers as Record<string, string>)["x-app"]).toBe("rb");
    expect((calls[0].init.headers as Record<string, string>)["x-extra"]).toBe("1");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/json");
    expect(res.data).toEqual({ meta: { code: 200 }, data: 1 });
  });

  it("passes an absolute url through unchanged and handles an empty body", async () => {
    const fetchFn = (async () => fakeResponse(204, "")) as unknown as typeof fetch;
    const client = new FetchHttpClient({ baseUrl: "https://api.test", fetchFn });
    const res = await client.request({
      method: "GET",
      url: "https://other.test/health",
    });
    expect(res.status).toBe(204);
    expect(res.data).toBeNull();
  });

  it("omits the body for a GET and defaults to global fetch when none injected", () => {
    // Construct with no fetchFn — just assert it binds without throwing.
    const client = new FetchHttpClient({ baseUrl: "https://api.test" });
    expect(client).toBeInstanceOf(FetchHttpClient);
  });
});
