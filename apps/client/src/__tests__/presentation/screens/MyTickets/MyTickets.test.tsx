import { notifyManager, QueryClient } from "@tanstack/react-query";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { BackHandler, Platform } from "react-native";
import type {
  EventDetail,
  EventRepository,
} from "@domain/repositories/event.repository";
import type { TicketHistoryRepository } from "@domain/repositories/ticket-history.repository";
import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";
import { useAccountStore } from "@presentation/stores/account-store";
import { useSessionStore } from "@presentation/stores/session-store";
import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
  dismissTo: jest.fn(),
  back: jest.fn(),
};
const mockDownloadTickets = jest.fn(async () => undefined);
const mockShareTickets = jest.fn(async () => undefined);
const mockResponsiveState = {
  isWeb: false,
  isDesktop: false,
  isNative: true,
  width: 393,
  gridColumns: 2,
  bottomBarHeight: 72,
};
jest.mock("expo-router", () => ({ useRouter: () => mockRouter }));
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsiveState,
}));
jest.mock("@presentation/hooks/useETicketDownload", () => ({
  useETicketDownload: () => ({ downloadTickets: mockDownloadTickets }),
}));
jest.mock("@presentation/hooks/useETicketShare", () => ({
  useETicketShare: () => ({ shareTickets: mockShareTickets }),
}));
jest.mock("react-native-qrcode-svg", () => {
  const ReactMock = require("react");
  const Native = require("react-native");
  function QrCodeMock(props: { value: string }) {
    return ReactMock.createElement(Native.View, {
      testID: "qr-code",
      accessibilityLabel: props.value,
    });
  }
  return { __esModule: true, default: QrCodeMock };
});

// eslint-disable-next-line import/first
import { MyTicketsScreen } from "../../../../presentation/screens/MyTickets/index";

const eventRepository: EventRepository = {
  listEvents: async () => EVENT_FIXTURES,
  getEventDetail: async (eventId) =>
    EVENT_FIXTURES.find((event) => event.id === eventId) as EventDetail,
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}

describe("MyTicketsScreen", () => {
  beforeAll(() => {
    notifyManager.setNotifyFunction((notify) => act(() => notify()));
  });

  afterAll(() => {
    notifyManager.setNotifyFunction((notify) => notify());
  });

  beforeEach(() => {
    mockRouter.push.mockReset();
    mockRouter.navigate.mockReset();
    mockDownloadTickets.mockClear();
    mockShareTickets.mockClear();
    Object.assign(mockResponsiveState, {
      isWeb: false,
      isDesktop: false,
      isNative: true,
      width: 393,
    });
    useAccountStore.getState().clearProfile();
    useSessionStore.getState().reset();
  });

  it("shows the guest empty state and navigates to Browse", async () => {
    Object.assign(mockResponsiveState, {
      isWeb: true,
      isNative: false,
      width: 1200,
    });
    renderWithProviders(<MyTicketsScreen />, {
      container: { eventRepository },
      queryClient: makeQueryClient(),
    });

    await waitFor(() =>
      expect(screen.getByTestId("my-tickets-empty")).toBeTruthy(),
    );
    fireEvent.press(screen.getByText("Jelajahi Event"));
    expect(mockRouter.navigate).toHaveBeenCalledWith("/browse");
    fireEvent.press(screen.getByTestId("header-cta"));
    expect(screen.getByTestId("login-card")).toBeTruthy();
    fireEvent.press(screen.getByTestId("login-close"));
    fireEvent.press(screen.getByTestId("header-logo"));
    fireEvent.press(screen.getByTestId("bottom-nav-home"));
    fireEvent.press(screen.getByTestId("bottom-nav-browse"));
    fireEvent.press(screen.getByTestId("bottom-nav-profile"));
    expect(mockRouter.navigate).toHaveBeenLastCalledWith("/profile");
  });

  it("loads account tickets and opens the selected booking QR sheet", async () => {
    useAccountStore
      .getState()
      .setProfile({ emailMasked: "r***@example.com", hasNik: true });
    const ticketHistoryRepository: TicketHistoryRepository = {
      listMyBookings: async () => ({
        bookings: [
          {
            bookingId: "booking-1",
            publicRef: "RBT-2026-001",
            eventName: "Rusuh Fest 2026",
            status: "PAID",
            amountMinor: 45000000,
          },
        ],
      }),
      getBookingTickets: async () => ({
        bookingId: "booking-1",
        orderId: "order-1",
        publicRef: "RBT-2026-001",
        amountMinor: 45000000,
        ticketQuantity: 1,
        buyerNikMasked: "31****89",
        tickets: [
          {
            ticketCode: "TICKET-1",
            categoryCode: "FEST",
            attendeeName: "Rizky",
            attendeeNikMasked: "31****89",
            qrPayload: "signed-ticket-payload",
          },
        ],
      }),
    };

    renderWithProviders(<MyTicketsScreen />, {
      container: { eventRepository, ticketHistoryRepository },
      queryClient: makeQueryClient(),
    });

    await waitFor(() =>
      expect(screen.getByTestId("account-ticket-booking-1")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("account-ticket-booking-1"));
    expect(await screen.findByTestId("ticket-qr-sheet")).toBeTruthy();
    expect(await screen.findByText("TICKET-1")).toBeTruthy();
    expect(screen.getByTestId("qr-code").props.accessibilityLabel).toBe(
      "signed-ticket-payload",
    );
    fireEvent.press(screen.getByText("Unduh E-Tiket"));
    await waitFor(() =>
      expect(mockDownloadTickets).toHaveBeenCalledWith(
        "booking-1",
        1,
        ["signed-ticket-payload"],
        "Rusuh Fest 2026",
        ["TICKET-1"],
      ),
    );
    mockDownloadTickets.mockRejectedValueOnce(
      new Error("Penyimpanan tidak tersedia"),
    );
    fireEvent.press(screen.getByText("Unduh E-Tiket"));
    expect(
      await screen.findAllByText("Penyimpanan tidak tersedia"),
    ).toHaveLength(2);

    fireEvent.press(screen.getByTestId("ticket-qr-close"));
    await waitFor(() =>
      expect(screen.queryByTestId("ticket-qr-sheet")).toBeNull(),
    );
  });

  it("shows a session ticket and completes its download and share actions", async () => {
    useSessionStore.getState().setQueue("evt-1", "queue-1", "WAITING");
    useSessionStore.getState().setBooking("booking-session", 45000000);
    useSessionStore.getState().setOrderDetail("31****89", 1);
    const paymentRepository = new MockPaymentRepository();
    jest.spyOn(paymentRepository, "getStatus").mockResolvedValue({
      attemptId: "1",
      bookingId: "booking-session",
      status: "PAID",
    });
    const ticketHistoryRepository: TicketHistoryRepository = {
      listMyBookings: async () => ({ bookings: [] }),
      getBookingTickets: async () => ({
        bookingId: "booking-session",
        orderId: "order-1",
        publicRef: "ref-1",
        amountMinor: 45000000,
        ticketQuantity: 1,
        buyerNikMasked: "31****89",
        tickets: [
          {
            ticketCode: "TKT-1",
            categoryCode: "REG",
            attendeeName: "Penonton",
            attendeeNikMasked: "31****89",
            qrPayload: "issued-qr",
          },
        ],
      }),
    };
    renderWithProviders(<MyTicketsScreen />, {
      container: {
        eventRepository,
        paymentRepository,
        ticketHistoryRepository,
      },
      queryClient: makeQueryClient(),
    });

    await waitFor(() =>
      expect(screen.getByTestId("ticket-card-booking-session")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("ticket-qr-booking-session"));
    expect(await screen.findByTestId("ticket-qr-sheet")).toBeTruthy();
    expect(screen.getByTestId("qr-code").props.accessibilityLabel).toBe(
      "issued-qr",
    );
    fireEvent.press(screen.getByTestId("ticket-qr-close"));
    await waitFor(() =>
      expect(screen.queryByTestId("ticket-qr-sheet")).toBeNull(),
    );

    fireEvent.press(screen.getByTestId("ticket-download-booking-session"));
    await waitFor(() =>
      expect(mockDownloadTickets).toHaveBeenCalledWith(
        "booking-session",
        1,
        ["issued-qr"],
        expect.any(String),
        ["TKT-1"],
      ),
    );
    mockDownloadTickets.mockRejectedValueOnce("disk unavailable");
    fireEvent.press(screen.getByTestId("ticket-download-booking-session"));
    expect(
      await screen.findByText("E-tiket gagal disimpan. Coba lagi."),
    ).toBeTruthy();
    fireEvent.press(screen.getByTestId("ticket-share-booking-session"));
    expect(mockShareTickets).toHaveBeenCalledWith("booking-session", 1, [
      "TKT-1",
    ]);
  });

  it("filters past booking states and requests another page", async () => {
    useAccountStore
      .getState()
      .setProfile({ emailMasked: "r***@example.com", hasNik: true });
    const ticketHistoryRepository: TicketHistoryRepository = {
      listMyBookings: async (cursor) =>
        cursor
          ? {
              bookings: [
                {
                  bookingId: "booking-next",
                  publicRef: "NEXT",
                  eventName: "New Show",
                  status: "PAID",
                  amountMinor: 100,
                },
              ],
              nextCursor: null,
            }
          : {
              bookings: [
                {
                  bookingId: "booking-expired",
                  publicRef: "EXP",
                  eventName: "Old Show",
                  status: "EXPIRED",
                  amountMinor: 100,
                },
                {
                  bookingId: "booking-cancelled",
                  publicRef: "CAN",
                  eventName: "Cancelled Show",
                  status: "CANCELLED",
                  amountMinor: 100,
                },
                {
                  bookingId: "booking-event-past",
                  publicRef: "OLD",
                  eventName: "Jazz in the Park 2025",
                  status: "PAID",
                  amountMinor: 100,
                },
                {
                  bookingId: "booking-paid",
                  publicRef: "PAID",
                  eventName: "New Show",
                  status: "PAID",
                  amountMinor: 100,
                },
              ],
              nextCursor: "cursor-1",
            },
      getBookingTickets: jest.fn(async (bookingId: string) => ({
        bookingId,
        orderId: "order-past",
        publicRef: "OLD",
        amountMinor: 100,
        ticketQuantity: 1,
        buyerNikMasked: "31****89",
        tickets: [
          {
            ticketCode: "OLD-TICKET-1",
            categoryCode: "REG",
            attendeeName: "Rizky Rachmawan",
            attendeeNikMasked: "31****89",
            qrPayload: "old-ticket-payload",
          },
        ],
      })),
    };
    renderWithProviders(<MyTicketsScreen />, {
      container: { eventRepository, ticketHistoryRepository },
      queryClient: makeQueryClient(),
    });

    await waitFor(() =>
      expect(screen.getByText("Sebelumnya (3)")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("tickets-tab-past"));
    await waitFor(() =>
      expect(screen.getByTestId("account-ticket-booking-expired")).toBeTruthy(),
    );
    expect(screen.getByTestId("account-ticket-booking-expired")).toBeTruthy();
    expect(screen.getByTestId("account-ticket-booking-cancelled")).toBeTruthy();
    expect(
      screen.getByTestId("account-ticket-booking-event-past"),
    ).toBeTruthy();
    expect(screen.getAllByText("Lihat Detail Tiket")).toHaveLength(3);
    expect(screen.queryByTestId("account-ticket-booking-paid")).toBeNull();
    fireEvent.press(screen.getByTestId("account-ticket-booking-event-past"));
    expect(await screen.findByTestId("ticket-qr-sheet")).toBeTruthy();
    expect(await screen.findByText("OLD-TICKET-1")).toBeTruthy();
    expect(screen.getByText("Kategori REG")).toBeTruthy();
    expect(screen.getByText("Rizky Rachmawan · 31****89")).toBeTruthy();
    fireEvent.press(screen.getByTestId("ticket-qr-close"));

    fireEvent.press(screen.getByTestId("account-ticket-booking-expired"));
    expect(await screen.findByTestId("booking-order-summary")).toBeTruthy();
    expect(screen.getByText("Referensi EXP")).toBeTruthy();
    expect(screen.queryByTestId("qr-code")).toBeNull();
    expect(ticketHistoryRepository.getBookingTickets).toHaveBeenCalledTimes(1);
    expect(ticketHistoryRepository.getBookingTickets).toHaveBeenCalledWith(
      "booking-event-past",
    );
    fireEvent.press(screen.getByTestId("ticket-qr-close"));

    fireEvent.press(screen.getByTestId("tickets-tab-upcoming"));
    await waitFor(() =>
      expect(screen.getByTestId("account-ticket-booking-paid")).toBeTruthy(),
    );
    fireEvent.press(screen.getByText("Muat Tiket Lainnya"));
    await waitFor(() =>
      expect(screen.getByTestId("account-ticket-booking-next")).toBeTruthy(),
    );
  });

  it("shows logged-in links on wide web and routes to the profile", async () => {
    useAccountStore
      .getState()
      .setProfile({ emailMasked: "r***@example.com", hasNik: true });
    Object.assign(mockResponsiveState, {
      isWeb: true,
      isNative: false,
      width: 1200,
    });
    renderWithProviders(<MyTicketsScreen />, {
      queryClient: makeQueryClient(),
    });

    await waitFor(() => expect(screen.getByTestId("nav-profile")).toBeTruthy());
    fireEvent.press(screen.getByTestId("nav-home"));
    fireEvent.press(screen.getByTestId("nav-browse"));
    fireEvent.press(screen.getByTestId("nav-tickets"));
    fireEvent.press(screen.getByTestId("nav-profile"));
    expect(mockRouter.navigate.mock.calls).toEqual([
      ["/"],
      ["/browse"],
      ["/profile"],
    ]);
  });

  it("shows safe connection guidance and retry when ticket history fails", async () => {
    useAccountStore
      .getState()
      .setProfile({ emailMasked: "r***@example.com", hasNik: true });
    let rejectHistory: (error: Error) => void = () => undefined;
    const ticketHistoryRepository: TicketHistoryRepository = {
      listMyBookings: () =>
        new Promise((_, reject) => {
          rejectHistory = reject;
        }),
      getBookingTickets: async () => ({
        bookingId: "unused",
        orderId: "unused",
        publicRef: "unused",
        amountMinor: 0,
        ticketQuantity: 0,
        buyerNikMasked: "",
        tickets: [],
      }),
    };
    renderWithProviders(<MyTicketsScreen />, {
      container: { eventRepository, ticketHistoryRepository },
      queryClient: makeQueryClient(),
    });

    expect(await screen.findByText("Memuat tiket…")).toBeTruthy();
    await act(async () => rejectHistory(new Error("offline")));
    expect(
      await screen.findByText(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.",
      ),
    ).toBeTruthy();
    expect(screen.getByTestId("booking-history-retry")).toBeTruthy();
  });

  it("closes the QR overlay on Android hardware back", async () => {
    useAccountStore
      .getState()
      .setProfile({ emailMasked: "r***@example.com", hasNik: true });
    const platformSpy = jest.replaceProperty(Platform, "OS", "android");
    const removeHandler = jest.fn();
    let hardwareBack: (() => boolean | null | undefined) | undefined;
    const backHandlerSpy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_event, handler) => {
        hardwareBack = handler;
        return { remove: removeHandler };
      });
    const ticketHistoryRepository: TicketHistoryRepository = {
      listMyBookings: async () => ({
        bookings: [
          {
            bookingId: "booking-android",
            publicRef: "ANDROID",
            eventName: "Rusuh Fest 2026",
            status: "PAID",
            amountMinor: 100,
          },
        ],
      }),
      getBookingTickets: async () => ({
        bookingId: "booking-android",
        orderId: "order",
        publicRef: "ANDROID",
        amountMinor: 100,
        ticketQuantity: 1,
        buyerNikMasked: "31****89",
        tickets: [
          {
            ticketCode: "ANDROID-1",
            categoryCode: "FEST",
            attendeeName: "Rizky",
            attendeeNikMasked: "31****89",
            qrPayload: "android-payload",
          },
        ],
      }),
    };
    const screenView = renderWithProviders(<MyTicketsScreen />, {
      container: { eventRepository, ticketHistoryRepository },
      queryClient: makeQueryClient(),
    });

    await waitFor(() =>
      expect(screen.getByTestId("account-ticket-booking-android")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("account-ticket-booking-android"));
    await screen.findByText("ANDROID-1");
    expect(backHandlerSpy).toHaveBeenCalledWith(
      "hardwareBackPress",
      expect.any(Function),
    );
    let handled = false;
    act(() => {
      handled = hardwareBack?.() === true;
    });
    expect(handled).toBe(true);
    await waitFor(() =>
      expect(screen.queryByTestId("ticket-qr-sheet")).toBeNull(),
    );
    expect(removeHandler).toHaveBeenCalledTimes(1);
    screenView.unmount();
    backHandlerSpy.mockRestore();
    platformSpy.restore();
  });

  it("uses the web QR modal and sends the ticket payload to the download service", async () => {
    const platformSpy = jest.replaceProperty(Platform, "OS", "web");
    useAccountStore
      .getState()
      .setProfile({ emailMasked: "w***@example.com", hasNik: true });
    const ticketHistoryRepository: TicketHistoryRepository = {
      listMyBookings: async () => ({
        bookings: [
          {
            bookingId: "booking-web",
            publicRef: "WEB",
            eventName: "Rusuh Fest 2026",
            status: "PAID",
            amountMinor: 100,
          },
        ],
      }),
      getBookingTickets: async () => ({
        bookingId: "booking-web",
        orderId: "order-web",
        publicRef: "WEB",
        amountMinor: 100,
        ticketQuantity: 1,
        buyerNikMasked: "31****89",
        tickets: [
          {
            ticketCode: "WEB-1",
            categoryCode: "FEST",
            attendeeName: "Rizky",
            attendeeNikMasked: "31****89",
            qrPayload: "web-payload",
          },
        ],
      }),
    };
    const view = renderWithProviders(<MyTicketsScreen />, {
      container: { eventRepository, ticketHistoryRepository },
      queryClient: makeQueryClient(),
    });

    await waitFor(() =>
      expect(screen.getByTestId("account-ticket-booking-web")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("account-ticket-booking-web"));
    expect(await screen.findByTestId("ticket-qr-sheet")).toBeTruthy();
    expect(await screen.findByText("WEB-1")).toBeTruthy();
    fireEvent.press(screen.getByText("Unduh E-Tiket"));
    await waitFor(() =>
      expect(mockDownloadTickets).toHaveBeenCalledWith(
        "booking-web",
        1,
        ["web-payload"],
        "Rusuh Fest 2026",
        ["WEB-1"],
      ),
    );
    view.unmount();
    platformSpy.restore();
  });
});
