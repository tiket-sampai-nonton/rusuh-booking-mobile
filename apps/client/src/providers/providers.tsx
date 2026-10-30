/**
 * providers.tsx — composition of the app-wide providers (ARCHITECTURE §3, §11.7).
 *
 * Composes the server-data provider (TanStack `QueryClientProvider`) around the
 * DI `ServiceProvider`. `_layout.tsx` wraps the router tree with `<AppProviders>`.
 *
 * TanStack is added in RBT-010; until then {@link createQueryClient} returns
 * `null` and the QueryClientProvider layer is skipped. ThemeProvider + SafeArea
 * are layered here by RBT-003 (tokens/theme) — left as a documented TODO so this
 * task does not collide with RBT-003's `presentation/theme` work.
 */
import React, { useMemo } from "react";

import type { Container } from "@providers/container";
import { createQueryClient } from "@providers/query-client";
import { ServiceProvider } from "@providers/service-context";

export interface AppProvidersProps {
  /** Override the container (tests inject mocks). */
  readonly container?: Container;
  readonly children: React.ReactNode;
}

/**
 * Wrap the subtree with the composition-root providers.
 *
 * Order (outer → inner): QueryClientProvider (when present) → ServiceProvider.
 * TODO(RBT-003): add ThemeProvider + SafeAreaProvider once the theme lands.
 */
export function AppProviders({
  container,
  children,
}: AppProvidersProps): React.ReactElement {
  const queryClient = useMemo(() => createQueryClient(), []);

  const tree = <ServiceProvider container={container}>{children}</ServiceProvider>;

  if (queryClient === null) {
    // RBT-004 state: @tanstack/react-query not installed yet.
    return tree;
  }

  // RBT-010: wrap with QueryClientProvider. Indirected so RBT-004 does not
  // hard-import the absent package; replaced by a direct import in RBT-010.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional dep until RBT-010 adds @tanstack/react-query
  const { QueryClientProvider } = require("@tanstack/react-query") as {
    QueryClientProvider: React.ComponentType<{
      client: unknown;
      children: React.ReactNode;
    }>;
  };
  return <QueryClientProvider client={queryClient}>{tree}</QueryClientProvider>;
}
