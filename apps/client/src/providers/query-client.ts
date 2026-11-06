import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack QueryClient configuration (ARCHITECTURE §3, §4.3 D3).
 *
 * TanStack Query is confined to `presentation/hooks` (the swap seam); the
 * QueryClient instance it reads is created here, in the composition root, and
 * handed to `QueryClientProvider` by `providers.tsx`.
 *
 * TanStack Query is a required runtime dependency; the composition root always
 * creates a client so presentation hooks never render outside its provider.
 */

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
 *
 * A direct import makes missing runtime dependencies fail during typecheck or
 * bundle construction instead of silently rendering hooks without a provider.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}
