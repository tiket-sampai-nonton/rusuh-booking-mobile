/**
 * BrowseScreen — the filtered results page the Home filter popup redirects to.
 *
 * Verifies it reads genre/time/sort from the URL, filters the catalog
 * client-side, renders the count line + event grid, navigates to a detail on
 * card press, opens the refine popup, resets, and shows an empty state.
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn(), replace: jest.fn() };
// Mutable params so each test can set the URL query it exercises.
const mockParams: { genre?: string; time?: string; sort?: string } = {};
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));

// eslint-disable-next-line import/first
import { BrowseScreen } from "@presentation/screens/Browse";

function repo(events: readonly EventSummary[]): EventRepository {
  return {
    listEvents: async () => events,
    getEventDetail: async (id) => events.find((e) => e.id === id) as EventDetail,
  };
}

function reset(): void {
  mockRouter.push.mockReset();
  mockRouter.replace.mockReset();
  mockParams.genre = undefined;
  mockParams.time = undefined;
  mockParams.sort = undefined;
}

describe("BrowseScreen", () => {
  beforeEach(reset);

  it("lists the upcoming events with a count line (no filter)", async () => {
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: repo(EVENT_FIXTURES) } });
    // Wait for the count line to leave "Memuat…" (data resolved). The Text's
    // children is an interpolated array, so assert on the joined content.
    await waitFor(() => {
      const txt = screen.getByTestId("browse-count").props.children;
      expect(([] as unknown[]).concat(txt).join("")).toContain("event ditemukan");
    });
    // Default chips present (Genre: Semua etc.) and no reset when unfiltered.
    expect(screen.getByText("Semua")).toBeTruthy();
    expect(screen.queryByTestId("browse-reset")).toBeNull();
  });

  it("navigates to the detail when a result card is pressed", async () => {
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: repo(EVENT_FIXTURES) } });
    await waitFor(() => screen.getByTestId("event-card-evt-1"));
    fireEvent.press(screen.getByTestId("event-card-evt-1"));
    expect(mockRouter.push).toHaveBeenCalledWith("/events/evt-1");
  });

  it("reads the URL filter and shows a Reset button when filtered", async () => {
    mockParams.genre = "Jazz";
    mockParams.time = "month";
    mockParams.sort = "furthest";
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: repo(EVENT_FIXTURES) } });
    await waitFor(() => screen.getByTestId("browse-count"));
    // Chips reflect the URL query.
    expect(screen.getByText("Jazz")).toBeTruthy();
    expect(screen.getByText("Bulan ini")).toBeTruthy();
    expect(screen.getByText("Terjauh")).toBeTruthy();
    // Reset appears + re-navigates to a clean /browse.
    fireEvent.press(screen.getByTestId("browse-reset"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/browse");
  });

  it("opens the refine popup and re-navigates with new params on Apply", async () => {
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: repo(EVENT_FIXTURES) } });
    await waitFor(() => screen.getByTestId("browse-refine"));
    fireEvent.press(screen.getByTestId("browse-refine"));
    expect(screen.getByTestId("filter-modal")).toBeTruthy();
    fireEvent.press(screen.getByTestId("filter-genre-Rock"));
    fireEvent.press(screen.getByTestId("filter-apply"));
    expect(mockRouter.replace).toHaveBeenCalledWith(
      expect.stringMatching(/^\/browse\?.*genre=Rock/),
    );
  });

  it("shows the empty state when no event matches the genre", async () => {
    mockParams.genre = "Orkestra"; // no fixture name contains this
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: repo(EVENT_FIXTURES) } });
    await waitFor(() => expect(screen.getByTestId("browse-empty")).toBeTruthy());
    expect(screen.getByText("Tidak ada event yang cocok")).toBeTruthy();
  });

  it("routes back to home from the top bar", async () => {
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: repo(EVENT_FIXTURES) } });
    await waitFor(() => screen.getByTestId("browse-home"));
    fireEvent.press(screen.getByTestId("browse-home"));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("RBT-090: back + refine controls meet the 44pt touch-target floor", async () => {
    mockParams.genre = "Jazz"; // filtered → reset chip also present
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: repo(EVENT_FIXTURES) } });
    await waitFor(() => screen.getByTestId("browse-refine"));
    // Back link grows its touch box to ≥44pt via minHeight (label unchanged).
    const back = screen.getByTestId("browse-home");
    const backStyle = Array.isArray(back.props.style)
      ? Object.assign({}, ...back.props.style)
      : back.props.style;
    expect(backStyle.minHeight).toBe(44);
    // Compact chips keep their pixel size but widen the hit region to 44pt.
    const refine = screen.getByTestId("browse-refine");
    expect(refine.props.hitSlop).toEqual({ left: 0, right: 0, top: 6, bottom: 6 });
    expect(screen.getByTestId("browse-reset").props.hitSlop).toEqual({
      left: 0,
      right: 0,
      top: 6,
      bottom: 6,
    });
  });

  it("shows the loading state before the catalog resolves", () => {
    const pending: EventRepository = {
      listEvents: () => new Promise(() => {}),
      getEventDetail: async () => ({}) as EventDetail,
    };
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: pending } });
    expect(screen.getByTestId("browse-loading")).toBeTruthy();
  });

  it("normalizes tampered/unknown URL params back to safe defaults", async () => {
    mockParams.genre = "'; DROP TABLE";
    mockParams.time = "garbage";
    mockParams.sort = "nope";
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: repo(EVENT_FIXTURES) } });
    await waitFor(() => screen.getByTestId("browse-count"));
    // Unknown values fall back to Semua / Semua waktu / Terdekat (no empty state
    // from a bad URL), and no Reset button (treated as unfiltered defaults).
    expect(screen.getByText("Semua")).toBeTruthy();
    expect(screen.queryByTestId("browse-reset")).toBeNull();
  });
});

