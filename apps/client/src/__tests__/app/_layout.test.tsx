import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useAccountStore } from "@presentation/stores/account-store";

let mockFontsLoaded = true;
let mockFontError: Error | null = null;
const mockServices = {
  tokenStorage: { load: jest.fn() },
  userRepository: { getMe: jest.fn() },
};

// Mock expo-router's Stack to a null-rendering stub so the layout's JSX actually
// executes under test (the real Stack needs a navigation container at runtime).
// useRouter is stubbed too: RBT-072's NotificationBridge (useNotifications)
// reads it. On the jest default platform the bridge registers via the mocked
// expo-notifications; here we only assert the layout mounts without crashing.
jest.mock("expo-router", () => ({
  Stack: () => null,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));
jest.mock("@presentation/bridges/StartupUpdateBridge", () => ({
  StartupUpdateBridge: () => null,
}));
jest.mock("@presentation/bridges/QueueMembershipBridge", () => ({
  QueueMembershipBridge: () => null,
}));

// Mock expo-font's useFonts for Plus Jakarta Sans font loading.
jest.mock("expo-font", () => ({
  useFonts: () => [mockFontsLoaded, mockFontError],
}));
jest.mock("@presentation/hooks/useNotifications", () => ({
  useNotifications: jest.fn(),
}));
jest.mock("@providers/service-context", () => ({
  useServices: () => mockServices,
  ServiceProvider: ({ children }: { children: ReactNode }) => children,
}));
jest.mock("@providers/providers", () => ({
  AppProviders: ({ children }: { children: ReactNode }) => children,
}));
jest.mock("@presentation/components/NativeLaunchSplash", () => {
  const ReactMock = require("react");
  const ReactNativeMock = require("react-native");
  return {
    NativeLaunchSplash: ({ onFinish }: { onFinish: () => void }) =>
      ReactMock.createElement(
        ReactNativeMock.Pressable,
        { testID: "mock-splash-finish", onPress: onFinish },
        ReactMock.createElement(ReactNativeMock.Text, null, "Finish splash"),
      ),
  };
});

// eslint-disable-next-line import/first
import RootLayout from "../../app/_layout";

describe("RootLayout (skeleton)", () => {
  beforeEach(() => {
    mockFontsLoaded = true;
    mockFontError = null;
    mockServices.tokenStorage.load.mockReset().mockResolvedValue(null);
    mockServices.userRepository.getMe.mockReset();
    useAccountStore.getState().clearProfile();
  });

  it("renders the router root without crashing", () => {
    expect(() => render(<RootLayout />)).not.toThrow();
  });

  it("continues into the app when font loading reports an error", () => {
    mockFontsLoaded = false;
    mockFontError = new Error("font unavailable");
    const { queryByTestId, UNSAFE_queryByType } = render(<RootLayout />);
    expect(queryByTestId("mock-splash-finish")).toBeTruthy();
    expect(
      UNSAFE_queryByType(require("react-native").ActivityIndicator),
    ).toBeNull();
  });

  it("shows the native launch splash on the native test platform", () => {
    const { getByTestId, queryByTestId } = render(<RootLayout />);
    expect(getByTestId("mock-splash-finish")).toBeTruthy();
    fireEvent.press(getByTestId("mock-splash-finish"));
    expect(queryByTestId("mock-splash-finish")).toBeNull();
  });

  it("restores a saved account after reading a session token", async () => {
    const profile = {
      emailMasked: "a***@mail.com",
      fullName: "Penonton",
      hasNik: false,
    };
    mockServices.tokenStorage.load.mockResolvedValue("saved-session");
    mockServices.userRepository.getMe.mockResolvedValue(profile);

    render(<RootLayout />);

    await waitFor(() =>
      expect(useAccountStore.getState().profile).toEqual(profile),
    );
    expect(mockServices.userRepository.getMe).toHaveBeenCalledTimes(1);
  });

  it("does not request an account when no session token is saved", async () => {
    render(<RootLayout />);
    await waitFor(() =>
      expect(mockServices.tokenStorage.load).toHaveBeenCalledTimes(1),
    );
    expect(mockServices.userRepository.getMe).not.toHaveBeenCalled();
  });

  it("keeps a guest session when the profile request fails", async () => {
    mockServices.tokenStorage.load.mockResolvedValue("expired-session");
    mockServices.userRepository.getMe.mockRejectedValue(
      new Error("unavailable"),
    );
    render(<RootLayout />);
    await waitFor(() =>
      expect(mockServices.userRepository.getMe).toHaveBeenCalledTimes(1),
    );
    expect(useAccountStore.getState().profile).toBeUndefined();
  });
});
