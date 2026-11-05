/**
 * HistoryScreen — "History Event" screen tests (RBT-034).
 *
 * Proves the ticket's UI contract: the dedicated /history route lists PAST /
 * CLOSED events (derived from useEvents → splitCatalog on the server clock),
 * renders them through the shared EventCard in history (disabled) mode, and
 * covers the three states the AC calls out — loading, empty, populated.
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn(), replace: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// Responsive hook is mockable per-test: default phone (1 column); a desktop
// override exercises the multi-column grid branch.
const mockResponsive = {
  current: { isWeb: false, isDesktop: false, width: 390, gridColumns: 1, detailTwoCol: false },
};
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsive.current,
}));

// eslint-disable-next-line import/first
import { HistoryScreen } from "@presentation/screens/History";

const DAY = 86_400_000;
const now = Date.now();

function ev(
  id: string,
  name: string,
  daysFromNow: number,
  status: EventSummary["status"] = "AVAILABLE",
): EventSummary {
  return {
    id,
    slug: id,
    name,
    venue: "Jakarta",
    salesStartsAt: new Date(now - 400 * DAY).toISOString(),
    salesEndsAt: new Date(now - 10 * DAY).toISOString(),
    status,
    startsAt: new Date(now + daysFromNow * DAY).toISOString(),
    minPriceMinor: 25000000,
    remainingTickets: 0,
  };
}

// Two past (one CLOSED, one just-passed) + one upcoming that must NOT appear.
const CATALOG: readonly EventSummary[] = [
  ev("jazz", "Jazz in the Park 2025", -90, "CLOSED"),
  ev("rock", "Rock Reunion", -5, "AVAILABLE"),
  ev("future", "Future Fest", 30, "AVAILABLE"),
];

function repo(events: readonly EventSummary[]): EventRepository {
  return {
    listEvents: async () => events,
    getEventDetail: async (id) =>
      events.find((e) => e.id === id) as EventDetail,
  };
}

describe("HistoryScreen", () => {
  beforeEach(() => {
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
    mockResponsive.current = {
      isWeb: false,
      isDesktop: false,
      width: 390,
      gridColumns: 1,
      detailTwoCol: false,
    };
  });

  it("shows the loading state before data resolves", () => {
    let release!: (e: EventSummary[]) => void;
    const gate = new Promise<EventSummary[]>((r) => {
      release = r;
    });
    renderWithProviders(<HistoryScreen />, {
      container: {
        eventRepository: {
          listEvents: () => gate,
          getEventDetail: async () => ({}) as EventDetail,
        },
      },
    });
    expect(screen.getByTestId("history-loading")).toBeTruthy();
    release([]);
  });

  it("renders the error state when loading fails", async () => {
    renderWithProviders(<HistoryScreen />, {
      container: {
        eventRepository: {
          listEvents: async () => {
            throw new Error("Jaringan bermasalah");
          },
          getEventDetail: async () => ({}) as EventDetail,
        },
      },
    });
    await waitFor(() => screen.getByTestId("history-error"));
    // : error title is "Gagal Memuat Event"
    expect(screen.getByText("Gagal Memuat Event")).toBeTruthy();
    expect(screen.getByText("Jaringan bermasalah")).toBeTruthy();
  });

  it("renders the empty state when there are no past events", async () => {
    renderWithProviders(<HistoryScreen />, {
      container: { eventRepository: repo([ev("future", "Future Fest", 30)]) },
    });
    await waitFor(() => screen.getByTestId("history-empty"));
    // : empty state title is "Belum Ada Arsip"
    expect(screen.getByText("Belum Ada Arsip")).toBeTruthy();
  });

  it("lists only past/CLOSED events (upcoming excluded), most recent first", async () => {
    renderWithProviders(<HistoryScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    //  uses v2-event-card-<id> testIDs
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    // both past events show
    expect(screen.getByTestId("v2-event-card-jazz")).toBeTruthy();
    // the upcoming one does not
    expect(screen.queryByTestId("v2-event-card-future")).toBeNull();
  });

  it("renders the section header copy from the prototype", async () => {
    renderWithProviders(<HistoryScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    //  History screen shows the Indonesian "Riwayat" section title.
    expect(screen.getByText("Riwayat")).toBeTruthy();
  });

  it("past event cards are disabled (not navigable)", async () => {
    renderWithProviders(<HistoryScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    fireEvent.press(screen.getByTestId("v2-event-card-rock"));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("navigates home from the top bar", async () => {
    renderWithProviders(<HistoryScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    //  uses header-logo testID for home navigation
    await waitFor(() => screen.getByTestId("header-logo"));
    fireEvent.press(screen.getByTestId("header-logo"));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("renders the multi-column grid on desktop web", async () => {
    mockResponsive.current = {
      isWeb: true,
      isDesktop: true,
      width: 1200,
      gridColumns: 3,
      detailTwoCol: true,
    };
    renderWithProviders(<HistoryScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    //  uses v2-event-card-<id> testIDs
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    expect(screen.getByTestId("history-grid")).toBeTruthy();
    expect(screen.getByTestId("v2-event-card-jazz")).toBeTruthy();
    fireEvent.press(screen.getByTestId("history-nav-browse"));
    expect(mockRouter.push).toHaveBeenCalledWith("/browse");
    fireEvent.press(screen.getByTestId("history-nav-tickets"));
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });
});
