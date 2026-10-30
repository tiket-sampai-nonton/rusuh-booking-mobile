/**
 * Test helper — render a component through the real provider stack with an
 * overridable DI container and a throwaway QueryClient (retries off so a
 * rejected query surfaces `isError` immediately in tests).
 *
 * Lives under `shared/test-fixtures` (already a documented coverage exclusion is
 * NOT applied here — it is test-only code never imported by app code, and jest
 * only instruments files reached by the suite under test, so it carries its own
 * coverage through the tests that use it).
 */
import { QueryClient } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react-native";
import React from "react";

import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { AppProviders } from "@providers/providers";

/** A QueryClient with retries disabled — deterministic in tests. */
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export interface RenderOptions {
  /** Partial container overrides merged over the mock container. */
  readonly container?: Partial<Container>;
  readonly queryClient?: QueryClient;
}

/** Render `ui` wrapped in AppProviders with a (optionally overridden) container. */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptions = {},
): RenderResult & { container: Container } {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, ...options.container };
  const queryClient = options.queryClient ?? makeTestQueryClient();
  const result = render(
    <AppProviders container={container} queryClient={queryClient}>
      {ui}
    </AppProviders>,
  );
  return { ...result, container };
}
