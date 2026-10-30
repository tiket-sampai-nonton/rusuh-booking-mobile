/**
 * FetchHttpClient — concrete transport adapter (ARCHITECTURE §3, §11.8; RBT-010).
 *
 * Implements the `HttpClient` PORT using the platform `fetch` (built into
 * Expo/React Native and the browser — no new dependency, unlike axios). Bound at
 * the composition root; swapped for a mock (dev default) or a future axios
 * adapter without touching any repository.
 *
 * This is the ONLY place `fetch` is referenced. It knows nothing about the
 * Rusuh Booking endpoints or the `{meta,data}` envelope — it is a generic pipe.
 * Envelope unwrap lives in `infrastructure/api/envelope.ts`.
 */

import type {
  HttpClient,
  HttpRequest,
  HttpResponse,
} from "@infrastructure/http/http-client";

export interface FetchHttpClientOptions {
  /** Absolute base URL, e.g. `https://gateway/api/v1`. */
  readonly baseUrl: string;
  /** Default headers merged into every request (request headers win). */
  readonly defaultHeaders?: Readonly<Record<string, string>>;
  /** Injectable fetch (defaults to global) — lets tests pass a fake. */
  readonly fetchFn?: typeof fetch;
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Readonly<Record<string, string>>;
  private readonly fetchFn: typeof fetch;

  constructor(options: FetchHttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
  }

  async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
    const url = req.url.startsWith("http")
      ? req.url
      : `${this.baseUrl}/${req.url.replace(/^\/+/, "")}`;

    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...this.defaultHeaders,
      ...(req.headers ?? {}),
    };

    const response = await this.fetchFn(url, {
      method: req.method,
      headers,
      body: req.body === undefined ? undefined : JSON.stringify(req.body),
      // Web: send the HttpOnly rb_visitor cookie (contract §2). No-op native.
      credentials: "include",
    });

    const outHeaders: Record<string, string> = {};
    response.headers.forEach((value: string, key: string) => {
      outHeaders[key.toLowerCase()] = value;
    });

    const text = await response.text();
    const data = (text.length > 0 ? JSON.parse(text) : null) as T;

    return {
      status: response.status,
      headers: outHeaders,
      data,
    };
  }
}
