import { QueryClient } from "@tanstack/react-query";
import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";

import { createContainer } from "@providers/container";
import { AppProviders } from "@providers/providers";

describe("providers/AppProviders", () => {
  it("renders children through the full provider stack (mock container)", () => {
    const container = createContainer({ useMocks: true });
    const { getByText } = render(
      <AppProviders container={container}>
        <Text>child</Text>
      </AppProviders>,
    );
    expect(getByText("child")).toBeTruthy();
  });

  it("accepts an injected QueryClient (tests inject a throwaway client)", () => {
    const container = createContainer({ useMocks: true });
    const queryClient = new QueryClient();
    const { getByText } = render(
      <AppProviders container={container} queryClient={queryClient}>
        <Text>wrapped</Text>
      </AppProviders>,
    );
    expect(getByText("wrapped")).toBeTruthy();
  });

  it("builds its own QueryClient and container when none are injected", () => {
    const { getByText } = render(
      <AppProviders>
        <Text>default</Text>
      </AppProviders>,
    );
    expect(getByText("default")).toBeTruthy();
  });
});
