/**
 * HttpClient — transport PORT (ARCHITECTURE §2.1 DIP, §3, §4.3, §5.1).
 *
 * Pure TS interface: no React / React Native / Expo / browser / native imports.
 * Repositories depend on this port, never on a concrete client. `AxiosHttpClient`
 * / `FetchHttpClient` are swapped at the composition root (one container binding),
 * so axios ↔ fetch changes nothing in domain/application.
 *
 * Lives in `infrastructure/http` (not `domain`) per §3: it is a transport
 * abstraction owned by the infrastructure layer, consumed by repositories.
 */

export interface HttpRequest {
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
}

export interface HttpResponse<T = unknown> {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly data: T;
}

export interface HttpClient {
  /** Execute a request and resolve with the typed response envelope. */
  request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>>;
}
