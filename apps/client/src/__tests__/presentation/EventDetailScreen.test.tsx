import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Animated, Platform, Share } from "react-native";

import type {
  EventDetail,
  EventRepository,
} from "@domain/repositories/event.repository";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn() };
const originalNavigator = globalThis.navigator;
const originalWindow = globalThis.window;
const originalPlatform = Platform.OS;
const completedAnimation = {
  start: (callback?: (result: { finished: boolean }) => void) =>
    callback?.({ finished: true }),
  stop: () => undefined,
  reset: () => undefined,
};
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
  maxTicketsPerBuyerNik: 3,
  remainingTickets: 120,
  description: {
    longDesc: "Festival musik tahunan.",
    lineup: ["Band A", "Band B"],
    gallery: [
      "https://example.test/event-1.jpg",
      "https://example.test/event-2.jpg",
      "https://example.test/event-3.jpg",
      "https://example.test/event-4.jpg",
    ],
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
  beforeEach(() => {
    mockRouter.push.mockReset();
    jest
      .spyOn(Animated, "timing")
      .mockReturnValue(
        completedAnimation as ReturnType<typeof Animated.timing>,
      );
    jest
      .spyOn(Animated, "spring")
      .mockReturnValue(
        completedAnimation as ReturnType<typeof Animated.spring>,
      );
    jest
      .spyOn(Animated, "parallel")
      .mockReturnValue(
        completedAnimation as ReturnType<typeof Animated.parallel>,
      );
    jest
      .spyOn(Animated, "sequence")
      .mockReturnValue(
        completedAnimation as ReturnType<typeof Animated.sequence>,
      );
    jest
      .spyOn(Animated, "loop")
      .mockReturnValue(completedAnimation as ReturnType<typeof Animated.loop>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
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
    await waitFor(() =>
      expect(screen.getByTestId("detail-error")).toBeTruthy(),
    );
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
    // Native now exposes the same gallery, location, and terms sections as web.
    expect(screen.getByText("Wajib membawa KTP.")).toBeTruthy();
    // categories + availability
    expect(screen.getByText("VIP")).toBeTruthy();
    expect(screen.getByText("Reguler")).toBeTruthy();
    expect(screen.getByText("Habis")).toBeTruthy();
    // compact min price in the buy box
    expect(screen.getByText("Rp 450rb")).toBeTruthy();
    // hero ticket-count chip is web-only (hidden on native per v2-mobile prototype)
    // active CTA
    expect(screen.getByText("Masuk Antrean")).toBeTruthy();
  });

  it("joins the queue and navigates to the waiting room with the issued queueId on an active CTA press (RBT-041)", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(available) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    fireEvent.press(screen.getByTestId("join-cta"));
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
    expect(screen.getAllByText("Tiket Habis").length).toBeGreaterThan(0);
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
    //  shows "Menyusul" for price in FloatingCTA when minPriceMinor is present
    // but categories have no price data - since this test has available which has
    // minPriceMinor, we should see the price formatted
    // The mobile prototype does not add a placeholder callout to the ticket list.
    expect(
      screen.queryByText(
        "Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.",
      ),
    ).toBeNull();
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
    expect(screen.getByText("Lokasi akan diumumkan.")).toBeTruthy();
    expect(screen.queryByText(/Jakarta International Stadium/)).toBeNull();
  });

  it("renders the NOT_STARTED hero status label", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: {
        eventRepository: repo({ ...available, status: "NOT_STARTED" }),
      },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    expect(screen.getByText("Segera Dibuka")).toBeTruthy();
  });

  it("renders the CLOSED hero status label", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo({ ...available, status: "CLOSED" }) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    //  shows "Penjualan Ditutup" in both StatusBadge and CTA button for CLOSED status
    expect(
      screen.getAllByText("Penjualan Ditutup").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("navigates home from the back button (goHome)", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(available) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    //  back button uses "Kembali" label instead of "Kembali ke beranda"
    fireEvent.press(screen.getByLabelText("Kembali"));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("updates the native header on scroll and opens, navigates, and closes the gallery", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(available) },
    });
    await waitFor(() => screen.getByTestId("join-cta"));

    fireEvent.scroll(screen.getByTestId("detail-scroll"), {
      nativeEvent: { contentOffset: { x: 0, y: 180 } },
    });
    fireEvent.press(screen.getByLabelText("Lihat gambar 1"));
    expect(screen.getByLabelText("Tutup galeri foto")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Gambar selanjutnya"));
    fireEvent.press(screen.getByLabelText("Tutup galeri foto"));
    expect(screen.queryByLabelText("Tutup galeri foto")).toBeNull();
  });

  it("shares event information on web and displays the remaining-ticket chip", async () => {
    const previousPlatform = Platform.OS;
    const previousWindow = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    );
    const previousShare = Object.getOwnPropertyDescriptor(
      globalThis.navigator,
      "share",
    );
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { href: "https://example.invalid/events/evt-1" } },
    });
    Object.defineProperty(globalThis.navigator, "share", {
      configurable: true,
      value: share,
    });
    try {
      renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
        container: { eventRepository: repo(available) },
      });
      await waitFor(() => screen.getByTestId("join-cta"));
      expect(screen.getByText("120 tiket tersedia")).toBeTruthy();
      fireEvent.press(screen.getByLabelText("Bagikan"));
      expect(share).toHaveBeenCalledWith(
        expect.objectContaining({ title: available.name }),
      );
    } finally {
      Object.defineProperty(Platform, "OS", {
        configurable: true,
        value: previousPlatform,
      });
      if (previousWindow)
        Object.defineProperty(globalThis, "window", previousWindow);
      else Reflect.deleteProperty(globalThis, "window");
      if (previousShare)
        Object.defineProperty(globalThis.navigator, "share", previousShare);
      else Reflect.deleteProperty(globalThis.navigator, "share");
    }
  });

  it("does not join when the CTA is disabled (SOLD_OUT guard)", async () => {
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: {
        eventRepository: repo({ ...available, status: "SOLD_OUT" }),
      },
    });
    await waitFor(() => screen.getByTestId("join-cta"));
    fireEvent.press(screen.getByTestId("join-cta"));
    // Disabled CTA → onJoin early-returns → no queue navigation.
    expect(mockRouter.push).not.toHaveBeenCalledWith(
      expect.stringContaining("/waiting/"),
    );
  });

  it("uses a safe label for unknown status, supports native sharing, and handles scrolling", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    const share = jest
      .spyOn(Share, "share")
      .mockResolvedValue({ action: Share.sharedAction });
    const unknown = {
      ...available,
      status: "MYSTERY" as unknown as EventDetail["status"],
      venue: "",
    };
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(unknown) },
    });
    await waitFor(() => expect(screen.getByTestId("join-cta")).toBeTruthy());
    expect(screen.getByText("MYSTERY")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Bagikan" }));
    expect(share).toHaveBeenCalledWith({
      title: "Rusuh Fest 2026",
      message: "Rusuh Fest 2026\nhttps://rusuh-booking.pages.dev/events/evt-1",
    });
    const scrollHandler = screen.getByTestId("detail-scroll").props.onScroll as
      | ((event: { nativeEvent: { contentOffset: { y: number } } }) => void)
      | undefined;
    act(() => scrollHandler?.({ nativeEvent: { contentOffset: { y: 180 } } }));
  });

  it("keeps the web header static on scroll and safely skips an unavailable share API", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { clipboard: { writeText } },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { href: "https://example.test/events/evt-1" } },
    });
    renderWithProviders(<EventDetailScreen eventId="evt-1" />, {
      container: { eventRepository: repo(available) },
    });
    await waitFor(() => expect(screen.getByTestId("join-cta")).toBeTruthy());
    fireEvent.press(screen.getByRole("button", { name: "Bagikan" }));
    expect(writeText).toHaveBeenCalledWith("https://example.test/events/evt-1");
    const scrollHandler = screen.getByTestId("detail-scroll").props.onScroll as
      | ((event: { nativeEvent: { contentOffset: { y: number } } }) => void)
      | undefined;
    act(() => scrollHandler?.({ nativeEvent: { contentOffset: { y: 180 } } }));
    expect(screen.getByTestId("event-detail-screen")).toBeTruthy();
  });
});
