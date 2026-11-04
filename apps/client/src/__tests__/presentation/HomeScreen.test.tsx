import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

// Hold the router push spy in a mock-prefixed object so the jest.mock factory
// (hoisted above imports) may legally reference it.
const mockRouter = { push: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
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

describe("HomeScreen", () => {
  beforeEach(() => mockRouter.push.mockReset());

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
    // V2: Loading uses V2Loader with visible prop which renders letters.
    // Check for the first letter "R" of "RUSUH" to verify loading state.
    expect(screen.queryAllByText("R").length).toBeGreaterThanOrEqual(1);
    // Settle the query so the suite leaves no pending work behind.
    release([]);
    await waitFor(() =>
      // V2: Once loaded, letters disappear and section-events appears
      expect(screen.queryByTestId("section-events")).toBeTruthy(),
    );
  });

  it("renders the mobile upcoming section without the removed stats banner", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // V2: testID is section-events instead of section-upcoming
    await waitFor(() =>
      expect(screen.getByTestId("section-events")).toBeTruthy(),
    );
    // Native and web use the same Indonesian Home section title.
    expect(screen.getByText("Event Minggu Ini")).toBeTruthy();
    expect(screen.queryByTestId("home-mobile-stats")).toBeNull();
    // "Rusuh Fest 2026" shows in the static hero and catalog card.
    expect(screen.getAllByText("Rusuh Fest 2026").length).toBeGreaterThanOrEqual(1);
    // History is rendered on Home when the repository provides past events.
    expect(screen.getByTestId("section-history")).toBeTruthy();
    fireEvent(screen.getByTestId("section-events"), "layout", {
      nativeEvent: { layout: { x: 0, y: 760, width: 393, height: 600 } },
    });
  });

  it("navigates to the event detail on an enterable card press", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // V2: testID is v2-event-card-<id>
    await waitFor(() => screen.getByTestId("v2-event-card-evt-1"));
    fireEvent.press(screen.getByTestId("v2-event-card-evt-1"));
    expect(mockRouter.push).toHaveBeenCalledWith("/events/evt-1");
  });

  it("renders the V2 hero and books the featured event + sees all", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    // V2: testID is v2-hero instead of home-hero
    await waitFor(() => screen.getByTestId("v2-hero"));
    // Fire onLayout so the featured-section Y is measured (scroll target).
    // V2: testID is section-events instead of section-upcoming
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
  });

  it("renders empty states when the catalog is empty", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning([]) },
    });
    // V2: Only shows "Belum ada event yang cocok." for upcoming events.
    // History section is not rendered when empty (per V2 prototype).
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
