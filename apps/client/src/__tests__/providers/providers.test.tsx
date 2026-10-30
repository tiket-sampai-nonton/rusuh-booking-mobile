import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";

import { createContainer } from "@providers/container";

// Mock the query-client factory so each test controls whether a client exists.
const mockCreateQueryClient = jest.fn<unknown, []>();
jest.mock("@providers/query-client", () => ({
  createQueryClient: () => mockCreateQueryClient(),
}));

// Virtual mock for the not-yet-installed @tanstack/react-query. The provider
// captures the client it receives so the RBT-010 wrapping branch is asserted.
let receivedClient: unknown = null;
jest.mock(
  "@tanstack/react-query",
  () => ({
    QueryClientProvider: ({
      client,
      children,
    }: {
      client: unknown;
      children: React.ReactNode;
    }) => {
      receivedClient = client;
      return <>{children}</>;
    },
  }),
  { virtual: true },
);

// Imported after the mocks are registered.
// eslint-disable-next-line import/first, @typescript-eslint/no-require-imports -- load after jest.mock registration
const { AppProviders } = require("@providers/providers");

describe("providers/AppProviders", () => {
  beforeEach(() => {
    receivedClient = null;
    mockCreateQueryClient.mockReset();
  });

  it("renders children with only ServiceProvider when no query client (RBT-004 state)", () => {
    mockCreateQueryClient.mockReturnValue(null);
    const container = createContainer({ useMocks: true });
    const { getByText } = render(
      <AppProviders container={container}>
        <Text>child</Text>
      </AppProviders>,
    );
    expect(getByText("child")).toBeTruthy();
    expect(receivedClient).toBeNull();
  });

  it("wraps children in QueryClientProvider when a client exists (RBT-010 state)", () => {
    const fakeClient = { marker: "fake" };
    mockCreateQueryClient.mockReturnValue(fakeClient);
    const container = createContainer({ useMocks: true });
    const { getByText } = render(
      <AppProviders container={container}>
        <Text>wrapped</Text>
      </AppProviders>,
    );
    expect(getByText("wrapped")).toBeTruthy();
    expect(receivedClient).toBe(fakeClient);
  });
});
