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
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import type { Container } from "@providers/container";
import { createQueryClient } from "@providers/query-client";
import { ServiceProvider } from "@providers/service-context";

export interface AppProvidersProps {
  /** Override the container (tests inject mocks). */
  readonly container?: Container;
  /** Override the TanStack QueryClient (tests inject a retry-disabled client). */
  readonly queryClient?: QueryClient;
  readonly children: React.ReactNode;
}

/**
 * Wrap the subtree with the composition-root providers.
 *
 * Order (outer → inner): SafeAreaProvider → QueryClientProvider
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
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>{serviceTree}</QueryClientProvider>
    </SafeAreaProvider>
  );
}
