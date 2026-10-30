/**
 * TanStack QueryClient configuration (ARCHITECTURE §3, §4.3 D3).
 *
 * TanStack Query is confined to `presentation/hooks` (the swap seam); the
 * QueryClient instance it reads is created here, in the composition root, and
 * handed to `QueryClientProvider` by `providers.tsx`.
 *
 * RBT-010 added `@tanstack/react-query` as a real dependency, so this file now
 * imports `QueryClient` directly (the former dynamic `require` guard that let
 * the app boot without the package is removed — it broke `expo export`, which
 * cannot resolve a runtime `require` of a bundled module).
 */
import { QueryClient } from "@tanstack/react-query";

/**
 * Default query/mutation behaviour for the app. Retries are bounded and
 * exponential; stampede-safe per §9.2 (no client-side request storm).
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30_000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Idempotency-Key is minted in the use case/domain (§4.3), never by Query.
      retry: 0,
    },
  },
} as const;

export type QueryClientConfig = typeof queryClientConfig;

/**
 * Build a TanStack QueryClient from {@link queryClientConfig}.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}
