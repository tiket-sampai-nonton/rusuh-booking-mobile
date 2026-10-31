/**
 * BrowseScreen — web-desktop multi-column results grid (BrowseGrid columns > 1).
 *
 * The grid is single-column on phone and multi-column on desktop web; that
 * branch only runs when useResponsive reports a wide-web viewport. We mock the
 * hook to force it and assert the grid still renders enterable cards + routes.
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
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
}));
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => ({ isWeb: true, isDesktop: true, width: 1200, gridColumns: 3, detailTwoCol: true }),
}));

// eslint-disable-next-line import/first
import { BrowseScreen } from "@presentation/screens/Browse";

function repo(events: readonly EventSummary[]): EventRepository {
  return {
    listEvents: async () => events,
    getEventDetail: async (id) => events.find((e) => e.id === id) as EventDetail,
  };
}

describe("BrowseScreen (web desktop grid)", () => {
  beforeEach(() => mockRouter.push.mockReset());

  it("renders the multi-column grid and routes on card press", async () => {
    renderWithProviders(<BrowseScreen />, { container: { eventRepository: repo(EVENT_FIXTURES) } });
    await waitFor(() => screen.getByTestId("event-card-evt-1"));
    fireEvent.press(screen.getByTestId("event-card-evt-1"));
    expect(mockRouter.push).toHaveBeenCalledWith("/events/evt-1");
  });
});
