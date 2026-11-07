import { RefreshingHttpClient } from "@infrastructure/http/refreshing-http-client";
import { InMemoryTokenStorage } from "@infrastructure/__fixtures__/in-memory-token-storage";
import type {
  HttpClient,
  HttpRequest,
  HttpResponse,
} from "@infrastructure/http/http-client";

class FakeHttp implements HttpClient {
  calls: HttpRequest[] = [];
  async request<T>(req: HttpRequest): Promise<HttpResponse<T>> {
    this.calls.push(req);
    if (req.url === "auth/refresh")
      return {
        status: 200,
        headers: {},
        data: {
          meta: { code: 0 },
          data: { accessToken: "new-access", refreshToken: "new-refresh" },
        } as T,
      };
    if (req.headers?.Authorization === "Bearer new-access")
      return { status: 200, headers: {}, data: {} as T };
    return { status: 401, headers: {}, data: {} as T };
  }
}

describe("RefreshingHttpClient", () => {
  it("rotates tokens and retries the failed request with the new bearer", async () => {
    const access = new InMemoryTokenStorage();
    const refresh = new InMemoryTokenStorage();
    await access.save("old-access");
    await refresh.save("old-refresh");
    const inner = new FakeHttp();
    const http = new RefreshingHttpClient(inner, access, refresh);
    const res = await http.request({
      method: "GET",
      url: "me",
      headers: { Authorization: "Bearer old-access" },
    });
    expect(res.status).toBe(200);
    expect(inner.calls[1]).toMatchObject({
      method: "POST",
      url: "auth/refresh",
      body: { refreshToken: "old-refresh" },
    });
    expect(inner.calls[2].headers?.Authorization).toBe("Bearer new-access");
    expect(await access.load()).toBe("new-access");
    expect(await refresh.load()).toBe("new-refresh");
  });

  it("does not attempt account refresh for guests", async () => {
    const inner = new FakeHttp();
    const http = new RefreshingHttpClient(
      inner,
      new InMemoryTokenStorage(),
      new InMemoryTokenStorage(),
    );
    expect((await http.request({ method: "GET", url: "events" })).status).toBe(
      401,
    );
    expect(inner.calls).toHaveLength(1);
  });
});
