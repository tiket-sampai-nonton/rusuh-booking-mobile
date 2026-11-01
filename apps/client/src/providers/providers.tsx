/**
 * providers.tsx — composition of the app-wide providers (ARCHITECTURE §3, §11.7).
 *
 * Composes the server-data provider (TanStack `QueryClientProvider`) around the
 * DI `ServiceProvider`, inside a `SafeAreaProvider` (so screens can read
 * `useSafeAreaInsets()` on native + web). `_layout.tsx` wraps the router tree
 * with `<AppProviders>`.
 *
 * TanStack landed in RBT-010; `createQueryClient()` now returns a real client.
 * The `queryClient` prop lets tests inject a retry-disabled client for
 * deterministic error-state assertions.
 */
import React, { useMemo } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import type { Container } from "@providers/container";
import { createQueryClient } from "@providers/query-client";
import { ServiceProvider } from "@providers/service-context";

export interface AppProvidersProps {
  /** Override the container (tests inject mocks). */
  readonly container?: Container;
  /** Override the TanStack QueryClient (tests inject a retry-disabled client). */
  readonly queryClient?: unknown;
  readonly children: React.ReactNode;
}

/**
 * Wrap the subtree with the composition-root providers.
 *
 * Order (outer → inner): SafeAreaProvider → QueryClientProvider (when present)
 * → ServiceProvider. TODO(RBT-003): add ThemeProvider once the theme lands.
 */
export function AppProviders({
  container,
  queryClient,
  children,
}: AppProvidersProps): React.ReactElement {
  const client = useMemo(
    () => queryClient ?? createQueryClient(),
    [queryClient],
  );

  const serviceTree = (
    <ServiceProvider container={container}>{children}</ServiceProvider>
  );

  let tree = serviceTree;
  if (client !== null) {
    // RBT-010: wrap with QueryClientProvider now that @tanstack/react-query is
    // a declared dependency. Kept as a guarded require so the RBT-004-era
    // providers test can still mock it virtually without a hard import.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- guarded so the RBT-004 providers test can virtual-mock it
    const { QueryClientProvider } = require("@tanstack/react-query") as {
      QueryClientProvider: React.ComponentType<{
        client: unknown;
        children: React.ReactNode;
      }>;
    };
    tree = <QueryClientProvider client={client}>{serviceTree}</QueryClientProvider>;
  }

  return <SafeAreaProvider>{tree}</SafeAreaProvider>;
}
