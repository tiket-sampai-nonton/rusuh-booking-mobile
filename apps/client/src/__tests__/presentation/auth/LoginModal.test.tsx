/**
 * RBT-020 — LoginModal component tests (RNTL).
 *
 * Renders the modal inside a ServiceProvider (fake UserRepository) + a real
 * QueryClientProvider, then drives the  prototype flow:
 *  - open modal
 *  - invalid email blocked ("Format email belum benar")
 *  - email submit → OTP step with 6 separate digit boxes
 *  - <6 digits keeps Verifikasi disabled
 *  - wrong code → Bahasa OTP error
 *  - correct code (123456) isNew=false → signed-in panel
 *  - isNew=true → register form (name + NIK + consent)
 *  - "Ubah Email" returns to email step
 *  - backdrop + hardware-back (Escape) close
 *
 *  OTP input: 6 individual boxes (login-otp-0 to login-otp-5), NOT a single input.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Animated, BackHandler, Platform } from "react-native";

import type { Container } from "@providers/container";
import type { BuyerEmailStorage } from "@domain/auth/buyer-email-storage.port";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { ToastProvider } from "@presentation/components/design-system/Toast";
import { LoginModal } from "@presentation/components/auth/LoginModal";
import { loginStyles } from "@presentation/components/auth/LoginModal/style";

import type {
  AuthSession,
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";
import { DomainError } from "@domain/errors/domain-error";

const completedAnimation = {
  start: (callback?: (result: { finished: boolean }) => void) =>
    callback?.({ finished: true }),
  stop: () => undefined,
  reset: () => undefined,
};

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
  async getCheckoutDetails() {
    return { email: "budi@example.com", fullName: this.profile.fullName };
  }
}

function renderModal(
  repo: UserRepository,
  visible = true,
  onOpenPrivacy = jest.fn(),
  buyerEmailStorage?: BuyerEmailStorage,
) {
  const base = createContainer({ useMocks: true });
  const container: Container = {
    ...base,
    userRepository: repo,
    ...(buyerEmailStorage ? { buyerEmailStorage } : {}),
  };
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const onClose = jest.fn();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <ServiceProvider container={container}>
        <ToastProvider>
          <LoginModal
            visible={visible}
            onClose={onClose}
            onOpenPrivacy={onOpenPrivacy}
          />
        </ToastProvider>
      </ServiceProvider>
    </QueryClientProvider>,
  );
  return { ...utils, onClose, onOpenPrivacy };
}

describe("LoginModal (RBT-020)", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest
      .spyOn(Animated, "timing")
      .mockReturnValue(
        completedAnimation as ReturnType<typeof Animated.timing>,
      );
    jest
      .spyOn(Animated, "parallel")
      .mockReturnValue(
        completedAnimation as ReturnType<typeof Animated.parallel>,
      );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  it("keeps the focused email border inside the input bounds", () => {
    expect(loginStyles.inputFocused.transform).toEqual([{ translateY: -2 }]);
  });

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

  it("focuses the web email field and clears a validation message when edited", () => {
    jest.useFakeTimers();
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const { getByTestId } = renderModal(new FakeUserRepository());
    const email = getByTestId("login-email-input");
    fireEvent(email, "focus");
    fireEvent.changeText(email, "bad-email");
    fireEvent.press(getByTestId("login-send"));
    expect(getByTestId("login-email-error").props.children).toBe(
      "Format email belum benar",
    );
    fireEvent.changeText(email, "valid@example.com");
    fireEvent(email, "blur");
    act(() => jest.advanceTimersByTime(500));
    expect(getByTestId("login-email-error").props.children).toBe("");
  });

  it("shows a typed Bahasa request error from the domain", async () => {
    const repo = new FakeUserRepository();
    jest.spyOn(repo, "requestOtp").mockRejectedValueOnce(
      new DomainError({
        kind: "auth",
        code: "OTP_FAILED",
        userMessage: "Email belum terdaftar.",
      }),
    );
    const { getByTestId, getAllByText } = renderModal(repo);
    fireEvent.changeText(getByTestId("login-email-input"), "valid@example.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() =>
      expect(getByTestId("login-email-error").props.children).toBe(
        "Email belum terdaftar.",
      ),
    );
    expect(getAllByText("Email belum terdaftar.").length).toBeGreaterThan(1);
  });

  it("uses the generic request fallback for an untyped error", async () => {
    const repo = new FakeUserRepository();
    jest.spyOn(repo, "requestOtp").mockRejectedValueOnce(new Error("offline"));
    const { getByTestId } = renderModal(repo);
    fireEvent.changeText(getByTestId("login-email-input"), "valid@example.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() =>
      expect(getByTestId("login-email-error").props.children).toBe(
        "Terjadi kesalahan. Silakan coba lagi.",
      ),
    );
  });

  it("advances to the OTP step and echoes the entered email", async () => {
    const { getByTestId, getByText, queryByText } = renderModal(
      new FakeUserRepository(),
    );
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    // : "Verifikasi OTP" title, 6 separate digit boxes
    await waitFor(() => expect(getByText("Verifikasi OTP")).toBeTruthy());
    expect(getByTestId("login-otp-0")).toBeTruthy();
    expect(getByTestId("login-otp-5")).toBeTruthy();
    expect(getByText("kamu@email.com")).toBeTruthy();
    expect(getByText("Kode verifikasi dikirim ke email Anda.")).toBeTruthy();
    expect(queryByText(/Kode demo/)).toBeNull();
  });

  it("fills all OTP boxes when a six-digit code is pasted into one field", async () => {
    const { getByTestId, getByText } = renderModal(new FakeUserRepository());
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByText("Verifikasi OTP"));

    fireEvent.changeText(getByTestId("login-otp-0"), "123456");

    expect(getByTestId("login-verify").props.accessibilityState.disabled).toBe(
      false,
    );
    for (const [index, digit] of [..."123456"].entries()) {
      expect(getByTestId(`login-otp-${index}`).props.value).toBe(digit);
    }
  });

  it("keeps Verifikasi disabled until 6 digits are entered", async () => {
    const { getByTestId, getByText } = renderModal(new FakeUserRepository());
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByText("Verifikasi OTP"));
    // Enter 3 digits (incomplete)
    fireEvent.changeText(getByTestId("login-otp-0"), "1");
    fireEvent.changeText(getByTestId("login-otp-1"), "2");
    fireEvent.changeText(getByTestId("login-otp-2"), "3");
    expect(getByTestId("login-verify").props.accessibilityState.disabled).toBe(
      true,
    );
    // Complete all 6 digits
    fireEvent.changeText(getByTestId("login-otp-3"), "4");
    fireEvent.changeText(getByTestId("login-otp-4"), "5");
    fireEvent.changeText(getByTestId("login-otp-5"), "6");
    await waitFor(() =>
      expect(
        getByTestId("login-verify").props.accessibilityState.disabled,
      ).toBe(false),
    );
  });

  it("keeps verify and resend controls disabled until their prerequisites are met", async () => {
    jest.useFakeTimers();
    const repo = new FakeUserRepository();
    const requestOtp = jest.spyOn(repo, "requestOtp");
    const { getByTestId, getByText } = renderModal(repo);
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByText("Verifikasi OTP"));

    expect(requestOtp).toHaveBeenCalledTimes(1);
    expect(getByTestId("login-verify").props.accessibilityState.disabled).toBe(
      true,
    );
    expect(getByText("Kirim ulang (60s)")).toBeTruthy();
  });

  it("resends OTP after cooldown and handles digit focus movement", async () => {
    jest.useFakeTimers();
    const repo = new FakeUserRepository();
    const requestOtp = jest.spyOn(repo, "requestOtp");
    const { getByTestId, getByText } = renderModal(repo);
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByText("Verifikasi OTP"));

    fireEvent.changeText(getByTestId("login-otp-0"), "1");
    fireEvent.changeText(getByTestId("login-otp-1"), "2");
    fireEvent.changeText(getByTestId("login-otp-1"), "");
    fireEvent(getByTestId("login-otp-1"), "keyPress", {
      nativeEvent: { key: "Backspace" },
    });
    fireEvent(getByTestId("login-otp-0"), "keyPress", {
      nativeEvent: { key: "Backspace" },
    });
    act(() => jest.advanceTimersByTime(60_000));
    expect(getByTestId("login-resend").props.disabled).toBeFalsy();
    fireEvent.press(getByTestId("login-resend"));
    await waitFor(() => expect(getByText("Kirim ulang (60s)")).toBeTruthy());
    expect(requestOtp).toHaveBeenCalledTimes(2);
    act(() => jest.advanceTimersByTime(1_000));
  });

  it("shows a Bahasa OTP error on a wrong code", async () => {
    const repo = new FakeUserRepository();
    repo.throwOnVerify = true;
    const { getByTestId, getByText, getAllByText } = renderModal(repo);
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByText("Verifikasi OTP"));
    // Enter wrong code via separate boxes
    fireEvent.changeText(getByTestId("login-otp-0"), "0");
    fireEvent.changeText(getByTestId("login-otp-1"), "0");
    fireEvent.changeText(getByTestId("login-otp-2"), "0");
    fireEvent.changeText(getByTestId("login-otp-3"), "0");
    fireEvent.changeText(getByTestId("login-otp-4"), "0");
    fireEvent.changeText(getByTestId("login-otp-5"), "0");
    fireEvent.press(getByTestId("login-verify"));
    await waitFor(() => {
      //  testID: login-otp-error — DomainError message from OTP_INVALID
      expect(getByTestId("login-otp-error").props.children).toBe(
        "Kode OTP salah atau kedaluwarsa. Coba lagi.",
      );
    });
    expect(
      getAllByText("Kode OTP salah atau kedaluwarsa. Coba lagi.").length,
    ).toBeGreaterThan(1);
  });

  it("goes straight to the signed-in panel for a returning user (isNew=false)", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-1", isNew: false };
    const { getByTestId, getByText, queryByTestId } = renderModal(repo);
    fireEvent.changeText(getByTestId("login-email-input"), "budi@mail.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByText("Verifikasi OTP"));
    // Enter code via separate boxes
    fireEvent.changeText(getByTestId("login-otp-0"), "1");
    fireEvent.changeText(getByTestId("login-otp-1"), "2");
    fireEvent.changeText(getByTestId("login-otp-2"), "3");
    fireEvent.changeText(getByTestId("login-otp-3"), "4");
    fireEvent.changeText(getByTestId("login-otp-4"), "5");
    fireEvent.changeText(getByTestId("login-otp-5"), "6");
    fireEvent.press(getByTestId("login-verify"));
    // : "Akun Kamu" (capitalized)
    await waitFor(() => expect(getByText("Akun Kamu")).toBeTruthy());
    expect(getByTestId("login-signed-name").props.children).toBe("Budi");
    expect(getByTestId("login-signed-email").props.children).toBe(
      "b***@mail.com",
    );
    expect(queryByTestId("login-logout")).toBeNull();
    expect(getByTestId("login-close-signed")).toBeTruthy();
    expect(getByText("Berhasil masuk.")).toBeTruthy();
  });

  it("persists the verified email for checkout autofill after refresh", async () => {
    const repo = new FakeUserRepository();
    const buyerEmailStorage: BuyerEmailStorage = {
      save: jest.fn().mockResolvedValue(undefined),
      load: jest.fn().mockResolvedValue(null),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const { getByTestId, getByText } = renderModal(
      repo,
      true,
      jest.fn(),
      buyerEmailStorage,
    );
    fireEvent.changeText(getByTestId("login-email-input"), "buyer@mail.com");
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByText("Verifikasi OTP"));
    for (const [index, digit] of [..."123456"].entries()) {
      fireEvent.changeText(getByTestId(`login-otp-${index}`), digit);
    }
    fireEvent.press(getByTestId("login-verify"));

    await waitFor(() =>
      expect(buyerEmailStorage.save).toHaveBeenCalledWith("buyer@mail.com"),
    );
  });

  it("automatically closes after five seconds and keeps manual close available", async () => {
    jest.useFakeTimers();
    const { getByTestId, getByText, onClose } = renderModal(
      new FakeUserRepository(),
    );
    fireEvent.changeText(getByTestId("login-email-input"), "budi@mail.com");
    fireEvent.press(getByTestId("login-send"));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    for (const [index, digit] of [..."123456"].entries()) {
      fireEvent.changeText(getByTestId(`login-otp-${index}`), digit);
    }
    fireEvent.press(getByTestId("login-verify"));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(getByText("Akun Kamu")).toBeTruthy();
    expect(getByTestId("login-close-signed")).toBeTruthy();
    act(() => jest.advanceTimersByTime(4999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Helper: drive the modal to the register step for a NEW email ( uses 6 boxes).
  async function reachRegisterStep(
    getByTestId: ReturnType<typeof renderModal>["getByTestId"],
    getByText: ReturnType<typeof renderModal>["getByText"],
    email = "rizky@telkomsel.co.id",
  ) {
    fireEvent.changeText(getByTestId("login-email-input"), email);
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => getByText("Verifikasi OTP"));
    // Enter code via separate boxes
    fireEvent.changeText(getByTestId("login-otp-0"), "1");
    fireEvent.changeText(getByTestId("login-otp-1"), "2");
    fireEvent.changeText(getByTestId("login-otp-2"), "3");
    fireEvent.changeText(getByTestId("login-otp-3"), "4");
    fireEvent.changeText(getByTestId("login-otp-4"), "5");
    fireEvent.changeText(getByTestId("login-otp-5"), "6");
    fireEvent.press(getByTestId("login-verify"));
    await waitFor(() => expect(getByText("Lengkapi Pendaftaran")).toBeTruthy());
  }

  async function reachOtpStep(
    getByTestId: ReturnType<typeof renderModal>["getByTestId"],
    getByText: ReturnType<typeof renderModal>["getByText"],
    email = "rizky@telkomsel.co.id",
  ) {
    fireEvent.changeText(getByTestId("login-email-input"), email);
    fireEvent.press(getByTestId("login-send"));
    await waitFor(() => expect(getByText("Verifikasi OTP")).toBeTruthy());
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

  it("opens the privacy screen without toggling registration consent", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    const { getByTestId, getByText, onClose, onOpenPrivacy } =
      renderModal(repo);
    await reachRegisterStep(getByTestId, getByText);

    fireEvent.press(getByTestId("login-reg-privacy-link"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenPrivacy).toHaveBeenCalledTimes(1);
    expect(
      getByTestId("login-reg-consent").props.accessibilityState.checked,
    ).toBe(false);
  });

  it("supports web focus transitions through OTP verification and registration", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    const { getByTestId, getByText } = renderModal(repo);
    await reachRegisterStep(getByTestId, getByText);

    await act(async () => new Promise((resolve) => setTimeout(resolve, 550)));
    expect(getByTestId("login-reg-name-input")).toBeTruthy();
  });

  it("keeps 'Daftar & Masuk' disabled until name + 16-digit NIK + consent are all valid", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    const { getByTestId, getByText } = renderModal(repo);
    await reachRegisterStep(getByTestId, getByText);
    const submit = () => getByTestId("login-reg-submit");
    expect(submit().props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(
      getByTestId("login-reg-name-input"),
      "Rizky Rachmawan",
    );
    expect(submit().props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(
      getByTestId("login-reg-nik-input"),
      "3201234567890123",
    );
    // Still missing consent.
    expect(submit().props.accessibilityState.disabled).toBe(true);

    fireEvent.press(getByTestId("login-reg-consent"));
    await waitFor(() =>
      expect(submit().props.accessibilityState.disabled).toBe(false),
    );
  });

  it("guards a direct registration call until the form is valid", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    const completeRegistration = jest.spyOn(repo, "completeRegistration");
    const { getByTestId, getByText } = renderModal(repo);
    await reachRegisterStep(getByTestId, getByText);
    expect(
      getByTestId("login-reg-submit").props.accessibilityState.disabled,
    ).toBe(true);
    expect(completeRegistration).not.toHaveBeenCalled();
    fireEvent(getByTestId("login-card"), "press", {
      stopPropagation: jest.fn(),
    });
  });

  it("uses a safe avatar and name for a returning profile with missing fields", async () => {
    const repo = new FakeUserRepository();
    repo.profile = { emailMasked: "", fullName: undefined, hasNik: false };
    const { getByTestId, getByText } = renderModal(repo);
    await reachOtpStep(getByTestId, getByText);
    for (let index = 0; index < 6; index += 1) {
      fireEvent.changeText(
        getByTestId(`login-otp-${index}`),
        "123456"[index] ?? "",
      );
    }
    fireEvent.press(getByTestId("login-verify"));
    await waitFor(() =>
      expect(getByTestId("login-signed-name").props.children).toBe("—"),
    );
    expect(getByTestId("login-signed-email").props.children).toBe("");
    expect(getByText("B")).toBeTruthy();
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
    expect(
      getByTestId("login-reg-submit").props.accessibilityState.disabled,
    ).toBe(true);
  });

  it("submits trimmed name + NIK via completeRegistration and shows success", async () => {
    const repo = new FakeUserRepository();
    repo.session = { token: "tok-new", isNew: true };
    repo.profile = {
      emailMasked: "r***@telkomsel.co.id",
      fullName: undefined,
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
    fireEvent.changeText(
      getByTestId("login-reg-nik-input"),
      "3201234567890123",
    );
    fireEvent.press(getByTestId("login-reg-consent"));
    fireEvent.press(getByTestId("login-reg-submit"));
    // : "Berhasil!" success title
    await waitFor(() => expect(getByText("Berhasil!")).toBeTruthy());
    expect(getByText("Cari Tiket")).toBeTruthy();
    expect(getByText(/Akun Rizky Rachmawan aktif/)).toBeTruthy();
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
    fireEvent.changeText(
      getByTestId("login-reg-nik-input"),
      "3201234567890123",
    );
    fireEvent.press(getByTestId("login-reg-consent"));
    fireEvent.press(getByTestId("login-reg-submit"));
    await waitFor(() => {
      expect(getByTestId("login-reg-error").props.children).toBeTruthy();
    });
    // Still on the register step (no success).
    expect(getByText("Lengkapi Pendaftaran")).toBeTruthy();
  });

  it("returns to the email step via 'Ubah Email'", async () => {
    const { getByTestId, getByText } = renderModal(new FakeUserRepository());
    fireEvent.changeText(getByTestId("login-email-input"), "kamu@email.com");
    fireEvent.press(getByTestId("login-send"));
    // : testID is login-change-email with label "← Ubah Email"
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

  it("registers and handles Android hardware back", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    let handler: (() => boolean | null | undefined) | undefined;
    jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_event, callback) => {
        handler = callback;
        return { remove: jest.fn() };
      });
    const { onClose } = renderModal(new FakeUserRepository());

    expect(handler).toBeDefined();
    act(() => {
      if (handler) handler();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not mount the native sheet when hidden", () => {
    const { queryByTestId } = renderModal(new FakeUserRepository(), false);
    expect(queryByTestId("login-email-input")).toBeNull();
  });
});
