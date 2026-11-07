import type { TokenStorage } from "@domain/auth/token-storage.port";
import type { HttpClient, HttpRequest, HttpResponse } from "./http-client";
import { unwrap } from "@infrastructure/api/envelope";

/** Rotate an account session once when an authenticated request is rejected. */
export class RefreshingHttpClient implements HttpClient {
  private rotation?: Promise<string | null>;
  constructor(
    private readonly inner: HttpClient,
    private readonly access: TokenStorage,
    private readonly refresh: TokenStorage,
  ) {}

  async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
    const sentToken = await this.access.load();
    const res = await this.inner.request<T>(req);
    if (
      res.status !== 401 ||
      req.url.startsWith("auth/") ||
      req.url.startsWith("http")
    )
      return res;
    const token = await this.access.load();
    const refreshToken = await this.refresh.load();
    if (!token || !refreshToken) return res;
    if (sentToken && token !== sentToken) {
      return this.inner.request<T>({
        ...req,
        headers: { ...req.headers, Authorization: `Bearer ${token}` },
      });
    }
    if (!this.rotation) {
      this.rotation = this.rotate(refreshToken).finally(() => {
        this.rotation = undefined;
      });
    }
    const next = await this.rotation;
    if (!next) return res;
    return this.inner.request<T>({
      ...req,
      headers: { ...req.headers, Authorization: `Bearer ${next}` },
    });
  }

  private async rotate(refreshToken: string): Promise<string | null> {
    const res = await this.inner.request({
      method: "POST",
      url: "auth/refresh",
      body: { refreshToken },
    });
    if (res.status === 401) {
      await Promise.all([this.access.clear(), this.refresh.clear()]);
      return null;
    }
    const data = unwrap<{ accessToken: string; refreshToken: string }>(res);
    await this.refresh.save(data.refreshToken);
    await this.access.save(data.accessToken);
    return data.accessToken;
  }
}
