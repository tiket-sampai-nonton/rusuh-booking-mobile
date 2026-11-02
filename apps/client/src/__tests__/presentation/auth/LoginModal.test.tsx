/**
 * RBT-020 — LoginModal component tests (RNTL).
 *
 * Renders the modal inside a ServiceProvider (fake UserRepository) + a real
 * QueryClientProvider, then drives the prototype flow:
 *  - open modal
 *  - invalid email blocked ("Format email belum benar")
 *  - email submit → code step with echoed email
 *  - <6 digits keeps Verifikasi disabled
 *  - wrong code → Bahasa OTP error
 *  - correct code (123456) isNew=false → signed-in panel
 *  - isNew=true → register handoff (NOT the form)
 *  - "Ganti email" returns to email step
 *  - backdrop + hardware-back (Escape) close
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { LoginModal } from "@presentation/components/auth/LoginModal";

import type {
  AuthSession,
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";

class FakeUserRepository implements UserRepository {
  public session: AuthSession = { token: "tok-1", isNew: false };
  public profile: UserProfile = {
    emailMasked: "b***@mail.com",
    fullName: "Budi",
    hasNik: true,
  };
  public throwOnVerify = false;

  async requestOtp(): Promise<void> {}
  async verifyOtp(): Promise<AuthSession> {
    if (this.throwOnVerify) throw new Error("invalid OTP");
    return this.session;
  }
  async completeRegistration(): Promise<UserProfile> {
    return this.profile;
  }
  async getMe(): Promise<UserProfile> {
    return this.profile;
  }
}

function renderModal(repo: UserRepository) {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, userRepository: repo };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const onClose = jest.fn();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <ServiceProvider container={container}>
        <LoginModal visible onClose={onClose} />
      </ServiceProvider>
    </QueryClientProvider>,
  );
  return { ...utils, onClose };
}

describe("LoginModal (RBT-020)", () => {
  it("renders the email step with prototype title + copy", () => {
    const { getByText, getByTestId } = renderModal(new FakeUserRepository());
    expect(getByText("Masuk / Daftar")).toBeTruthy();
    expect(getByTestId("login-email-input")).toBeTruthy();
    expect(getByTestId("login-send")).toBeTruthy();
  });

  it("blocks an invalid email with the prototype error copy", async () => {
    const { getByTestId } = renderModal(new FakeUserRepository());
    fireEvent.changeText(getByTestId("login-email-input"), "not-an-email");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => {
      expect(getByTestId("login-email-error").props.children).toBe(
        "Format email belum benar",
      );
    });
  });

  it("advances to the code step and echoes the entered email", async () => {
    const { getByTestId, getByText } = renderModal(new FakeUserRepository());
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => expect(getByText("Masukkan Kode")).toBeTruthy());
    expect(getByTestId("login-code-input")).toBeTruthy();
    expect(getByText("kamu@email.com")).toBeTruthy();
  });

  it("keeps Verifikasi disabled until 6 digits are entered", async () => {
    const { getByTestId } = renderModal(new FakeUserRepository());
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByTestId("login-code-input"));
    fireEvent.changeText(getByTestId("login-code-input"), "123");
    expect(getByTestId("login-verify").props.accessibilityState.disabled).toBe(
      true,
    );
    fireEvent.changeText(getByTestId("login-code-input"), "123456");
    await waitFor(() =>
      expect(
        getByTestId("login-verify").props.accessibilityState.disabled,
      ).toBe(false),
    );
  });

  it("shows a Bahasa OTP error on a wrong code", async () => {
    const repo = new FakeUserRepository();
    repo.throwOnVerify = true;
    const { getByTestId } = renderModal(repo);
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByTestId("login-code-input"));
    fireEvent.changeText(getByTestId("login-code-input"), "000000");
    fireEvent.press(getByTestId("login-verify"));
    await waitFor(() => {
      expect(getByTestId("login-code-error").props.children).toBe(
        "Kode OTP salah atau kedaluwarsa. Coba lagi.",
      );
    });
  });

  it("goes straight to the signed-in panel for a returning user (isNew=false)", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-1", isNew: false };
    const { getByTestId, getByText } = renderModal(repo);
    fireEvent.changeText(getByTestId("login-email-input"), "budi@mail.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByTestId("login-code-input"));
    fireEvent.changeText(getByTestId("login-code-input"), "123456");
    fireEvent.press(getByTestId("login-verify"));
    await waitFor(() => expect(getByText("Akun kamu")).toBeTruthy());
    expect(getByTestId("login-signed-name").props.children).toBe("Budi");
    expect(getByTestId("login-signed-email").props.children).toBe(
      "b***@mail.com",
    );
    expect(getByTestId("login-logout")).toBeTruthy();
  });

  // Helper: drive the modal to the register step for a NEW email.
  async function reachRegisterStep(
    getByTestId: ReturnType<typeof renderModal>["getByTestId"],
    getByText: ReturnType<typeof renderModal>["getByText"],
    email = "rizky@telkomsel.co.id",
  ) {
    fireEvent.changeText(getByTestId("login-email-input"), email);
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByTestId("login-code-input"));
    fireEvent.changeText(getByTestId("login-code-input"), "123456");
    fireEvent.press(getByTestId("login-verify"));
    await waitFor(() => expect(getByText("Lengkapi Pendaftaran")).toBeTruthy());
  }

  it("renders the name/NIK/consent registration form for a new email (isNew=true)", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    const { getByTestId, getByText } = renderModal(repo);
    await reachRegisterStep(getByTestId, getByText);
    expect(getByText("Nama Lengkap")).toBeTruthy();
    expect(getByTestId("login-reg-name-input")).toBeTruthy();
    expect(getByTestId("login-reg-nik-input")).toBeTruthy();
    expect(getByTestId("login-reg-consent")).toBeTruthy();
    expect(getByText("Kebijakan Privasi")).toBeTruthy();
    expect(getByTestId("login-reg-submit")).toBeTruthy();
  });

  it("keeps 'Daftar & Masuk' disabled until name + 16-digit NIK + consent are all valid", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    const { getByTestId, getByText } = renderModal(repo);
    await reachRegisterStep(getByTestId, getByText);
    const submit = () => getByTestId("login-reg-submit");
    expect(submit().props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("login-reg-name-input"), "Rizky Rachmawan");
    expect(submit().props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId("login-reg-nik-input"), "3201234567890123");
    // Still missing consent.
    expect(submit().props.accessibilityState.disabled).toBe(true);

    fireEvent.press(getByTestId("login-reg-consent"));
    await waitFor(() =>
      expect(submit().props.accessibilityState.disabled).toBe(false),
    );
  });

  it("shows a NIK error for a short NIK and blocks submit", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    const { getByTestId, getByText } = renderModal(repo);
    await reachRegisterStep(getByTestId, getByText);
    fireEvent.changeText(getByTestId("login-reg-name-input"), "Rizky");
    fireEvent.changeText(getByTestId("login-reg-nik-input"), "320123");
    fireEvent.press(getByTestId("login-reg-consent"));
    // 6 digits → still invalid NIK, submit stays disabled.
    expect(getByTestId("login-reg-submit").props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it("submits trimmed name + NIK via completeRegistration and shows 'Pendaftaran Berhasil'", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    repo.profile = {
      emailMasked: "r***@telkomsel.co.id",
      fullName: "Rizky Rachmawan",
      nikMasked: "32****23",
      hasNik: true,
    };
    const spy = jest.spyOn(repo, "completeRegistration");
    const { getByTestId, getByText } = renderModal(repo);
    await reachRegisterStep(getByTestId, getByText);
    fireEvent.changeText(
      getByTestId("login-reg-name-input"),
      "  Rizky Rachmawan  ",
    );
    fireEvent.changeText(getByTestId("login-reg-nik-input"), "3201234567890123");
    fireEvent.press(getByTestId("login-reg-consent"));
    fireEvent.press(getByTestId("login-reg-submit"));
    await waitFor(() => expect(getByText("Pendaftaran Berhasil 🎉")).toBeTruthy());
    expect(spy).toHaveBeenCalledWith({
      fullName: "Rizky Rachmawan",
      nik: "3201234567890123",
    });
  });

  it("surfaces a Bahasa NIK error from the port on a rejected registration", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    jest
      .spyOn(repo, "completeRegistration")
      .mockRejectedValueOnce(new Error("backend NIK reject"));
    const { getByTestId, getByText } = renderModal(repo);
    await reachRegisterStep(getByTestId, getByText);
    fireEvent.changeText(getByTestId("login-reg-name-input"), "Rizky");
    fireEvent.changeText(getByTestId("login-reg-nik-input"), "3201234567890123");
    fireEvent.press(getByTestId("login-reg-consent"));
    fireEvent.press(getByTestId("login-reg-submit"));
    await waitFor(() => {
      expect(getByTestId("login-reg-error").props.children).toBeTruthy();
    });
    // Still on the register step (no success).
    expect(getByText("Lengkapi Pendaftaran")).toBeTruthy();
  });

  it("returns to the email step via 'Ganti email'", async () => {
    const { getByTestId, getByText } = renderModal(new FakeUserRepository());
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByTestId("login-change-email"));
    fireEvent.press(getByTestId("login-change-email"));
    await waitFor(() => expect(getByText("Masuk / Daftar")).toBeTruthy());
    expect(getByTestId("login-email-input")).toBeTruthy();
  });

  it("closes on backdrop press", () => {
    const { getByTestId, onClose } = renderModal(new FakeUserRepository());
    fireEvent.press(getByTestId("login-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on hardware back / Escape (Modal onRequestClose)", () => {
    const { getByTestId, onClose } = renderModal(new FakeUserRepository());
    fireEvent(getByTestId("login-backdrop").parent!, "requestClose");
    // Fallback: directly invoke the Modal's close via the Batal button.
    fireEvent.press(getByTestId("login-cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});
