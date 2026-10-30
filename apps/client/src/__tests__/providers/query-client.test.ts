import { QueryClient } from "@tanstack/react-query";

import { createQueryClient, queryClientConfig } from "@providers/query-client";

describe("providers/query-client — config", () => {
  it("bounds retries exponentially and caps at 30s", () => {
    const delay = queryClientConfig.defaultOptions.queries.retryDelay;
    expect(delay(0)).toBe(1000);
    expect(delay(1)).toBe(2000);
    // large attempt → capped
    expect(delay(20)).toBe(30_000);
  });

  it("does not retry mutations (idempotency handled in the use case)", () => {
    expect(queryClientConfig.defaultOptions.mutations.retry).toBe(0);
  });

  it("sets a stale time and disables refetch-on-focus", () => {
    expect(queryClientConfig.defaultOptions.queries.staleTime).toBe(30_000);
    expect(queryClientConfig.defaultOptions.queries.refetchOnWindowFocus).toBe(
      false,
    );
  });
});

describe("providers/query-client — createQueryClient", () => {
  it("builds a real QueryClient instance (RBT-010 state)", () => {
    const client = createQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
  });

  it("applies the config defaults to the built client", () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(30_000);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaults.mutations?.retry).toBe(0);
  });
});
