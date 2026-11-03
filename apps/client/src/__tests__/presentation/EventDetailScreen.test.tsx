import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  EventDetail,
  EventRepository,
} from "@domain/repositories/event.repository";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line import/first
import { EventDetailScreen } from "@presentation/screens/EventDetail";

const available: EventDetail = {
  id: "evt-1",
  slug: "rusuh-fest-2026",
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
    categories: [
      { code: "VIP", name: "VIP", priceMinor: 75000000, available: 10 },
      { code: "REG", name: "Reguler", priceMinor: 45000000, available: 0 },
    ],
  },
};

function repo(detail: EventDetail): EventRepository {
  return {
    listEvents: async () => [],
    getEventDetail: async () => detail,
  };
}

describe("EventDetailScreen", () => {
  beforeEach(() => mockRouter.push.mockReset());

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

  it("renders the error state when the fetch fails", async () => {
    const failing: EventRepository = {
      listEvents: async () => [],
      getEventDetail: async () => {
        throw new Error("Event tidak ditemukan.");
      },
    };
    renderWithProviders(<EventDetailScreen eventId="nope" />, {
      container: { eventRepository: failing },
    });
    await waitFor(() => expect(screen.getByTestId("detail-error")).toBeTruthy());
    expect(screen.getByText("Event tidak ditemukan.")).toBeTruthy();
  });

  it("renders hero, facts, description, categories and CTA for an available event", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(available) },
    });
    await waitFor(() =>
      expect(
        screen.getAllByText("Rusuh Fest 2026").length,
      ).toBeGreaterThanOrEqual(1),
    );
    // description
    expect(screen.getByText("Festival musik tahunan.")).toBeTruthy();
    expect(screen.getByText("Band A")).toBeTruthy();
    expect(screen.getByText("Wajib membawa KTP.")).toBeTruthy();
    // categories + availability
    expect(screen.getByText("VIP")).toBeTruthy();
    expect(screen.getByText("Reguler")).toBeTruthy();
    expect(screen.getByText("Habis")).toBeTruthy();
    // compact min price in the buy box
    expect(screen.getByText("Rp 450rb")).toBeTruthy();
    // remaining-tickets hero chip
    expect(screen.getByText("120 tiket tersedia")).toBeTruthy();
    // active CTA
    expect(screen.getByText("Masuk Antrean")).toBeTruthy();
  });

  it("joins the queue and navigates to the waiting room with the issued queueId on an active CTA press (RBT-041)", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(available) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    fireEvent.press(screen.getByTestId("join-cta"));
    // The join (RBT-041) issues a queueId via the mock queue repo and the hook
    // routes to the waiting room with it on success.
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/waiting/evt-1?queueId=q-evt-1",
      ),
    );
  });

  it("disables the CTA and shows 'Tiket Habis' for a sold-out event", async () => {
    const soldOut: EventDetail = {
      ...available,
      status: "SOLD_OUT",
      remainingTickets: 0,
    };
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(soldOut) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    expect(screen.getByText("Tiket Habis")).toBeTruthy();
    fireEvent.press(screen.getByTestId("join-cta"));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("disables the CTA and shows 'Belum Dibuka' for a not-started event", async () => {
    const soon: EventDetail = { ...available, status: "NOT_STARTED" };
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(soon) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    expect(screen.getByText("Belum Dibuka")).toBeTruthy();
    fireEvent.press(screen.getByTestId("join-cta"));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("falls back gracefully when the description is absent", async () => {
    const bare: EventDetail = {
      ...available,
      description: undefined,
    };
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(bare) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    expect(screen.getByText("Deskripsi event belum tersedia.")).toBeTruthy();
    // V2 shows "Menyusul" for price in FloatingCTA when minPriceMinor is present
    // but categories have no price data - since this test has available which has
    // minPriceMinor, we should see the price formatted
    // No categories → read-only server note (prototype 02 .categories-note).
    expect(
      screen.getByText(
        "Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.",
      ),
    ).toBeTruthy();
  });

  it("shows 'Sisa N' for a low-stock category and 'Menyusul' without a price", async () => {
    const lowStock: EventDetail = {
      ...available,
      minPriceMinor: undefined,
      venue: undefined,
      description: {
        longDesc: "x",
        categories: [
          { code: "REG", name: "Reguler", priceMinor: 30000000, available: 12 },
        ],
      },
    };
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(lowStock) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    expect(screen.getByText("Sisa 12")).toBeTruthy();
    expect(screen.getByText("Menyusul")).toBeTruthy();
  });

  it("renders the NOT_STARTED hero status label", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo({ ...available, status: "NOT_STARTED" }) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    expect(screen.getByText("Segera Dibuka")).toBeTruthy();
  });

  it("renders the CLOSED hero status label", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo({ ...available, status: "CLOSED" }) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    // V2 shows "Penjualan Ditutup" in both StatusBadge and CTA button for CLOSED status
    expect(screen.getAllByText("Penjualan Ditutup").length).toBeGreaterThanOrEqual(1);
  });

  it("navigates home from the back button (goHome)", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(available) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    // V2 back button uses "Kembali" label instead of "Kembali ke beranda"
    fireEvent.press(screen.getByLabelText("Kembali"));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("does not join when the CTA is disabled (SOLD_OUT guard)", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo({ ...available, status: "SOLD_OUT" }) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    fireEvent.press(screen.getByTestId("join-cta"));
    // Disabled CTA → onJoin early-returns → no queue navigation.
    expect(mockRouter.push).not.toHaveBeenCalledWith(
      expect.stringContaining("/waiting/"),
    );
  });
});
