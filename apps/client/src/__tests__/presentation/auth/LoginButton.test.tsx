/**
 * RBT-020 — LoginButton launcher tests (RNTL).
 *
 * The "Masuk / Daftar" launcher mounts the modal only when opened, so the Home
 * landing renders without a ServiceProvider until the user taps it. These tests
 * cover: label, open (modal appears, needs providers), and close (modal unmounts).
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Animated } from "react-native";

import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { LoginButton } from "@presentation/components/auth/LoginButton";

const completedAnimation = {
  start: (callback?: (result: { finished: boolean }) => void) =>
    callback?.({ finished: true }),
  stop: () => undefined,
  reset: () => undefined,
};

function renderButton() {
  const container: Container = createContainer({ useMocks: true });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ServiceProvider container={container}>
        <LoginButton />
      </ServiceProvider>
    </QueryClientProvider>,
  );
}

describe("LoginButton (RBT-020)", () => {
  beforeEach(() => {
    jest
      .spyOn(Animated, "timing")
      .mockReturnValue(completedAnimation as ReturnType<typeof Animated.timing>);
    jest
      .spyOn(Animated, "parallel")
      .mockReturnValue(completedAnimation as ReturnType<typeof Animated.parallel>);
  });

  afterEach(() => jest.restoreAllMocks());

  it("renders the 'Masuk / Daftar' launcher", () => {
    const { getByTestId, getByText } = renderButton();
    expect(getByTestId("login-launcher")).toBeTruthy();
    expect(getByText("Masuk / Daftar")).toBeTruthy();
  });

  it("opens the modal (email step) on press", async () => {
    const { getByTestId } = renderButton();
    fireEvent.press(getByTestId("login-launcher"));
    await waitFor(() => expect(getByTestId("login-email-input")).toBeTruthy());
  });

  it("closes the modal via the backdrop", async () => {
    const { getByTestId, queryByTestId } = renderButton();
    fireEvent.press(getByTestId("login-launcher"));
    await waitFor(() => getByTestId("login-backdrop"));
    fireEvent.press(getByTestId("login-backdrop"));
    await waitFor(() =>
      expect(queryByTestId("login-email-input")).toBeNull(),
    );
  });
});
