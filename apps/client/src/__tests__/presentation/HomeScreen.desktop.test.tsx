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
    getEventDetail: async (id) => events.find((e) => e.id === id) as EventDetail,
  };
}

describe("HomeScreen (web desktop)", () => {
  beforeEach(() => mockRouter.push.mockReset());

  it("renders desktop nav links + multi-column grid and still navigates", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // V2: wait for header with nav links (Konser etc.) to be visible
    await waitFor(() => screen.getByTestId("nav-konser"));
    // Nav center link only shown on web > 768px (showNavLinks branch).
    // V2 uses genre labels: verify nav link exists by testID (label may appear elsewhere too)
    expect(screen.getByTestId("nav-konser")).toBeTruthy();
    expect(screen.getByTestId("nav-festival")).toBeTruthy();
    // V2: Multi-column CardGrid uses v2-event-card-<id> testIDs
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
    // V2: wait for filter button (testID="filter-btn")
    await waitFor(() => screen.getByTestId("filter-btn"));
    fireEvent.press(screen.getByTestId("filter-btn"));
    // The popup appears; no navigation yet (prototype opens a dialog).
    expect(screen.getByTestId("filter-modal")).toBeTruthy();
    expect(mockRouter.push).not.toHaveBeenCalled();
    // Apply → /browse WITH the chosen params (prototype submit → browse.html?...).
    fireEvent.press(screen.getByTestId("filter-apply"));
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringMatching(/^\/browse\?.*genre=/),
    );
  });

  it("'Masuk / Daftar' opens the login modal (does NOT navigate)", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // V2: header CTA is testID="header-cta"
    await waitFor(() => screen.getByTestId("header-cta"));
    fireEvent.press(screen.getByTestId("header-cta"));
    // V2 LoginModal renders the email step: card + input.
    expect(screen.getByTestId("login-card")).toBeTruthy();
    expect(screen.getByTestId("login-email-input")).toBeTruthy();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("nav Konser / Festival / Olahraga / Theater scroll in-page (no navigation)", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // V2: wait for header nav links
    await waitFor(() => screen.getByTestId("nav-konser"));
    // V2: section testID is section-events (not section-upcoming)
    const feat = screen.queryByTestId("section-events");
    if (feat) {
      fireEvent(feat, "layout", {
        nativeEvent: { layout: { x: 0, y: 800, width: 1200, height: 600 } },
      });
    }
    const hist = screen.queryByTestId("section-history");
    if (hist) {
      fireEvent(hist, "layout", {
        nativeEvent: { layout: { x: 0, y: 1400, width: 1200, height: 600 } },
      });
    }
    // V2: nav links are genre-based (Konser, Festival, etc.)
    fireEvent.press(screen.getByTestId("nav-konser"));
    fireEvent.press(screen.getByTestId("nav-festival"));
    fireEvent.press(screen.getByTestId("nav-olahraga"));
    fireEvent.press(screen.getByTestId("nav-theater"));
    // All scroll in-page; none navigate.
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
