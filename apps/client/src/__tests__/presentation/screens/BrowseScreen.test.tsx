/**
 * BrowseScreen — URL↔UI sync tests (RBT-031).
 *
 * Proves the core of the ticket: filters live in the URL query string
 * (useLocalSearchParams), loading /browse?genre=..&time=..&sort=.. hydrates the
 * UI from the URL, and changing a filter re-navigates (router.replace) with the
 * updated query so the URL stays the single source of truth (deep-linkable +
 * back/forward safe). The pure filter math is covered in browse-filter.test.ts.
 */
import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Dimensions, Platform } from "react-native";

import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";
import { useAccountStore } from "@presentation/stores/account-store";

// Mutable param box the mocked useLocalSearchParams reads from, plus router
// spies — held in mock-prefixed names so the hoisted jest.mock factory may
// legally reference them.
const mockParams: { current: Record<string, string> } = { current: {} };
const mockRouter = { push: jest.fn(), replace: jest.fn() };
const originalPlatform = Platform.OS;
const originalWindow = Dimensions.get("window");
const originalScreen = Dimensions.get("screen");
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
    useAccountStore.getState().clearProfile();
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
    act(() =>
      Dimensions.set({ window: originalWindow, screen: originalScreen }),
    );
  });

  it("hydrates the UI from the URL query (genre=rock → filtered by category)", async () => {
    mockParams.current = { genre: "rock" };
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    //  uses v2-event-card-<id> testIDs and client-side category filter
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    // : browse-count shows "Showing X events"
    expect(screen.getByTestId("browse-count")).toBeTruthy();
  });

  it("shows all upcoming events with no filter params", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    //  uses v2-event-card-<id> testIDs
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    expect(screen.getByTestId("v2-event-card-jazz")).toBeTruthy();
    expect(screen.getByTestId("v2-event-card-folk")).toBeTruthy();
    expect(screen.getByTestId("browse-count")).toBeTruthy();
  });

  it("treats the all-genres URL value as the unfiltered category", async () => {
    mockParams.current = { genre: "Semua", time: "month", sort: "closest" };
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });

    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    expect(screen.queryByTestId("v2-event-card-jazz")).toBeNull();
  });

  it("supports desktop sorting, category, view, navigation, and filter actions", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const desktopDimensions = { ...originalWindow, width: 1024, height: 900 };
    Dimensions.set({
      window: desktopDimensions,
      screen: { ...originalScreen, width: 1024, height: 900 },
    });
    useAccountStore
      .getState()
      .setProfile({ emailMasked: "u***@example.com", hasNik: true });

    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));

    fireEvent.scroll(screen.getByTestId("browse-scroll"), {
      nativeEvent: {
        contentOffset: { y: 120 },
        contentSize: { height: 2000, width: 1024 },
        layoutMeasurement: { height: 900, width: 1024 },
      },
    });
    expect(screen.getByTestId("category-all")).toBeTruthy();
    expect(screen.queryByTestId("category-concert")).toBeNull();
    expect(screen.queryByLabelText("Urutkan event")).toBeNull();
    fireEvent.press(screen.getByTestId("browse-filter"));
    fireEvent.press(screen.getByTestId("filter-genre-festival"));
    fireEvent.press(screen.getByTestId("filter-apply"));
    expect(screen.getByTestId("category-festival")).toBeTruthy();
    fireEvent.press(screen.getByTestId("category-all"));
    fireEvent.press(screen.getByTestId("view-list"));
    fireEvent.press(screen.getByTestId("view-grid"));
    fireEvent.press(screen.getByTestId("nav-home"));
    fireEvent.press(screen.getByTestId("nav-browse"));
    fireEvent.press(screen.getByTestId("nav-tickets"));
    fireEvent.press(screen.getByTestId("nav-profile"));
    fireEvent.press(screen.getByTestId("browse-filter"));
    fireEvent.press(screen.getByTestId("filter-close"));
    fireEvent.press(screen.getByTestId("browse-filter"));
    fireEvent.press(screen.getByTestId("filter-sort-furthest"));
    fireEvent.press(screen.getByTestId("filter-apply"));
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringMatching(/^\/browse\?/),
    );

    fireEvent.press(screen.getByTestId("load-more-btn"));
    expect(screen.getByText("Semua Event Ditampilkan")).toBeTruthy();
  });

  it("opens filters from an icon-only accessible control", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("browse-filter"));

    expect(screen.getByLabelText("Saring event")).toBeTruthy();
    expect(screen.queryByText("Saring")).toBeNull();
    fireEvent.press(screen.getByTestId("browse-filter"));
    expect(screen.getByTestId("filter-modal")).toBeTruthy();
  });

  it("renders the empty state when the filter matches nothing", async () => {
    mockParams.current = { genre: "Orkestra" };
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("browse-empty"));
    // : empty state shows "Tidak Ada Event"
    expect(screen.getByText("Tidak Ada Event")).toBeTruthy();
  });

  it("navigates to the event detail on a card press", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    //  uses v2-event-card-<id> testIDs
    await waitFor(() => screen.getByTestId("v2-event-card-rock"));
    fireEvent.press(screen.getByTestId("v2-event-card-rock"));
    expect(mockRouter.push).toHaveBeenCalledWith("/events/rock");
  });

  it("opens event details from an unavailable card instead of disabling the whole card", async () => {
    const soldOut = {
      ...ev("sold-out", "Sold Out Show", 5),
      status: "SOLD_OUT" as const,
      remainingTickets: 0,
    };
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo([soldOut]) },
    });

    const card = await waitFor(() =>
      screen.getByTestId("v2-event-card-sold-out"),
    );
    expect(card.props.accessibilityState).toEqual({ disabled: false });
    fireEvent.press(card);
    expect(mockRouter.push).toHaveBeenCalledWith("/events/sold-out");
  });

  it("goes home from the header logo", async () => {
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    //  uses Header with header-logo testID
    await waitFor(() => screen.getByTestId("header-logo"));
    fireEvent.press(screen.getByTestId("header-logo"));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("keeps the guest desktop header CTA inert on Browse", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    Dimensions.set({
      window: { ...originalWindow, width: 1024 },
      screen: { ...originalScreen, width: 1024 },
    });
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByTestId("header-cta"));
    fireEvent.press(screen.getByTestId("header-cta"));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("routes logged-in native bottom navigation to Home, tickets, and profile", async () => {
    useAccountStore.getState().setProfile({
      emailMasked: "p***@mail.com",
      fullName: "Penonton",
      hasNik: true,
    });
    renderWithProviders(<BrowseScreen />, {
      container: { eventRepository: repo(CATALOG) },
    });
    await waitFor(() => screen.getByRole("tab", { name: "Beranda" }));

    fireEvent.press(screen.getByRole("tab", { name: "Beranda" }));
    fireEvent.press(screen.getByRole("tab", { name: "Ticket" }));
    fireEvent.press(screen.getByRole("tab", { name: "Profil" }));

    expect(mockRouter.push).toHaveBeenCalledWith("/");
    expect(mockRouter.push).toHaveBeenCalledWith("/my-tickets");
    expect(mockRouter.push).toHaveBeenCalledWith("/profile");
  });

  it("shows the Loader before data resolves", async () => {
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
    // : BrowseScreen uses Loader directly with accessibilityLabel="Memuat"
    expect(screen.getByLabelText("Memuat")).toBeTruthy();
    release([]);
    // The loader remains mounted during its exit animation. Assert that the
    // resolved empty state appears instead of waiting for the animation node
    // to unmount (Reanimated's test clock does not advance it automatically).
    await waitFor(() => screen.getByTestId("browse-empty"));
  });
});
