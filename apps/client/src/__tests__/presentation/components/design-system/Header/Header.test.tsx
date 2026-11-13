import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { Header } from "../../../../../presentation/components/Header/index";

const mockResponsive = { isNative: true, headerHeight: 56 };
let mockReducedMotion = false;
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsive,
}));
jest.mock("react-native-reanimated", () => ({
  ...jest.requireActual("react-native-reanimated/mock"),
  useReducedMotion: () => mockReducedMotion,
}));

describe("Header", () => {
  beforeEach(() => {
    mockResponsive.isNative = true;
    mockResponsive.headerHeight = 56;
    mockReducedMotion = false;
  });

  it("renders the logo and configured native actions with a capped count badge", () => {
    const onLogoPress = jest.fn();
    const onLogin = jest.fn();
    const { getByLabelText, getByTestId, getByText, queryByText } = render(
      <Header
        onLogoPress={onLogoPress}
        isLoggedIn
        actions={[
          {
            icon: "login",
            label: "Masuk",
            onPress: onLogin,
            testID: "header-login",
            count: 120,
          },
          {
            icon: "login",
            label: "Pemberitahuan",
            testID: "header-count",
            count: 12,
          },
          {
            icon: "login",
            label: "Notifikasi",
            testID: "header-notifications",
            count: 0,
          },
        ]}
      />,
    );

    fireEvent.press(getByTestId("header-logo"));
    fireEvent(getByTestId("header-login"), "pressIn");
    fireEvent(getByTestId("header-login"), "pressOut");
    fireEvent.press(getByTestId("header-login"));

    expect(getByLabelText("Beranda Rusuh Tiket")).toBeTruthy();
    expect(onLogoPress).toHaveBeenCalledTimes(1);
    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(getByText("99+")).toBeTruthy();
    expect(getByText("12")).toBeTruthy();
    expect(queryByText("0")).toBeNull();
  });

  it("hides native actions for a logged-in user when none are configured", () => {
    const { queryByTestId } = render(<Header isLoggedIn />);
    expect(queryByTestId("header-cta")).toBeNull();
    expect(queryByTestId("header-login")).toBeNull();
  });

  it("renders web navigation and the sign-in CTA when the user is a guest", () => {
    mockResponsive.isNative = false;
    mockResponsive.headerHeight = 60;
    const onCtaPress = jest.fn();
    const onBrowse = jest.fn();
    const { getByTestId, getByText } = render(
      <Header
        showLinks
        links={[{ label: "Jelajahi", onPress: onBrowse, testID: "nav-browse" }]}
        onCtaPress={onCtaPress}
      />,
    );

    fireEvent.press(getByTestId("nav-browse"));
    fireEvent.press(getByTestId("header-cta"));
    fireEvent(getByTestId("nav-browse"), "hoverIn");
    fireEvent(getByTestId("nav-browse"), "hoverOut");
    fireEvent(getByTestId("header-cta"), "hoverIn");
    fireEvent(getByTestId("header-cta"), "hoverOut");
    fireEvent(getByTestId("header-cta"), "pressIn");
    fireEvent(getByTestId("header-cta"), "pressOut");

    expect(getByText("Jelajahi")).toBeTruthy();
    expect(onBrowse).toHaveBeenCalledTimes(1);
    expect(onCtaPress).toHaveBeenCalledTimes(1);
  });

  it("omits the web CTA for a signed-in user and skips an empty link row", () => {
    mockResponsive.isNative = false;
    const { queryByTestId } = render(
      <Header isLoggedIn showLinks links={[]} />,
    );

    expect(queryByTestId("header-cta")).toBeNull();
    expect(queryByTestId("nav-browse")).toBeNull();
  });

  it("applies pressed state immediately when reduced motion is preferred", () => {
    mockReducedMotion = true;
    const { getByTestId } = render(
      <Header
        actions={[{ icon: "login", label: "Masuk", testID: "header-login" }]}
      />,
    );
    fireEvent(getByTestId("header-login"), "pressIn");
    fireEvent(getByTestId("header-login"), "pressOut");
    expect(getByTestId("header-login")).toBeTruthy();
  });

  it("applies CTA hover state immediately when reduced motion is preferred", () => {
    mockResponsive.isNative = false;
    mockReducedMotion = true;
    const { getByTestId } = render(<Header onCtaPress={jest.fn()} />);

    fireEvent(getByTestId("header-cta"), "hoverIn");
    fireEvent(getByTestId("header-cta"), "hoverOut");
    expect(getByTestId("header-cta")).toBeTruthy();
  });

  it("completes the entrance transition after its delay", () => {
    jest.useFakeTimers();
    const { unmount } = render(<Header />);

    act(() => jest.advanceTimersByTime(500));
    unmount();
    jest.useRealTimers();
  });
});
