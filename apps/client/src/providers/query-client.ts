/**
 * TanStack QueryClient configuration (ARCHITECTURE §3, §4.3 D3).
 *
 * TanStack Query is confined to `presentation/hooks` (the swap seam); the
 * QueryClient instance it reads is created here, in the composition root, and
 * handed to `QueryClientProvider` by `providers.tsx`.
 *
 * NOTE: `@tanstack/react-query` is not yet a dependency of this app (added with
 * the server-data layer in RBT-010). To keep RBT-004 dependency-free, this file
 * exports the REAL client config as a typed object and a factory that builds the
 * client only when the package is present. RBT-010 removes the dynamic require
 * and imports `QueryClient` directly.
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
 * Returns `null` when `@tanstack/react-query` is not installed (RBT-004 state),
 * so `providers.tsx` can compose providers without the dependency. Once RBT-010
 * adds the package this becomes a direct `new QueryClient(queryClientConfig)`.
 */
export function createQueryClient(): unknown | null {
  try {
    // Indirected so bundlers/tsc do not hard-require a package absent in RBT-004.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional dep until RBT-010 adds @tanstack/react-query
    const mod = require("@tanstack/react-query") as {
      QueryClient: new (cfg: QueryClientConfig) => unknown;
    };
    return new mod.QueryClient(queryClientConfig);
  } catch {
    // TODO(RBT-010): replace this guard with a direct import once the package
    // is a declared dependency.
    return null;
  }
}
