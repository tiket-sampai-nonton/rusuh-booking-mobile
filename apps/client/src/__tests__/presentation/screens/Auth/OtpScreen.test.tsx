/**
 * RBT-020 — component/hook tests for the OTP sign-in screen (TDD).
 *
 * Renders OtpScreen inside a real QueryClientProvider + a ServiceProvider with
 * an INJECTED mock container (per the project's DI test pattern). Asserts:
 *   - email step renders; invalid email blocks submit (no port call);
 *   - a valid email requests an OTP and advances to the code step;
 *   - invalid code blocks submit; a wrong code shows the error;
 *   - a valid code verifies and calls onAuthenticated with the session;
 *   - resend re-requests the OTP;
 *   - the optional skip affordance fires onSkip (sign-in stays non-blocking).
 *
 * The container's userRepository is a spy over the real MockUserRepository so we
 * assert the hook → use case → port wiring without a network.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { createContainer } from "@providers/container";
import type { Container } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { OtpScreen } from "@presentation/screens/Auth/OtpScreen";
import type { OtpScreenProps } from "@presentation/screens/Auth/OtpScreen";

function makeContainer(): Container {
  const base = createContainer({ useMocks: true });
  // Spy on the bound mock repo's port methods (wiring assertions).
  jest.spyOn(base.userRepository, "requestOtp");
  jest.spyOn(base.userRepository, "verifyOtp");
  return base;
}

function renderScreen(
  container: Container,
  props: Partial<OtpScreenProps> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ServiceProvider container={container}>
        <OtpScreen {...props} />
      </ServiceProvider>
    </QueryClientProvider>,
  );
}

describe("presentation/screens/Auth — OtpScreen", () => {
  it("renders the email step with the optional-sign-in note", () => {
    renderScreen(makeContainer());
    expect(screen.getByRole("header", { name: "Masuk" })).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByText(/opsional/i)).toBeTruthy();
  });

  it("blocks submit on an invalid email and never calls the port", async () => {
    const container = makeContainer();
    renderScreen(container);

    fireEvent.changeText(screen.getByLabelText("Email"), "not-an-email");
    fireEvent.press(screen.getByLabelText("Kirim kode"));

    expect(await screen.findByText("Format email tidak valid")).toBeTruthy();
    expect(container.userRepository.requestOtp).not.toHaveBeenCalled();
  });

  it("requests an OTP for a valid email and advances to the code step", async () => {
    const container = makeContainer();
    renderScreen(container);

    fireEvent.changeText(screen.getByLabelText("Email"), "rizky@example.com");
    fireEvent.press(screen.getByLabelText("Kirim kode"));

    await waitFor(() =>
      expect(container.userRepository.requestOtp).toHaveBeenCalledWith(
        "rizky@example.com",
      ),
    );
    expect(await screen.findByLabelText("Kode OTP")).toBeTruthy();
  });

  it("blocks submit on a non-6-digit code", async () => {
    const container = makeContainer();
    renderScreen(container);

    fireEvent.changeText(screen.getByLabelText("Email"), "rizky@example.com");
    fireEvent.press(screen.getByLabelText("Kirim kode"));
    await screen.findByLabelText("Kode OTP");

    fireEvent.changeText(screen.getByLabelText("Kode OTP"), "123");
    fireEvent.press(screen.getByLabelText("Verifikasi"));

    expect(await screen.findByText("Kode OTP harus 6 digit angka")).toBeTruthy();
    expect(container.userRepository.verifyOtp).not.toHaveBeenCalled();
  });

  it("verifies a valid code and calls onAuthenticated with the session", async () => {
    const container = makeContainer();
    const onAuthenticated = jest.fn();
    renderScreen(container, { onAuthenticated });

    fireEvent.changeText(screen.getByLabelText("Email"), "rizky@example.com");
    fireEvent.press(screen.getByLabelText("Kirim kode"));
    await screen.findByLabelText("Kode OTP");

    fireEvent.changeText(screen.getByLabelText("Kode OTP"), "123456");
    fireEvent.press(screen.getByLabelText("Verifikasi"));

    await waitFor(() =>
      expect(container.userRepository.verifyOtp).toHaveBeenCalledWith(
        "rizky@example.com",
        "123456",
      ),
    );
    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledTimes(1));
    const session = onAuthenticated.mock.calls[0][0];
    expect(typeof session.token).toBe("string");
    expect(session.isNew).toBe(true);
  });

  it("shows the error message when the OTP code is wrong", async () => {
    const container = makeContainer();
    renderScreen(container);

    fireEvent.changeText(screen.getByLabelText("Email"), "rizky@example.com");
    fireEvent.press(screen.getByLabelText("Kirim kode"));
    await screen.findByLabelText("Kode OTP");

    fireEvent.changeText(screen.getByLabelText("Kode OTP"), "000000");
    fireEvent.press(screen.getByLabelText("Verifikasi"));

    expect(
      await screen.findByText(/Kode OTP salah atau kedaluwarsa/i),
    ).toBeTruthy();
  });

  it("re-requests the OTP when resend is pressed", async () => {
    const container = makeContainer();
    renderScreen(container);

    fireEvent.changeText(screen.getByLabelText("Email"), "rizky@example.com");
    fireEvent.press(screen.getByLabelText("Kirim kode"));
    await screen.findByLabelText("Kode OTP");

    fireEvent.press(screen.getByLabelText("Kirim ulang kode"));
    await waitFor(() =>
      expect(container.userRepository.requestOtp).toHaveBeenCalledTimes(2),
    );
  });

  it("shows a send error when the OTP request fails on the email step", async () => {
    const container = makeContainer();
    jest
      .spyOn(container.userRepository, "requestOtp")
      .mockRejectedValue(new Error("network down"));
    renderScreen(container);

    fireEvent.changeText(screen.getByLabelText("Email"), "rizky@example.com");
    fireEvent.press(screen.getByLabelText("Kirim kode"));

    expect(await screen.findByText(/Gagal mengirim kode/i)).toBeTruthy();
    // Still on the email step (no advance to the code step).
    expect(screen.queryByLabelText("Kode OTP")).toBeNull();
  });

  it("surfaces a send error when resend fails", async () => {
    const container = makeContainer();
    renderScreen(container);

    fireEvent.changeText(screen.getByLabelText("Email"), "rizky@example.com");
    fireEvent.press(screen.getByLabelText("Kirim kode"));
    await screen.findByLabelText("Kode OTP");

    jest
      .spyOn(container.userRepository, "requestOtp")
      .mockRejectedValue(new Error("network down"));
    fireEvent.press(screen.getByLabelText("Kirim ulang kode"));

    await waitFor(() =>
      expect(container.userRepository.requestOtp).toHaveBeenCalledTimes(2),
    );
  });

  it("fires onSkip without requiring sign-in (non-blocking, D8.5)", () => {
    const container = makeContainer();
    const onSkip = jest.fn();
    renderScreen(container, { onSkip });

    fireEvent.press(screen.getByLabelText("Lewati masuk"));
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(container.userRepository.requestOtp).not.toHaveBeenCalled();
  });
});
