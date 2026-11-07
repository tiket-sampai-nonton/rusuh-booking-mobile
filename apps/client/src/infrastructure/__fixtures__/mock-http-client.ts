/**
 * MockHttpClient — stub adapter for the `HttpClient` transport port.
 *
 * Bound under `EXPO_PUBLIC_USE_MOCKS`. Framework-free. Under mocks the real
 * repositories are not used (the mock repositories above return data directly),
 * so this exists only to satisfy the port binding and to make an accidental
 * real request in mock mode fail loudly rather than hit the network.
 */
import type {
  HttpClient,
  HttpRequest,
  HttpResponse,
} from "@infrastructure/http/http-client";

export class MockHttpClient implements HttpClient {
  async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
    throw new Error(
      `MockHttpClient: no real HTTP in mock mode (attempted ${req.method} ${req.url})`,
    );
  }
}
