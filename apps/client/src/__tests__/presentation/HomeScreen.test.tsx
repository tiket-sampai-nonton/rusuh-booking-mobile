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
import { HomeScreen } from "@presentation/screens/Events/HomeScreen";

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
    expect(screen.getByTestId("home-loading")).toBeTruthy();
    // Settle the query so the suite leaves no pending work behind.
    release([]);
    await waitFor(() =>
      expect(screen.queryByTestId("home-loading")).toBeNull(),
    );
  });

  it("renders upcoming + history sections from the fixtures", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("section-upcoming")).toBeTruthy(),
    );
    expect(screen.getByText("Konser Terdekat")).toBeTruthy();
    expect(screen.getByText("History Event")).toBeTruthy();
    // evt-5 is CLOSED (history); evt-1 is AVAILABLE (upcoming).
    expect(screen.getByText("Rusuh Fest 2026")).toBeTruthy();
    expect(screen.getByText("Jazz in the Park 2025")).toBeTruthy();
  });

  it("navigates to the event detail on an enterable card press", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    await waitFor(() => screen.getByTestId("event-card-evt-1"));
    fireEvent.press(screen.getByTestId("event-card-evt-1"));
    expect(mockRouter.push).toHaveBeenCalledWith("/events/evt-1");
  });

  it("renders the photo hero and books the featured event + sees all", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning(EVENT_FIXTURES) },
    });
    await waitFor(() => screen.getByTestId("home-hero"));
    // "Lihat Semua" is a no-op scroll affordance (catalog is already below).
    fireEvent.press(screen.getByTestId("hero-see-all"));
    // Book the featured (first upcoming) event → routes to its detail.
    fireEvent.press(screen.getByTestId("hero-book"));
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringMatching(/^\/events\//),
    );
  });

  it("renders empty states when the catalog is empty", async () => {
    renderWithProviders(<HomeScreen />, {
      container: { eventRepository: repoReturning([]) },
    });
    await waitFor(() =>
      expect(screen.getByText("Belum ada event mendatang.")).toBeTruthy(),
    );
    expect(screen.getByText("Belum ada event yang berlalu.")).toBeTruthy();
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
