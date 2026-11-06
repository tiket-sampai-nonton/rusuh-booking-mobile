/**
 * RBT-070 — SuccessScreen: confirmed-order summary.
 * Re-verifies PAID; shows orderId/qty/amount/MASKED NIK; failed → recovery.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
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

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
const mockDownloadTickets = jest.fn(async () => undefined);
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
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

function renderScreen(status: PaymentStatus, bookingId = "bk-1") {
  const base = createContainer({ useMocks: true });
  const container: Container = {
    ...base,
    paymentRepository: new StatusRepo({ attemptId: "a1", bookingId, status }),
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
    useSessionStore.getState().setBooking("bk-1", 45000000);
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
    expect(screen.getByTestId("eticket-0")).toBeTruthy();
    expect(screen.getByTestId("eticket-1")).toBeTruthy();
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
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
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
    expect(screen.getByText("••••")).toBeTruthy();
    // default qty 1 when ticketCount unset
    expect(screen.getByText("1 tiket")).toBeTruthy();
  });

  it("downloads ticket references without reading the rendered native QR (RBT-071)", async () => {
    useSessionStore.getState().setOrderDetail("31****89", 1);
    const screen = renderScreen("PAID");
    await waitFor(() =>
      expect(screen.getByTestId("success-download")).toBeTruthy(),
    );
    expect(() =>
      fireEvent.press(screen.getByTestId("success-download")),
    ).not.toThrow();
    await waitFor(() =>
      expect(mockDownloadTickets).toHaveBeenCalledWith(
        "bk-1",
        1,
        ["RBT|bk-1|1"],
        undefined,
      ),
    );
  });

  it("generates one safe ticket reference per ticket", async () => {
    useSessionStore.getState().setOrderDetail("31****89", 2);
    const screen = renderScreen("PAID");
    await waitFor(() =>
      expect(screen.getByTestId("success-download")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("success-download"));
    await waitFor(() =>
      expect(mockDownloadTickets).toHaveBeenCalledWith(
        "bk-1",
        2,
        ["RBT|bk-1|1", "RBT|bk-1|2"],
        undefined,
      ),
    );
  });

  it("uses the generic message for non-Error download failures", async () => {
    mockDownloadTickets.mockRejectedValueOnce("disk unavailable");
    const screen = renderScreen("PAID");
    await waitFor(() =>
      expect(screen.getByTestId("success-download")).toBeTruthy(),
    );
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
        "/expired/bk-1?reason=payment&bookingId=bk-1",
      ),
    );
  });
});
