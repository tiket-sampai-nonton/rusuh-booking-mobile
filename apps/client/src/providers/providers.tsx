/**
 * providers.tsx — composition of the app-wide providers (ARCHITECTURE §3, §11.7).
 *
 * Composes the server-data provider (TanStack `QueryClientProvider`) around the
 * DI `ServiceProvider` and the theme/safe-area providers. `_layout.tsx` wraps
 * the router tree with `<AppProviders>`.
 *
 * RBT-010 made `@tanstack/react-query` a real dependency, so the former dynamic
 * `require` (which `expo export` could not resolve) is replaced by a normal
 * import. Order (outer → inner): SafeArea → QueryClientProvider → ServiceProvider.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useMemo } from "react";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import type { Container } from "@providers/container";
import { createQueryClient } from "@providers/query-client";
import { ServiceProvider } from "@providers/service-context";

export interface AppProvidersProps {
  /** Override the container (tests inject mocks). */
  readonly container?: Container;
  /** Override the QueryClient (tests inject a throwaway client). */
  readonly queryClient?: QueryClient;
  readonly children: React.ReactNode;
}

/**
 * Wrap the subtree with the composition-root providers.
 *
 * Order (outer → inner): SafeAreaProvider → QueryClientProvider → ServiceProvider.
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

  // `initialMetrics` lets children render on the first frame (correct for web
  // static export + synchronous in tests) instead of waiting for an async inset
  // measurement that never resolves in jsdom. `initialWindowMetrics` is null on
  // platforms with no native module (jest), so fall back to a zero-inset frame.
  const metrics = initialWindowMetrics ?? {
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
    frame: { x: 0, y: 0, width: 0, height: 0 },
  };

  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>
        <ServiceProvider container={container}>{children}</ServiceProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
