/**
 * HomeScreen — web-desktop layout branches.
 *
 * The desktop container (max-width centered), the multi-column CardGrid, the
 * nav center links (web > 720px), and the hero scroll-parallax handler only
 * run on RN Web at a wide viewport. We mock the useResponsive hook to report a
 * wide-web viewport so HomeScreen takes all those branches, without disturbing
 * react-native's native-module getters.
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn() };
jest.mock("expo-router", () => ({ useRouter: () => mockRouter }));

// This suite exercises Home navigation/layout; animation details are covered
// by the carousel and modal component suites.
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => true };
});
jest.mock("@presentation/components/design-system/HeroCarousel", () => {
  const ReactMock = require("react");
  const { View } = require("react-native");
  return {
    HeroCarousel: () =>
      ReactMock.createElement(View, { testID: "hero-carousel" }),
  };
});
jest.mock("@presentation/components/auth/LoginModal", () => {
  const ReactMock = require("react");
  const { Pressable, Text, TextInput, View } = require("react-native");
  return {
    LoginModal: ({
      visible,
      onClose,
    }: {
      visible: boolean;
      onClose: () => void;
    }) =>
      visible
        ? ReactMock.createElement(
            View,
            { testID: "login-card" },
            ReactMock.createElement(TextInput, { testID: "login-email-input" }),
            ReactMock.createElement(
              Pressable,
              { onPress: onClose, testID: "login-close" },
              ReactMock.createElement(Text, null, "Tutup"),
            ),
          )
        : null,
  };
});

// Force the desktop-web layout for HomeScreen (all isDesktop branches).
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => ({
    isWeb: true,
    isDesktop: true,
    width: 1200,
    gridColumns: 3,
    detailTwoCol: true,
  }),
}));

// eslint-disable-next-line import/first
import { HomeScreen } from "@presentation/screens/Home";

function repoReturning(events: readonly EventSummary[]): EventRepository {
  return {
    listEvents: async () => events,
    getEventDetail: async (id) =>
      events.find((e) => e.id === id) as EventDetail,
  };
}

describe("HomeScreen (web desktop)", () => {
  beforeEach(() => mockRouter.push.mockReset());

  it("renders the guest desktop nav + multi-column grid and still navigates", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // Desktop navigation follows the guest menu: Beranda and Browse.
    await waitFor(() => screen.getByTestId("nav-home"));
    expect(screen.getByTestId("nav-browse")).toBeTruthy();
    // : Multi-column CardGrid uses v2-event-card-<id> testIDs
    fireEvent.press(screen.getByTestId("v2-event-card-evt-1"));
    expect(mockRouter.push).toHaveBeenCalledWith("/events/evt-1");
    // Drive the scroll handler (hero parallax) — covers the onScroll path.
    fireEvent.scroll(screen.getByTestId("home-scroll"), {
      nativeEvent: {
        contentOffset: { y: 120 },
        contentSize: { height: 2000, width: 1200 },
        layoutMeasurement: { height: 900, width: 1200 },
      },
    });
  });

  it("'Filter Event' opens the filter popup (does NOT navigate)", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // : wait for filter button (testID="filter-btn")
    await waitFor(() => screen.getByTestId("filter-btn"));
    fireEvent.press(screen.getByTestId("filter-btn"));
    // The popup appears; no navigation yet (prototype opens a dialog).
    expect(screen.getByTestId("filter-modal")).toBeTruthy();
    expect(mockRouter.push).not.toHaveBeenCalled();
    // Apply → /browse WITH category, time, and sort query params.
    fireEvent.press(screen.getByTestId("filter-apply"));
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringMatching(/^\/browse\?.*category=/),
    );
  });

  it("'Masuk / Daftar' opens the login modal (does NOT navigate)", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // : header CTA is testID="header-cta"
    await waitFor(() => screen.getByTestId("header-cta"));
    fireEvent.press(screen.getByTestId("header-cta"));
    //  LoginModal renders the email step: card + input.
    expect(screen.getByTestId("login-card")).toBeTruthy();
    expect(screen.getByTestId("login-email-input")).toBeTruthy();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("guest desktop navigation routes to Browse and keeps Beranda on Home", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    await waitFor(() => screen.getByTestId("nav-home"));
    fireEvent.press(screen.getByTestId("nav-home"));
    expect(mockRouter.push).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId("nav-browse"));
    expect(mockRouter.push).toHaveBeenCalledWith("/browse");
  });
});
