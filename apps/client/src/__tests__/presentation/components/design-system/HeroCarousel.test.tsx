import { act, fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";

import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";

let mockReducedMotion = false;
const mockResponsive = {
  isNative: true,
  width: 393,
  height: 852,
  heroHeightVh: 70,
};
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockReducedMotion };
});
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsive,
}));
jest.mock("@providers/service-context", () => ({
  useServices: () => ({
    serverClock: {
      remaining: (expiresAtIso: string) =>
        Math.max(
          0,
          Date.parse(expiresAtIso) - Date.parse("2026-11-04T00:00:00.000Z"),
        ),
    },
  }),
}));

// eslint-disable-next-line import/first
import { HeroCarousel } from "@presentation/components/design-system/HeroCarousel";

describe("HeroCarousel", () => {
  afterEach(() => {
    jest.useRealTimers();
    mockReducedMotion = false;
    mockResponsive.isNative = true;
    mockResponsive.width = 393;
    mockResponsive.height = 852;
    mockResponsive.heroHeightVh = 70;
  });

  it("automatically advances through the supplied hero events", () => {
    jest.useFakeTimers();
    const { getByTestId } = render(
      <HeroCarousel
        events={EVENT_FIXTURES.slice(0, 3)}
        onBook={jest.fn()}
        onSeeAll={jest.fn()}
      />,
    );

    expect(getByTestId("hero-book").props.accessibilityLabel).toBe(
      "Beli tiket untuk Rusuh Fest 2026",
    );
    act(() => jest.advanceTimersByTime(6000));
    expect(getByTestId("hero-book").props.accessibilityLabel).toBe(
      "Beli tiket untuk Nonton Bareng Finale",
    );
    act(() => jest.advanceTimersByTime(1000));
  });

  it("rotates without motion effects when reduced motion is enabled", () => {
    jest.useFakeTimers();
    mockReducedMotion = true;
    const { getByTestId } = render(
      <HeroCarousel
        events={EVENT_FIXTURES.slice(0, 3)}
        onBook={jest.fn()}
        onSeeAll={jest.fn()}
      />,
    );

    expect(getByTestId("hero-book").props.accessibilityLabel).toBe(
      "Beli tiket untuk Rusuh Fest 2026",
    );
    act(() => jest.advanceTimersByTime(6000));
    expect(getByTestId("hero-book").props.accessibilityLabel).toBe(
      "Beli tiket untuk Nonton Bareng Finale",
    );
  });

  it("renders the desktop information, slide controls, and both booking actions", () => {
    const previousPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    mockResponsive.isNative = false;
    mockResponsive.width = 1280;
    mockResponsive.height = 900;
    mockResponsive.heroHeightVh = 100;
    mockReducedMotion = true;
    const onBook = jest.fn();
    const onSeeAll = jest.fn();

    try {
      const { getByLabelText, getByTestId, getByText, unmount } = render(
        <HeroCarousel
          events={EVENT_FIXTURES.slice(0, 3)}
          onBook={onBook}
          onSeeAll={onSeeAll}
        />,
      );

      expect(getByText("Rusuh Fest 2026")).toBeTruthy();
      expect(getByText("Pengalaman konser tak terlupakan.")).toBeTruthy();
      expect(getByTestId("hero-countdown")).toBeTruthy();
      expect(getByText("Gelora Bung Karno, Jakarta")).toBeTruthy();
      fireEvent.press(getByTestId("hero-book"));
      fireEvent.press(getByTestId("hero-detail"));
      fireEvent.press(getByLabelText("Slide 2"));
      fireEvent.press(getByLabelText("Slide 2"));

      expect(onBook).toHaveBeenCalledTimes(2);
      expect(onBook).toHaveBeenCalledWith("evt-1");
      expect(getByText("Nonton Bareng Finale")).toBeTruthy();
      expect(getByLabelText("Slide 2").props.accessibilityState.selected).toBe(
        true,
      );
      unmount();
    } finally {
      Object.defineProperty(Platform, "OS", {
        configurable: true,
        value: previousPlatform,
      });
    }
  });

  it("omits the desktop countdown when the event has no scheduled start time", () => {
    const previousPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    mockResponsive.isNative = false;
    mockResponsive.width = 1280;
    mockResponsive.height = 900;
    mockResponsive.heroHeightVh = 100;
    try {
      const eventWithoutStart = {
        ...EVENT_FIXTURES[0],
        startsAt: undefined,
        venue: undefined,
        minPriceMinor: undefined,
      };
      const { queryByTestId } = render(
        <HeroCarousel
          events={[eventWithoutStart]}
          onBook={jest.fn()}
          onSeeAll={jest.fn()}
          autoPlay={false}
        />,
      );
      expect(queryByTestId("hero-countdown")).toBeNull();
    } finally {
      Object.defineProperty(Platform, "OS", {
        configurable: true,
        value: previousPlatform,
      });
    }
  });

  it("renders desktop animated content when reduced motion is off and supports a one-slide static hero", () => {
    jest.useFakeTimers();
    const previousPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    mockResponsive.isNative = false;
    mockResponsive.width = 700;
    mockResponsive.height = 800;
    mockResponsive.heroHeightVh = 70;
    mockReducedMotion = false;

    try {
      const { getByTestId, queryByLabelText, unmount } = render(
        <HeroCarousel
          events={EVENT_FIXTURES.slice(0, 1)}
          onBook={jest.fn()}
          onSeeAll={jest.fn()}
          autoPlay={false}
        />,
      );
      expect(getByTestId("v2-hero")).toBeTruthy();
      expect(getByTestId("hero-book")).toBeTruthy();
      expect(queryByLabelText("Slide 1")).toBeNull();
      act(() => jest.advanceTimersByTime(2500));
      unmount();
    } finally {
      Object.defineProperty(Platform, "OS", {
        configurable: true,
        value: previousPlatform,
      });
    }
  });

  it("returns no hero when there are no events", () => {
    const { queryByTestId } = render(
      <HeroCarousel events={[]} onBook={jest.fn()} onSeeAll={jest.fn()} />,
    );
    expect(queryByTestId("v2-hero")).toBeNull();
  });

  it("restarts the autoplay interval after a manual selection", () => {
    jest.useFakeTimers();
    const previousPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    mockResponsive.isNative = false;
    mockResponsive.width = 1280;
    mockResponsive.height = 900;
    mockResponsive.heroHeightVh = 100;
    mockReducedMotion = false;

    try {
      const { getByLabelText, getByTestId } = render(
        <HeroCarousel
          events={EVENT_FIXTURES.slice(0, 3)}
          onBook={jest.fn()}
          onSeeAll={jest.fn()}
        />,
      );

      fireEvent.press(getByLabelText("Slide 2"));
      fireEvent.press(getByLabelText("Slide 2"));
      act(() => jest.advanceTimersByTime(6000));
      expect(getByTestId("hero-book").props.accessibilityLabel).toBe(
        "Beli tiket Indie Night Vol. 9",
      );
      act(() => jest.advanceTimersByTime(1000));

      expect(getByTestId("v2-hero")).toBeTruthy();
    } finally {
      Object.defineProperty(Platform, "OS", {
        configurable: true,
        value: previousPlatform,
      });
    }
  });

  it("opens the native booking action when the hero has no venue", () => {
    mockReducedMotion = true;
    const onBook = jest.fn();
    const eventWithoutVenue = { ...EVENT_FIXTURES[0], venue: undefined };
    const { getByTestId, queryByText } = render(
      <HeroCarousel
        events={[eventWithoutVenue]}
        onBook={onBook}
        onSeeAll={jest.fn()}
        autoPlay={false}
      />,
    );

    expect(queryByText("Gelora Bung Karno, Jakarta")).toBeNull();
    fireEvent.press(getByTestId("hero-book"));
    expect(onBook).toHaveBeenCalledWith(eventWithoutVenue.id);
  });
});
