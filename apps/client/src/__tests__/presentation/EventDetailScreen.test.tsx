import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  EventDetail,
  EventRepository,
} from "@domain/repositories/event.repository";
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";
import { useSessionStore } from "@presentation/stores/session-store";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line import/first
import { EventDetailScreen } from "@presentation/screens/Events/EventDetailScreen";

const available: EventDetail = {
  id: "evt-1",
  slug: "e",
  name: "Rusuh Fest 2026",
  venue: "GBK Jakarta",
  startsAt: "2026-12-01T12:00:00.000Z",
  salesStartsAt: "2026-11-01T00:00:00.000Z",
  salesEndsAt: "2026-11-30T23:59:59.000Z",
  status: "AVAILABLE",
  minPriceMinor: 45000000,
  remainingTickets: 120,
  description: {
    longDesc: "Festival musik tahunan.",
    lineup: ["Band A", "Band B"],
    terms: "Wajib membawa KTP.",
  },
};

function repo(detail: EventDetail): EventRepository {
  return {
    listEvents: async () => [],
    getEventDetail: async () => detail,
  };
}

const queueEntry: QueueEntry = {
  queueId: "q-evt-1",
  eventId: "evt-1",
  position: 5,
  status: "WAITING",
};
function queueRepo(
  overrides: Partial<QueueRepository> = {},
): QueueRepository {
  return {
    join: async (eventId) => ({ ...queueEntry, eventId }),
    getStatus: async () => queueEntry,
    leave: async () => {},
    ...overrides,
  };
}

describe("EventDetailScreen", () => {
  beforeEach(() => {
    mockRouter.push.mockReset();
    useSessionStore.getState().reset();
  });

  it("shows a loading state before data resolves", () => {
    const pending: EventRepository = {
      listEvents: async () => [],
      getEventDetail: () => new Promise(() => {}),
    };
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: pending },
    });
    expect(screen.getByTestId("detail-loading")).toBeTruthy();
  });

  it("renders detail sections for an available event", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(available) },
    });
    await waitFor(() => expect(screen.getByText("Rusuh Fest 2026")).toBeTruthy());
    expect(screen.getByText("Festival musik tahunan.")).toBeTruthy();
    expect(screen.getByText("• Band A")).toBeTruthy();
    expect(screen.getByText("Wajib membawa KTP.")).toBeTruthy();
    expect(screen.getByText("Rp 450.000")).toBeTruthy();
    expect(screen.getByText("Sisa tiket: 120")).toBeTruthy();
    expect(screen.getByText("Masuk Antrean →")).toBeTruthy();
  });

  it("joins the queue and navigates to the waiting room on CTA press", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: {
        eventRepository: repo(available),
        queueRepository: queueRepo(),
      },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    fireEvent.press(screen.getByTestId("join-cta"));
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith("/waiting/evt-1"),
    );
    expect(useSessionStore.getState().queueId).toBe("q-evt-1");
  });

  it("disables the CTA and shows the status label for a sold-out event", async () => {
    const soldOut: EventDetail = {
      ...available,
      status: "SOLD_OUT",
      remainingTickets: 0,
    };
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: {
        eventRepository: repo(soldOut),
        queueRepository: queueRepo(),
      },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    fireEvent.press(screen.getByTestId("join-cta"));
    expect(mockRouter.push).not.toHaveBeenCalled();
    // "Sold Out" appears in the badge and on the disabled CTA.
    expect(screen.getAllByText("Sold Out").length).toBeGreaterThanOrEqual(1);
  });

  it("disables the CTA for a NOT_STARTED event", async () => {
    const notStarted: EventDetail = {
      ...available,
      status: "NOT_STARTED",
    };
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: {
        eventRepository: repo(notStarted),
        queueRepository: queueRepo(),
      },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    fireEvent.press(screen.getByTestId("join-cta"));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("shows the error state when detail fetch fails", async () => {
    const failing: EventRepository = {
      listEvents: async () => [],
      getEventDetail: async () => {
        throw new Error("");
      },
    };
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: failing },
    });
    await waitFor(() => expect(screen.getByTestId("detail-error")).toBeTruthy());
    expect(screen.getByText("Event tidak ditemukan.")).toBeTruthy();
  });

  it("surfaces a join error message", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: {
        eventRepository: repo(available),
        queueRepository: queueRepo({
          join: async () => {
            throw new Error("Tiket acara ini telah habis terjual.");
          },
        }),
      },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    fireEvent.press(screen.getByTestId("join-cta"));
    await waitFor(() =>
      expect(
        screen.getByText("Tiket acara ini telah habis terjual."),
      ).toBeTruthy(),
    );
  });

  it("shows the pending CTA label while the join is in flight, and a generic join error", async () => {
    let releaseJoin!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseJoin = resolve;
    });
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: {
        eventRepository: repo(available),
        queueRepository: queueRepo({
          join: async () => {
            await gate;
            throw new Error(""); // empty message → generic fallback branch
          },
        }),
      },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    fireEvent.press(screen.getByTestId("join-cta"));
    // Pending label while the mutation is in flight.
    await waitFor(() =>
      expect(screen.getByText("Mengambil antrean…")).toBeTruthy(),
    );
    releaseJoin();
    await waitFor(() =>
      expect(
        screen.getByText("Gagal masuk antrean. Coba lagi."),
      ).toBeTruthy(),
    );
  });

  it("renders a minimal event with no description and unpriced", async () => {
    const minimal: EventDetail = {
      id: "evt-2",
      slug: "m",
      name: "Minimal Event",
      salesStartsAt: "2026-01-01T00:00:00.000Z",
      salesEndsAt: "2026-02-01T00:00:00.000Z",
      status: "AVAILABLE",
    };
    renderWithProviders(<EventDetailScreen eventId="evt-2" />, {
      container: { eventRepository: repo(minimal) },
    });
    await waitFor(() => expect(screen.getByText("Minimal Event")).toBeTruthy());
    expect(screen.getByText("Menyusul")).toBeTruthy();
    expect(screen.queryByText(/Sisa tiket/)).toBeNull();
  });
});
