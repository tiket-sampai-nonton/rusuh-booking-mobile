/**
 * BrowseScreen — URL↔UI sync tests (RBT-031).
 *
 * Proves the core of the ticket: filters live in the URL query string
 * (useLocalSearchParams), loading /browse?genre=..&time=..&sort=.. hydrates the
 * UI from the URL, and changing a filter re-navigates (router.replace) with the
 * updated query so the URL stays the single source of truth (deep-linkable +
 * back/forward safe). The pure filter math is covered in browse-filter.test.ts.
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

// Mutable param box the mocked useLocalSearchParams reads from, plus router
// spies — held in mock-prefixed names so the hoisted jest.mock factory may
// legally reference them.
const mockParams: { current: Record<string, string> } = { current: {} };
const mockRouter = { push: jest.fn(), replace: jest.fn() };
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockParams.current,
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line import/first
import { BrowseScreen } from "@presentation/screens/Browse";

const DAY = 86_400_000;
const now = Date.now();

function ev(id: string, name: string, daysFromNow: number): EventSummary {
  return {
    id,
    slug: id,
    name,
    venue: "Jakarta",
    salesStartsAt: new Date(now).toISOString(),
    salesEndsAt: new Date(now + 365 * DAY).toISOString(),
    status: "AVAILABLE",
    startsAt: new Date(now + daysFromNow * DAY).toISOString(),
    minPriceMinor: 30000000,
    remainingTickets: 300,
  };
}

const CATALOG: readonly EventSummary[] = [
  ev("rock", "Rock Fest Jakarta", 3),
  ev("jazz", "Jazz in the Park", 40),
  ev("folk", "Folk Night", 120),
];

function repo(events: readonly EventSummary[]): EventRepository {
  return {
    listEvents: async () => events,
    getEventDetail: async (id) =>
      events.find((e) => e.id === id) as EventDetail,
  };
}

describe("BrowseScreen — URL-driven filters", () => {
  beforeEach(() => {
    mockParams.current = {};
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
  });

  it("hydrates the UI from the URL query (genre=rock → only Rock shows)", async () => {
    mockParams.current = { genre: "rock" };
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("event-card-rock"));
    expect(screen.queryByTestId("event-card-jazz")).toBeNull();
    expect(screen.getByTestId("browse-count")).toHaveTextContent(
      "1 event ditemukan",
    );
    // The active-filter chip reflects the URL genre (canonicalized).
    expect(screen.getByText("Rock")).toBeTruthy();
  });

  it("shows all upcoming events with no filter params", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("event-card-rock"));
    expect(screen.getByTestId("event-card-jazz")).toBeTruthy();
    expect(screen.getByTestId("event-card-folk")).toBeTruthy();
    expect(screen.getByTestId("browse-count")).toHaveTextContent(
      "3 event ditemukan",
    );
  });

  it("renders the empty state when the filter matches nothing", async () => {
    mockParams.current = { genre: "Orkestra" };
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("browse-empty"));
    expect(screen.getByText("Tidak ada event yang cocok")).toBeTruthy();
  });

  it("re-navigates with the new query when a filter is applied", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("event-card-rock"));
    // Open the refine modal and apply a genre.
    fireEvent.press(screen.getByTestId("browse-refine"));
    fireEvent.press(screen.getByTestId("filter-genre-Rock"));
    fireEvent.press(screen.getByTestId("filter-apply"));
    expect(mockRouter.replace).toHaveBeenCalledWith(
      expect.stringContaining("/browse?"),
    );
    expect(mockRouter.replace).toHaveBeenCalledWith(
      expect.stringContaining("genre=Rock"),
    );
  });

  it("reset navigates back to the unfiltered /browse", async () => {
    mockParams.current = { genre: "rock" };
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("browse-reset"));
    fireEvent.press(screen.getByTestId("browse-reset"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/browse");
  });

  it("navigates to the event detail on a card press", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("event-card-rock"));
    fireEvent.press(screen.getByTestId("event-card-rock"));
    expect(mockRouter.push).toHaveBeenCalledWith("/events/rock");
  });

  it("goes home from the top bar", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("browse-home"));
    fireEvent.press(screen.getByTestId("browse-home"));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("shows the loading state before data resolves", async () => {
    let release!: (e: EventSummary[]) => void;
    const gate = new Promise<EventSummary[]>((r) => {
      release = r;
    });
    renderWithProviders(<BrowseScreen />, {
      container: {
        eventRepository: {
          listEvents: () => gate,
          getEventDetail: async () => ({}) as EventDetail,
        },
      },
    });
    expect(screen.getByTestId("browse-loading")).toBeTruthy();
    release([]);
    await waitFor(() =>
      expect(screen.queryByTestId("browse-loading")).toBeNull(),
    );
  });
});
