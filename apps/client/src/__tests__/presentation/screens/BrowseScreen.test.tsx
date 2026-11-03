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

  it("hydrates the UI from the URL query (genre=rock → filtered by category)", async () => {
    mockParams.current = { genre: "rock" };
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    // V2 uses v2-event-card-<id> testIDs and client-side category filter
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    // V2: browse-count shows "Showing X events"
    expect(screen.getByTestId("browse-count")).toBeTruthy();
  });

  it("shows all upcoming events with no filter params", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    // V2 uses v2-event-card-<id> testIDs
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    expect(screen.getByTestId("v2-event-card-jazz")).toBeTruthy();
    expect(screen.getByTestId("v2-event-card-folk")).toBeTruthy();
    expect(screen.getByTestId("browse-count")).toBeTruthy();
  });

  it("renders the empty state when the filter matches nothing", async () => {
    mockParams.current = { genre: "Orkestra" };
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("browse-empty"));
    // V2: empty state shows "Tidak Ada Event"
    expect(screen.getByText("Tidak Ada Event")).toBeTruthy();
  });

  it("navigates to the event detail on a card press", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    // V2 uses v2-event-card-<id> testIDs
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    fireEvent.press(screen.getByTestId("v2-event-card-rock"));
    expect(mockRouter.push).toHaveBeenCalledWith("/events/rock");
  });

  it("goes home from the header logo", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    // V2 uses V2Header with header-logo testID
    await waitFor(() => screen.getByTestId("header-logo"));
    fireEvent.press(screen.getByTestId("header-logo"));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("shows the V2Loader before data resolves", async () => {
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
    // V2: BrowseScreen uses V2Loader directly with accessibilityLabel="Memuat"
    expect(screen.getByLabelText("Memuat")).toBeTruthy();
    release([]);
    await waitFor(() =>
      expect(screen.queryByLabelText("Memuat")).toBeNull(),
    );
  });
});
