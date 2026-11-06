import { fireEvent, render, screen } from "@testing-library/react-native";
import { Animated, Platform } from "react-native";

import type { EventDetail } from "@domain/repositories/event.repository";
import { FloatingCTA } from "../../../../../../presentation/screens/EventDetail/fragments/FloatingCTA/index";

describe("FloatingCTA", () => {
  const originalPlatform = Platform.OS;
  const event = { minPriceMinor: 45000000 } as EventDetail;

  beforeEach(() => {
    jest.spyOn(Animated, "timing").mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    } as never);
    jest.spyOn(Animated, "loop").mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  it("renders a disabled native action when tickets cannot be joined", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    const onJoin = jest.fn();
    render(
      <FloatingCTA
        event={{} as EventDetail}
        canJoin={false}
        ctaLabel="Tiket Habis"
        onJoin={onJoin}
      />,
    );
    const button = screen.getByRole("button", { name: "Tiket Habis" });
    expect(screen.getByText("Menyusul")).toBeTruthy();
    expect(button.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(button);
    expect(onJoin).not.toHaveBeenCalled();
  });

  it("starts the web purchase action and displays web trust badges", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const onJoin = jest.fn();
    render(
      <FloatingCTA
        event={event}
        canJoin
        ctaLabel="Masuk Antrean"
        onJoin={onJoin}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Masuk Antrean" }));
    expect(
      screen.getByText("Tiket resmi", { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(
      screen.getByText("Antrean adil", { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(
      screen.getByText("Tiket elektronik instan", {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();
    expect(onJoin).toHaveBeenCalledTimes(1);
  });

  it("omits the arrow and blocks a disabled web action", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const onJoin = jest.fn();
    render(
      <FloatingCTA
        event={event}
        canJoin={false}
        ctaLabel="Tiket Habis"
        onJoin={onJoin}
      />,
    );
    const button = screen.getByRole("button", { name: "Tiket Habis" });
    expect(button.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(button);
    expect(onJoin).not.toHaveBeenCalled();
  });

  it("supports native press feedback and calls the join action", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    const onJoin = jest.fn();
    render(
      <FloatingCTA
        event={event}
        canJoin
        ctaLabel="Beli Tiket"
        onJoin={onJoin}
      />,
    );
    const button = screen.getByRole("button", { name: "Beli Tiket" });
    fireEvent(button, "pressIn");
    fireEvent.press(button);
    fireEvent(button, "pressOut");
    expect(onJoin).toHaveBeenCalledTimes(1);
  });
});
