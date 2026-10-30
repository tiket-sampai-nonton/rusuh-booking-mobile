import { queryClientConfig } from "@providers/query-client";

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
  afterEach(() => {
    jest.resetModules();
  });

  it("returns null when @tanstack/react-query is not installed (RBT-004 state)", () => {
    jest.isolateModules(() => {
      // Force the optional require to fail.
      jest.doMock(
        "@tanstack/react-query",
        () => {
          throw new Error("MODULE_NOT_FOUND");
        },
        { virtual: true },
      );
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- isolated module reload under test
      const { createQueryClient } = require("@providers/query-client");
      expect(createQueryClient()).toBeNull();
    });
  });

  it("builds a QueryClient when the package is present (RBT-010 state)", () => {
    jest.isolateModules(() => {
      class FakeQueryClient {
        constructor(public readonly cfg: unknown) {}
      }
      jest.doMock(
        "@tanstack/react-query",
        () => ({ QueryClient: FakeQueryClient }),
        { virtual: true },
      );
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- isolated module reload under test
      const { createQueryClient } = require("@providers/query-client");
      const client = createQueryClient();
      expect(client).toBeInstanceOf(FakeQueryClient);
      expect((client as FakeQueryClient).cfg).toHaveProperty("defaultOptions");
    });
  });
});
