import { screen, waitFor } from "@testing-library/react-native";
import { Animated } from "react-native";

import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

// Dynamic routes read params via expo-router's useLocalSearchParams; stub it so
// the route bodies execute under jest without a navigation container. The Home
// route (RBT-030) now renders the real HomeScreen, which also calls useRouter —
// stub both.
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ eventId: "evt-1" }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => true };
});

// eslint-disable-next-line import/first
import HomeScreen from "../../app/(public)/index";
// eslint-disable-next-line import/first
import BrowseScreen from "../../app/(public)/browse";
// eslint-disable-next-line import/first
import HistoryScreen from "../../app/(public)/history";
// eslint-disable-next-line import/first
import MyTicketsScreen from "../../app/(public)/my-tickets";
// eslint-disable-next-line import/first
import ProfileScreen from "../../app/(public)/profile";
// eslint-disable-next-line import/first
import EventDetailScreen from "../../app/(public)/events/[eventId]";

const completedAnimation = {
  start: (callback?: (result: { finished: boolean }) => void) =>
    callback?.({ finished: true }),
  stop: () => undefined,
  reset: () => undefined,
};

describe("(public) routes", () => {
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
    jest
      .spyOn(Animated, "spring")
      .mockReturnValue(
        completedAnimation as ReturnType<typeof Animated.spring>,
      );
    jest
      .spyOn(Animated, "sequence")
      .mockReturnValue(
        completedAnimation as ReturnType<typeof Animated.sequence>,
      );
    jest
      .spyOn(Animated, "loop")
      .mockReturnValue(completedAnimation as ReturnType<typeof Animated.loop>);
  });

  afterEach(() => jest.restoreAllMocks());

  it("export component functions", () => {
    expect(typeof HomeScreen).toBe("function");
    expect(typeof BrowseScreen).toBe("function");
    expect(typeof HistoryScreen).toBe("function");
    expect(typeof MyTicketsScreen).toBe("function");
    expect(typeof ProfileScreen).toBe("function");
    expect(typeof EventDetailScreen).toBe("function");
  });

  it("renders the Home screen (RBT-030: real event catalog, not a placeholder)", async () => {
    // The Home route wires the mock catalog through the provider stack; the
    // section header proves the real screen mounts.
    // Native and web share the same Indonesian Home section title.
    renderWithProviders(<HomeScreen />);
    await waitFor(() => expect(screen.getByText("Daftar Event")).toBeTruthy());
    expect(screen.queryByTestId("home-mobile-stats")).toBeNull();
  });

  it("renders the Browse screen (RBT-031: real URL-driven results, not a placeholder)", async () => {
    // The Browse route wires the mock catalog through the provider stack and
    // reads filters from the URL.
    // On native: category filter chips are a horizontal scroll (no "Categories"
    // header text — that's desktop-only). Check the filter chip and result count.
    renderWithProviders(<BrowseScreen />);
    await waitFor(() =>
      expect(screen.getByTestId("category-all")).toBeTruthy(),
    );
    expect(screen.getByTestId("browse-count")).toBeTruthy();
  });

  it("renders the History screen (RBT-034: real past-event list, not a placeholder)", async () => {
    // The History route wires the mock catalog through the provider stack and
    // derives past/CLOSED events;  shows "Arsip Event" header.
    renderWithProviders(<HistoryScreen />);
    await waitFor(() => expect(screen.getByText("Arsip Event")).toBeTruthy());
  });

  it("renders the Event Detail screen for the route param (RBT-032: real detail, not a placeholder)", async () => {
    // The route reads eventId=evt-1 (stubbed) and wires the mock event through
    // the provider stack; the resolved event name proves the real screen mounts.
    renderWithProviders(<EventDetailScreen />);
    await waitFor(() =>
      expect(
        screen.getAllByText("Rusuh Fest 2026").length,
      ).toBeGreaterThanOrEqual(1),
    );
  });
});
