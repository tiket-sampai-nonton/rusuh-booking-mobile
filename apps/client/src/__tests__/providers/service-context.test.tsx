import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";

import { ServiceProvider, useServices } from "@providers/service-context";
import { createContainer } from "@providers/container";

function Probe(): React.ReactElement {
  const { eventRepository } = useServices();
  return <Text>{eventRepository.constructor.name}</Text>;
}

describe("providers/service-context", () => {
  it("exposes an injected container to useServices", () => {
    const container = createContainer({ useMocks: true });
    const { getByText } = render(
      <ServiceProvider container={container}>
        <Probe />
      </ServiceProvider>,
    );
    expect(getByText("MockEventRepository")).toBeTruthy();
  });

  it("builds a default container when none is injected", () => {
    const prev = process.env.EXPO_PUBLIC_USE_MOCKS;
    process.env.EXPO_PUBLIC_USE_MOCKS = "true";
    const { getByText } = render(
      <ServiceProvider>
        <Probe />
      </ServiceProvider>,
    );
    expect(getByText("MockEventRepository")).toBeTruthy();
    if (prev === undefined) {
      delete process.env.EXPO_PUBLIC_USE_MOCKS;
    } else {
      process.env.EXPO_PUBLIC_USE_MOCKS = prev;
    }
  });

  it("throws when useServices is called outside a ServiceProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(
      /useServices must be used within a ServiceProvider/,
    );
    spy.mockRestore();
  });
});
