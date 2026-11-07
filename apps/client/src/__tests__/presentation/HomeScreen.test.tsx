import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";

import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";
import { useAccountStore } from "@presentation/stores/account-store";

// Hold the router push spy in a mock-prefixed object so the jest.mock factory
// (hoisted above imports) may legally reference it.
const mockRouter = { push: jest.fn(), navigate: jest.fn() };
const mockResponsive = { width: 393, height: 852 };
function mockGridColumnsForWidth(width: number): number {
  if (width > 900) return 3;
  if (width > 620) return 2;
  return 1;
}

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useFocusEffect: jest.fn(),
}));
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => {
    const { Platform } = require("react-native");
    const isWeb = Platform.OS === "web";
    const width = mockResponsive.width;
    const isDesktop = isWeb && width >= 960;
    return {
      isWeb,
      isNative: !isWeb,
      isDesktop,
      width,
      height: mockResponsive.height,
      gridColumns: mockGridColumnsForWidth(width),
      detailTwoCol: width > 820,
      headerHeight: isDesktop ? 60 : 56,
      heroHeightVh: isDesktop ? 100 : 70,
      bottomBarHeight: isWeb ? 0 : 72,
      tapTarget: 44,
    };
  },
}));
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return {
    ...actual,
    useReducedMotion: () => true,
    useAnimatedScrollHandler: (
      callback: (event: { contentOffset: { y: number } }) => void,
    ) => callback,
  };
});
jest.mock("@presentation/components/design-system/HeroCarousel", () => {
  const ReactMock = require("react");
  const { Pressable, Text, View } = require("react-native");
  return {
    HeroCarousel: ({
      events,
      onBook,
      onSeeAll,
    }: {
      events: readonly { id: string; name: string }[];
      onBook: (eventId: string) => void;
      onSeeAll: () => void;
    }) =>
      ReactMock.createElement(
        View,
        { testID: "v2-hero" },
        ReactMock.createElement(
          Pressable,
          { testID: "hero-book", onPress: () => onBook(events[0]?.id ?? "") },
          ReactMock.createElement(Text, null, "Beli Tiket"),
        ),
        ReactMock.createElement(
          Pressable,
          { testID: "hero-see-all", onPress: onSeeAll },
          ReactMock.createElement(Text, null, "Lihat Semua"),
        ),
      ),
  };
});

// eslint-disable-next-line import/first
import { HomeScreen } from "@presentation/screens/Home";

function repoReturning(events: readonly EventSummary[]): EventRepository {
  return {
    listEvents: async () => events,
    getEventDetail: async (id) =>
      events.find((e) => e.id === id) as EventDetail,
  };
}

describe("HomeScreen", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    mockRouter.push.mockReset();
    mockRouter.navigate.mockReset();
    mockResponsive.width = 393;
    mockResponsive.height = 852;
    act(() => useAccountStore.getState().clearProfile());
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  afterEach(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
    act(() => useAccountStore.getState().clearProfile());
  });

  it("shows the loading indicator before data resolves", async () => {
    // A deferred keeps the query pending so the loading branch renders; it is
    // resolved before the test ends so no promise is left open (clean exit).
    let release!: (events: EventSummary[]) => void;
    const gate = new Promise<EventSummary[]>((resolve) => {
      release = resolve;
    });
    const pending: EventRepository = {
      listEvents: () => gate,
      getEventDetail: async () => ({}) as EventDetail,
    };
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: pending },
    });
    // : Loading uses Loader with visible prop which renders letters.
    // Check for the first letter "R" of "RUSUH" to verify loading state.
    expect(screen.queryAllByText("R").length).toBeGreaterThanOrEqual(1);
    // Settle the query so the suite leaves no pending work behind.
    release([]);
    await waitFor(() =>
      // : Once loaded, letters disappear and section-events appears
      expect(screen.queryByTestId("section-events")).toBeTruthy(),
    );
  });

  it("renders the mobile upcoming section without the removed stats banner", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // : testID is section-events instead of section-upcoming
    await waitFor(() =>
      expect(screen.getByTestId("section-events")).toBeTruthy(),
    );
    // Native and web use the same Indonesian Home section title.
    expect(screen.getByText("Daftar Event")).toBeTruthy();
    expect(screen.queryByTestId("home-mobile-stats")).toBeNull();
    // "Rusuh Fest 2026" shows in the static hero and catalog card.
    expect(
      screen.getAllByText("Rusuh Fest 2026").length,
    ).toBeGreaterThanOrEqual(1);
    // History is rendered on Home when the repository provides past events.
    expect(screen.getByTestId("section-history")).toBeTruthy();
    fireEvent(screen.getByTestId("section-events"), "layout", {
      nativeEvent: { layout: { x: 0, y: 760, width: 393, height: 600 } },
    });
    fireEvent(screen.getByTestId("section-history"), "layout", {
      nativeEvent: { layout: { x: 0, y: 1420, width: 393, height: 420 } },
    });
  });

  it("navigates to the event detail on an enterable card press", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // : testID is v2-event-card-<id>
    await waitFor(() => screen.getByTestId("v2-event-card-evt-1"));
    fireEvent.press(screen.getByTestId("v2-event-card-evt-1"));
    expect(mockRouter.push).toHaveBeenCalledWith("/events/evt-1");
  });

  it("renders the  hero and books the featured event + sees all", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // : testID is v2-hero instead of home-hero
    await waitFor(() => screen.getByTestId("v2-hero"));
    // Fire onLayout so the featured-section Y is measured (scroll target).
    // : testID is section-events instead of section-upcoming
    fireEvent(screen.getByTestId("section-events"), "layout", {
      nativeEvent: { layout: { x: 0, y: 760, width: 393, height: 600 } },
    });
    // Each hero slide carries its own CTAs (prototype .slide-body).
    // On native: only hero-book (primary CTA) — no secondary hero-detail button
    // per v2-mobile prototype (HeroInfoMobile has a single CTA).
    fireEvent.press(screen.getAllByTestId("hero-book")[0]);
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringMatching(/^\/events\//),
    );
    fireEvent.press(screen.getAllByTestId("hero-see-all")[0]);
    expect(mockRouter.navigate).toHaveBeenLastCalledWith("/browse");
  });

  it("handles desktop header routes, section links, and scroll events", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    mockResponsive.width = 1280;
    useAccountStore.getState().setProfile({
      emailMasked: "p***@mail.com",
      fullName: "Penonton",
      hasNik: true,
    });
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });

    await waitFor(() => screen.getByTestId("nav-tickets"));
    fireEvent.press(screen.getByTestId("header-logo"));
    fireEvent.press(screen.getByTestId("nav-home"));
    fireEvent.press(screen.getByTestId("nav-browse"));
    fireEvent.press(screen.getByTestId("nav-tickets"));
    fireEvent.press(screen.getByTestId("nav-profile"));
    const scrollHandler = screen.getByTestId("home-scroll").props.onScroll as
      | ((event: { contentOffset: { y: number } }) => void)
      | undefined;
    act(() => scrollHandler?.({ contentOffset: { y: 240 } }));

    expect(mockRouter.navigate).toHaveBeenCalledWith("/browse");
    expect(mockRouter.navigate).toHaveBeenCalledWith("/my-tickets");
    expect(mockRouter.navigate).toHaveBeenCalledWith("/profile");
  });

  it("opens and applies the web filter sheet", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    await waitFor(() => screen.getByTestId("filter-btn"));
    fireEvent.press(screen.getByTestId("header-cta"));
    expect(screen.getByTestId("login-email-input")).toBeTruthy();
    fireEvent.press(screen.getByTestId("login-cancel"));
    fireEvent.press(screen.getByTestId("filter-btn"));
    expect(screen.getByText("Saring Event")).toBeTruthy();
    fireEvent.press(screen.getByTestId("filter-genre-festival"));
    fireEvent.press(screen.getByTestId("filter-time-month"));
    fireEvent.press(screen.getByTestId("filter-apply"));
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      "/browse?category=festival&time=month&sort=closest",
    );
  });

  it("routes logged-in native bottom navigation to browse, tickets, and profile", async () => {
    useAccountStore.getState().setProfile({
      emailMasked: "t***@mail.com",
      fullName: "Penonton",
      hasNik: true,
    });
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    await waitFor(() => screen.getByRole("tab", { name: "Ticket" }));

    fireEvent.press(screen.getByRole("tab", { name: "Jelajah" }));
    expect(mockRouter.navigate).toHaveBeenLastCalledWith("/browse");
    fireEvent.press(screen.getByRole("tab", { name: "Ticket" }));
    expect(mockRouter.navigate).toHaveBeenLastCalledWith("/my-tickets");
    fireEvent.press(screen.getByRole("tab", { name: "Profil" }));
    expect(mockRouter.navigate).toHaveBeenLastCalledWith("/profile");
  });

  it("renders empty states when the catalog is empty", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning([]) },
    });
    // : Only shows "Belum ada event yang cocok." for upcoming events.
    // History section is not rendered when empty (per  prototype).
    await waitFor(() =>
      expect(screen.getByText("Belum ada event yang cocok.")).toBeTruthy(),
    );
  });

  it("renders the error state when the catalog fetch fails", async () => {
    const failing: EventRepository = {
      listEvents: async () => {
        throw new Error("jaringan bermasalah");
      },
      getEventDetail: async () => {
        throw new Error("jaringan bermasalah");
      },
    };
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: failing },
    });
    await waitFor(() => expect(screen.getByTestId("home-error")).toBeTruthy());
    expect(screen.getByText("Gagal memuat event")).toBeTruthy();
    expect(screen.getByText("jaringan bermasalah")).toBeTruthy();
  });

  it("falls back to a generic message when the error has no message", async () => {
    const failing: EventRepository = {
      listEvents: async () => {
        throw new Error("");
      },
      getEventDetail: async () => {
        throw new Error("");
      },
    };
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: failing },
    });
    await waitFor(() => expect(screen.getByTestId("home-error")).toBeTruthy());
    expect(
      screen.getByText("Terjadi kesalahan. Silakan coba lagi."),
    ).toBeTruthy();
  });
});
