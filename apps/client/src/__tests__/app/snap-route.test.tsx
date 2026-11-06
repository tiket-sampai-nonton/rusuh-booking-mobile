/**
 * RBT-065 — /snap/[bookingId] route renders the SNAP simulator for the booking.
 */
import { render, screen } from "@testing-library/react-native";
import React from "react";

const mockUseLocalSearchParams = jest.fn((): { bookingId?: string } => ({
  bookingId: "bk-1",
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

// eslint-disable-next-line import/first
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// eslint-disable-next-line import/first
import { createContainer } from "@providers/container";
// eslint-disable-next-line import/first
import { ServiceProvider } from "@providers/service-context";
// eslint-disable-next-line import/first
import SnapRoute from "../../app/(booking)/snap/[bookingId]";

describe("/snap/[bookingId] route", () => {
  it("exports a component function", () => {
    expect(typeof SnapRoute).toBe("function");
  });

  it("renders the SNAP simulator for the booking", () => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity },
        mutations: { gcTime: Infinity },
      },
    });
    render(
      <QueryClientProvider client={qc}>
        <ServiceProvider container={createContainer({ useMocks: true })}>
          <SnapRoute />
        </ServiceProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByTestId("snap-screen")).toBeTruthy();
  });

  it("passes an empty booking id when the route parameter is missing", () => {
    mockUseLocalSearchParams.mockReturnValue({});
    const routeElement = SnapRoute();
    const [seoElement, screenElement] = React.Children.toArray(
      routeElement.props.children,
    ) as React.ReactElement[];
    expect(
      (seoElement as React.ReactElement<{ noindex: boolean }>).props.noindex,
    ).toBe(true);
    expect(
      (screenElement as React.ReactElement<{ bookingId: string }>).props
        .bookingId,
    ).toBe("");
  });
});
