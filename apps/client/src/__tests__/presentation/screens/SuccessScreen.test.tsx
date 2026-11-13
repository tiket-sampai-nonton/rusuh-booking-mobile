/**
 * RBT-070 — SuccessScreen: confirmed-order summary.
 * Re-verifies PAID; shows orderId/qty/amount/MASKED NIK; failed → recovery.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import type {
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
  PaymentStatus,
} from "@domain/repositories/payment.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { SuccessScreen } from "@presentation/screens/Success";
import { useSessionStore } from "@presentation/stores/session-store";
import { InMemoryPaymentJourneyStorage } from "@infrastructure/platform/payment-journey-storage";
import { InMemoryQueueMembership } from "@infrastructure/__fixtures__/in-memory-queue-membership";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
type NavigationEvent = {
  data: { action: { type: string } };
  preventDefault: () => void;
};
const mockNavigation = {
  addListener: jest.fn(
    (_name: string, _listener: (event: NavigationEvent) => void) => jest.fn(),
  ),
};
const mockDownloadTickets = jest.fn(async () => undefined);
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useNavigation: () => mockNavigation,
}));
jest.mock("@presentation/hooks/useETicketDownload", () => ({
  useETicketDownload: () => ({ downloadTickets: mockDownloadTickets }),
}));
jest.mock("react-native-qrcode-svg", () => {
  const ReactMock = require("react");
  const Native = require("react-native");
  function QrCodeMock(props: { value: string }) {
    return ReactMock.createElement(Native.View, {
      testID: "success-qr",
      accessibilityLabel: props.value,
    });
  }
  return { __esModule: true, default: QrCodeMock };
});

class StatusRepo implements PaymentRepository {
  constructor(private readonly attempt: PaymentAttempt) {}
  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    return {
      bookingId,
      methods: ["QRIS"],
      amountMinor: 1,
      paymentExpiresAt: "",
      serverTime: "",
    };
  }
  async createAttempt(
    bookingId: string,
    _m: PaymentMethod,
    _k: string,
  ): Promise<PaymentAttempt> {
    return { attemptId: "a1", bookingId, status: "AWAITING_PAYMENT" };
  }
  async getStatus(): Promise<PaymentAttempt> {
    return this.attempt;
  }
  async createPageToken(bookingId: string) {
    return { pageToken: "t", pageUrl: `/payment/${bookingId}` };
  }
  async exchangePageToken(): Promise<void> {}
  async snapCallback(attemptId: string): Promise<PaymentAttempt> {
    return { attemptId, bookingId: "bk-1", status: "PAID" };
  }
}

function renderScreen(
  status: PaymentStatus,
  bookingId = "bk-1",
  overrides: Partial<Container> = {},
) {
  const base = createContainer({ useMocks: true });
  const container: Container = {
    ...base,
    paymentRepository: new StatusRepo({ attemptId: "a1", bookingId, status }),
    ticketHistoryRepository: {
      ...base.ticketHistoryRepository,
      getBookingTickets: async (id) => {
        const state = useSessionStore.getState();
        const count = state.ticketCount ?? 1;
        return {
          bookingId: id,
          orderId: id,
          publicRef: id,
          amountMinor: state.amountMinor ?? 0,
          ticketQuantity: count,
          buyerNikMasked: state.buyerNikMasked ?? "••••",
          tickets: Array.from({ length: count }, (_, i) => ({
            ticketCode: `TKT-${i + 1}`,
            categoryCode: "REG",
            attendeeName: "Penonton",
            attendeeNikMasked: "••••",
            qrPayload: `ISSUED-${i + 1}`,
          })),
        };
      },
    },
    ...overrides,
  };
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ServiceProvider container={container}>
        <SuccessScreen bookingId={bookingId} />
      </ServiceProvider>
    </QueryClientProvider>,
  );
}

describe("SuccessScreen (RBT-070)", () => {
  beforeEach(() => {
    mockRouter.replace.mockReset();
    useSessionStore.getState().reset();
    useSessionStore.getState().setPaymentMethod("QRIS", "a1");
    mockDownloadTickets.mockReset();
  });

  it("shows the verifying state before the authoritative status resolves", async () => {
    const screen = renderScreen("AWAITING_PAYMENT");
    expect(screen.getByTestId("success-verifying")).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByText("Menyiapkan tiket…")).toBeTruthy(),
    );
  });

  it("renders the order summary ONLY when verified PAID (orderId/qty/amount/masked NIK)", async () => {
    useSessionStore.getState().setBooking("bk-1", 450000);
    useSessionStore.getState().setOrderDetail("31****89", 2);
    const screen = renderScreen("PAID");
    await waitFor(() =>
      expect(screen.getByTestId("success-eyebrow")).toBeTruthy(),
    );
    expect(screen.getByText("bk-1")).toBeTruthy();
    expect(screen.getByText("2 tiket")).toBeTruthy();
    expect(screen.getByText("Rp 450.000")).toBeTruthy();
    expect(screen.getByText("31****89")).toBeTruthy();
    // RBT-071: one e-ticket card per ticket + download/home actions
    expect(screen.getByTestId("eticket-list")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId("eticket-0")).toBeTruthy();
      expect(screen.getByTestId("eticket-1")).toBeTruthy();
    });
    expect(screen.getByTestId("success-download")).toBeTruthy();
    expect(screen.getByTestId("success-home")).toBeTruthy();
  });

  it("the home action routes to / (RBT-071)", async () => {
    useSessionStore.getState().setOrderDetail("31****89", 1);
    const screen = renderScreen("PAID");
    await waitFor(() =>
      expect(screen.getByTestId("success-home")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("success-home"));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
  });

  it("clears the paid journey before returning Home so recovery cannot reopen it", async () => {
    const paymentJourneyStorage = new InMemoryPaymentJourneyStorage();
    const queueMembership = new InMemoryQueueMembership();
    await paymentJourneyStorage.save({ bookingId: "bk-1", eventId: "evt-1" });
    await queueMembership.save({ eventId: "evt-1", queueId: "q-1" });
    const screen = renderScreen("PAID", "bk-1", {
      paymentJourneyStorage,
      queueMembership,
    });
    await waitFor(() =>
      expect(screen.getByTestId("success-home")).toBeTruthy(),
    );

    await act(async () => fireEvent.press(screen.getByTestId("success-home")));

    expect(await paymentJourneyStorage.load()).toBeNull();
    expect(await queueMembership.load()).toBeNull();
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("keeps recovery references while the authoritative payment is pending", async () => {
    const paymentJourneyStorage = new InMemoryPaymentJourneyStorage();
    const queueMembership = new InMemoryQueueMembership();
    await paymentJourneyStorage.save({ bookingId: "bk-1", eventId: "evt-1" });
    await queueMembership.save({ eventId: "evt-1", queueId: "q-1" });
    const screen = renderScreen("AWAITING_PAYMENT", "bk-1", {
      paymentJourneyStorage,
      queueMembership,
    });
    await waitFor(() =>
      expect(screen.getByText("Menyiapkan tiket…")).toBeTruthy(),
    );

    expect(await paymentJourneyStorage.load()).toEqual({
      bookingId: "bk-1",
      eventId: "evt-1",
    });
    expect(await queueMembership.load()).toEqual({
      eventId: "evt-1",
      queueId: "q-1",
    });
  });

  it("does not erase a newer journey when viewing an older paid ticket", async () => {
    const paymentJourneyStorage = new InMemoryPaymentJourneyStorage();
    const queueMembership = new InMemoryQueueMembership();
    await paymentJourneyStorage.save({
      bookingId: "bk-new",
      eventId: "evt-new",
    });
    await queueMembership.save({ eventId: "evt-new", queueId: "q-new" });
    const screen = renderScreen("PAID", "bk-1", {
      paymentJourneyStorage,
      queueMembership,
    });
    await waitFor(() =>
      expect(screen.getByTestId("success-home")).toBeTruthy(),
    );

    await act(async () => fireEvent.press(screen.getByTestId("success-home")));

    expect(await paymentJourneyStorage.load()).toEqual({
      bookingId: "bk-new",
      eventId: "evt-new",
    });
    expect(await queueMembership.load()).toEqual({
      eventId: "evt-new",
      queueId: "q-new",
    });
  });

  it("preserves pending recovery when Back is pressed before payment is verified", async () => {
    const paymentJourneyStorage = new InMemoryPaymentJourneyStorage();
    const queueMembership = new InMemoryQueueMembership();
    await paymentJourneyStorage.save({ bookingId: "bk-1", eventId: "evt-1" });
    await queueMembership.save({ eventId: "evt-1", queueId: "q-1" });
    const screen = renderScreen("AWAITING_PAYMENT", "bk-1", {
      paymentJourneyStorage,
      queueMembership,
    });
    await waitFor(() =>
      expect(screen.getByText("Menyiapkan tiket…")).toBeTruthy(),
    );
    const beforeRemove = mockNavigation.addListener.mock.calls.at(-1)?.[1];
    expect(beforeRemove).toBeDefined();

    await act(async () => {
      beforeRemove?.({
        data: { action: { type: "GO_BACK" } },
        preventDefault: jest.fn(),
      });
    });

    expect(await paymentJourneyStorage.load()).toEqual({
      bookingId: "bk-1",
      eventId: "evt-1",
    });
    expect(await queueMembership.load()).toEqual({
      eventId: "evt-1",
      queueId: "q-1",
    });
  });

  it("shows the MASKED NIK, never a raw 16-digit NIK", async () => {
    useSessionStore.getState().setOrderDetail("31****89", 1);
    const screen = renderScreen("PAID");
    await waitFor(() =>
      expect(screen.getByTestId("success-eyebrow")).toBeTruthy(),
    );
    // no 16-digit run anywhere in the rendered tree
    expect(screen.queryByText(/\d{16}/)).toBeNull();
    expect(screen.getByText("31****89")).toBeTruthy();
  });

  it("falls back to a dotted placeholder when no masked NIK was recorded", async () => {
    const screen = renderScreen("PAID");
    await waitFor(() =>
      expect(screen.getByTestId("success-eyebrow")).toBeTruthy(),
    );
    expect(screen.getAllByText("••••")).toHaveLength(2);
    // default qty 1 when ticketCount unset
    expect(screen.getByText("1 tiket")).toBeTruthy();
  });

  it("downloads ticket references without reading the rendered native QR (RBT-071)", async () => {
    useSessionStore.getState().setOrderDetail("31****89", 1);
    const screen = renderScreen("PAID");
    await waitFor(() => expect(screen.getByTestId("eticket-0")).toBeTruthy());
    expect(() =>
      fireEvent.press(screen.getByTestId("success-download")),
    ).not.toThrow();
    await waitFor(() =>
      expect(mockDownloadTickets).toHaveBeenCalledWith("bk-1", [
        expect.objectContaining({
          qrPayload: "ISSUED-1",
          ticketCode: "TKT-1",
          categoryCode: "REG",
          index: 0,
          total: 1,
        }),
      ]),
    );
  });

  it("generates one safe ticket reference per ticket", async () => {
    useSessionStore.getState().setOrderDetail("31****89", 2);
    const screen = renderScreen("PAID");
    await waitFor(() => expect(screen.getByTestId("eticket-0")).toBeTruthy());
    fireEvent.press(screen.getByTestId("success-download"));
    await waitFor(() =>
      expect(mockDownloadTickets).toHaveBeenCalledWith("bk-1", [
        expect.objectContaining({ qrPayload: "ISSUED-1", index: 0, total: 2 }),
        expect.objectContaining({ qrPayload: "ISSUED-2", index: 1, total: 2 }),
      ]),
    );
  });

  it("uses the generic message for non-Error download failures", async () => {
    mockDownloadTickets.mockRejectedValueOnce("disk unavailable");
    const screen = renderScreen("PAID");
    await waitFor(() => expect(screen.getByTestId("eticket-0")).toBeTruthy());
    fireEvent.press(screen.getByTestId("success-download"));
    await waitFor(() =>
      expect(
        screen.getByText("E-tiket gagal disimpan. Coba lagi."),
      ).toBeTruthy(),
    );
  });

  it("a non-PAID (FAILED) status redirects to the recovery screen", async () => {
    renderScreen("FAILED");
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith(
        "/failed/bk-1?reason=payment&bookingId=bk-1",
      ),
    );
  });
});
