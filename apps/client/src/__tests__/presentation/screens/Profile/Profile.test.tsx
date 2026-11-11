import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Animated } from "react-native";

import type { TokenStorage } from "@domain/auth/token-storage.port";
import type {
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { ToastProvider } from "@presentation/components/design-system/Toast";
import { ProfileScreen } from "@presentation/screens/Profile";
import { useAccountStore } from "@presentation/stores/account-store";

const mockRouter = {
  push: jest.fn(),
  navigate: jest.fn(),
  dismissTo: jest.fn(),
};
const mockResponsive = { isWeb: false, isNative: true, width: 393 };
jest.mock("expo-router", () => ({ useRouter: () => mockRouter }));
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsive,
}));

const completedAnimation = {
  start: (callback?: (result: { finished: boolean }) => void) =>
    callback?.({ finished: true }),
  stop: () => undefined,
  reset: () => undefined,
};

const returningProfile: UserProfile = {
  emailMasked: "r***@mail.com",
  fullName: "Rizky Rachmawan",
  nikMasked: "32******23",
  hasNik: true,
};

function renderProfile(
  overrides: {
    completeRegistration?: UserRepository["completeRegistration"];
    clearToken?: TokenStorage["clear"];
    logout?: UserRepository["logout"];
  } = {},
) {
  const base = createContainer({ useMocks: true });
  const userRepository: UserRepository = {
    ...base.userRepository,
    logout: overrides.logout ?? base.userRepository.logout,
    completeRegistration:
      overrides.completeRegistration ??
      jest.fn().mockResolvedValue(returningProfile),
  };
  const tokenStorage: TokenStorage = {
    ...base.tokenStorage,
    clear: overrides.clearToken ?? jest.fn().mockResolvedValue(undefined),
  };
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const screen = render(
    <QueryClientProvider client={queryClient}>
      <ServiceProvider container={{ ...base, userRepository, tokenStorage }}>
        <ToastProvider>
          <ProfileScreen />
        </ToastProvider>
      </ServiceProvider>
    </QueryClientProvider>,
  );
  return { ...screen, userRepository, tokenStorage };
}

describe("ProfileScreen", () => {
  beforeEach(() => {
    useAccountStore.getState().clearProfile();
    mockRouter.push.mockReset();
    mockRouter.navigate.mockReset();
    mockRouter.dismissTo.mockReset();
    mockResponsive.isWeb = false;
    mockResponsive.isNative = true;
    mockResponsive.width = 393;
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

  afterEach(() => jest.restoreAllMocks());

  it("renders a guest account card and can open the sign-in dialog", () => {
    const screen = renderProfile();
    expect(screen.getByText("Akun Tamu")).toBeTruthy();
    fireEvent.press(screen.getByTestId("profile-login"));
    expect(screen.getByTestId("login-email-input")).toBeTruthy();
  });

  it("renders masked profile details and validates an incomplete edit locally", () => {
    useAccountStore.getState().setProfile(returningProfile);
    const { getByTestId, getByText, userRepository } = renderProfile();
    expect(getByText("Rizky Rachmawan")).toBeTruthy();
    expect(getByText("r***@mail.com")).toBeTruthy();
    expect(getByText("NIK 32******23")).toBeTruthy();

    fireEvent.press(getByTestId("profile-edit"));
    fireEvent.changeText(getByTestId("profile-nik-input"), "123");
    fireEvent.press(getByTestId("profile-save"));

    expect(
      getByText("Masukkan nama dan NIK 16 digit untuk menyimpan perubahan."),
    ).toBeTruthy();
    expect(userRepository.completeRegistration).not.toHaveBeenCalled();
  });

  it("saves a valid edit through the use case and refreshes the account store", async () => {
    const updatedProfile: UserProfile = {
      ...returningProfile,
      fullName: "Rizky Updated",
      nikMasked: "32******99",
    };
    const completeRegistration = jest.fn().mockResolvedValue(updatedProfile);
    useAccountStore.getState().setProfile(returningProfile);
    const { getByTestId, getByText } = renderProfile({ completeRegistration });

    fireEvent.press(getByTestId("profile-edit"));
    fireEvent.changeText(
      getByTestId("profile-name-input"),
      "  Rizky Updated  ",
    );
    fireEvent.changeText(getByTestId("profile-nik-input"), "3201234567890199");
    fireEvent.press(getByTestId("profile-save"));

    await waitFor(() => expect(getByText("Rizky Updated")).toBeTruthy());
    expect(completeRegistration).toHaveBeenCalledWith({
      fullName: "Rizky Updated",
      nik: "3201234567890199",
    });
    expect(useAccountStore.getState().profile).toEqual(updatedProfile);
    expect(getByTestId("profile-edit")).toBeTruthy();
  });

  it("keeps edit mode open and shows a save error when the repository rejects", async () => {
    const completeRegistration = jest
      .fn()
      .mockRejectedValue(new Error("Profil gagal diperbarui."));
    useAccountStore.getState().setProfile(returningProfile);
    const { getByTestId, getByText } = renderProfile({ completeRegistration });

    fireEvent.press(getByTestId("profile-edit"));
    fireEvent.changeText(getByTestId("profile-nik-input"), "3201234567890199");
    fireEvent.press(getByTestId("profile-save"));

    await waitFor(() =>
      expect(
        getByText("Data yang dimasukkan tidak valid. Periksa kembali."),
      ).toBeTruthy(),
    );
    expect(getByTestId("profile-name-input")).toBeTruthy();
  });

  it("clears the session and profile on sign out", async () => {
    const clearToken = jest.fn().mockResolvedValue(undefined);
    useAccountStore.getState().setProfile(returningProfile);
    const { getByTestId, getByText } = renderProfile({ clearToken });

    fireEvent.press(getByTestId("profile-sign-out"));

    await waitFor(() => expect(getByText("Akun Tamu")).toBeTruthy());
    expect(getByText("Berhasil keluar dari akun.")).toBeTruthy();
    expect(clearToken).toHaveBeenCalledTimes(1);
    expect(useAccountStore.getState().profile).toBeUndefined();
  });

  it("shows a failure toast and keeps the account when logout fails", async () => {
    useAccountStore.getState().setProfile(returningProfile);
    const { getByTestId, getAllByText } = renderProfile({
      logout: jest.fn().mockRejectedValue(new Error("offline")),
    });

    fireEvent.press(getByTestId("profile-sign-out"));

    await waitFor(() =>
      expect(getAllByText("Gagal keluar. Silakan coba lagi.")).toHaveLength(1),
    );
    expect(useAccountStore.getState().profile).toEqual(returningProfile);
  });

  it("supports desktop navigation and cancels an incomplete profile edit", () => {
    useAccountStore.getState().setProfile(returningProfile);
    mockResponsive.isWeb = true;
    mockResponsive.isNative = false;
    mockResponsive.width = 1280;
    const { getByTestId, queryByTestId } = renderProfile();

    fireEvent.press(getByTestId("header-logo"));
    fireEvent.press(getByTestId("nav-home"));
    fireEvent.press(getByTestId("nav-browse"));
    fireEvent.press(getByTestId("nav-tickets"));
    fireEvent.press(getByTestId("profile-edit"));
    fireEvent.changeText(getByTestId("profile-nik-input"), "123456");
    fireEvent.press(getByTestId("profile-cancel"));

    expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, "/");
    expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, "/");
    expect(mockRouter.navigate).toHaveBeenNthCalledWith(3, "/browse");
    expect(mockRouter.navigate).toHaveBeenNthCalledWith(4, "/my-tickets");
    expect(queryByTestId("profile-nik-input")).toBeNull();
  });

  it("routes native bottom navigation for a signed-in profile", () => {
    useAccountStore.getState().setProfile(returningProfile);
    const { getByRole } = renderProfile();

    fireEvent.press(getByRole("tab", { name: "Beranda" }));
    fireEvent.press(getByRole("tab", { name: "Jelajah" }));
    fireEvent.press(getByRole("tab", { name: "Ticket" }));

    expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, "/");
    expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, "/browse");
    expect(mockRouter.navigate).toHaveBeenNthCalledWith(3, "/my-tickets");
  });

  it("opens sign-in from the guest desktop header action", () => {
    mockResponsive.isWeb = true;
    mockResponsive.isNative = false;
    mockResponsive.width = 1280;
    const { getByTestId } = renderProfile();

    fireEvent.press(getByTestId("header-cta"));

    expect(getByTestId("login-email-input")).toBeTruthy();
  });
});
