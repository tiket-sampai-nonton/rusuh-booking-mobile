import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";

import type {
  PaymentAttempt,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import { useSessionStore } from "@presentation/stores/session-store";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { replace: jest.fn(), push: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// Drive the success-check pop vs reduced-motion branch.
const motionState = { reduced: false };
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => motionState.reduced };
});

// eslint-disable-next-line import/first
import { SuccessScreen } from "@presentation/screens/Success";

function paymentRepo(status: PaymentAttempt["status"]): PaymentRepository {
  return {
    createAttempt: async () => ({
      attemptId: "pay-1",
      bookingId: "bk-1",
      status,
    }),
    getStatus: async () => ({ attemptId: "pay-1", bookingId: "bk-1", status }),
  };
}

function seedStore(): void {
  const s = useSessionStore.getState();
  s.reset();
  s.setPaymentMethod("QRIS", "pay-1");
  s.setBooking("bk-1", 90000000);
  s.setOrderDetail("32****01", 2);
}

describe("SuccessScreen", () => {
  afterEach(() => {
    motionState.reduced = false;
  });
  beforeEach(() => {
    mockRouter.replace.mockReset();
    seedStore();
  });

  it("verifies PAID, shows the summary (masked NIK) and e-tickets", async () => {
    renderWithProviders(<SuccessScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo("PAID") },
    });
    await waitFor(() => expect(screen.getByTestId("success-scroll")).toBeTruthy());
    expect(screen.getByText("Pembayaran Berhasil!")).toBeTruthy();
    // Summary rows.
    expect(screen.getByText("Rp 900.000")).toBeTruthy();
    expect(screen.getByText("32****01")).toBeTruthy();
    // Two e-tickets (ticketCount = 2).
    expect(screen.getByTestId("eticket-0")).toBeTruthy();
    expect(screen.getByTestId("eticket-1")).toBeTruthy();
  });

  it("renders the success check statically under reduced-motion", async () => {
    motionState.reduced = true;
    renderWithProviders(<SuccessScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo("PAID") },
    });
    await waitFor(() => expect(screen.getByTestId("success-scroll")).toBeTruthy());
    expect(screen.getByText("Pembayaran Berhasil!")).toBeTruthy();
  });

  it("shows the unverified state when status is not PAID", async () => {
    renderWithProviders(<SuccessScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo("AWAITING_PAYMENT") },
    });
    await waitFor(() =>
      expect(screen.getByTestId("success-unverified")).toBeTruthy(),
    );
    expect(screen.getByText("Pembayaran belum terkonfirmasi")).toBeTruthy();
  });

  it("resets state and routes home from the paid screen", async () => {
    renderWithProviders(<SuccessScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo("PAID") },
    });
    await waitFor(() => screen.getByTestId("success-home"));
    fireEvent.press(screen.getByTestId("success-home"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
    expect(useSessionStore.getState().bookingId).toBeUndefined();
  });

  it("'Unduh E-Tiket' does NOT navigate away on native (no print dialog)", async () => {
    // Prototype success.html wires download → window.print(). On native there
    // is no print dialog (Platform.OS="ios" here), so it is a graceful no-op —
    // crucially it must NEVER navigate home (that would lose the ticket).
    renderWithProviders(<SuccessScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo("PAID") },
    });
    await waitFor(() => screen.getByTestId("success-download"));
    fireEvent.press(screen.getByTestId("success-download"));
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("'Unduh E-Tiket' calls window.print() on web and does NOT navigate", async () => {
    // Force the web branch at runtime (no react-native module mock — that
    // breaks reanimated's import). Restore OS + print after.
    const originalOS = Platform.OS;
    const originalPrint = (globalThis as { print?: () => void }).print;
    const printSpy = jest.fn();
    (Platform as { OS: string }).OS = "web";
    // The handler reads window.print; jsdom's window is globalThis here.
    (globalThis as { print?: () => void }).print = printSpy;
    (globalThis as { window?: unknown }).window = globalThis;
    try {
      renderWithProviders(<SuccessScreen bookingId="bk-1" />, {
        container: { paymentRepository: paymentRepo("PAID") },
      });
      await waitFor(() => screen.getByTestId("success-download"));
      fireEvent.press(screen.getByTestId("success-download"));
      expect(printSpy).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    } finally {
      (Platform as { OS: string }).OS = originalOS;
      (globalThis as { print?: () => void }).print = originalPrint;
    }
  });

  it("shows loading while verification is pending", () => {
    const pending: PaymentRepository = {
      createAttempt: async () => ({ attemptId: "p", bookingId: "b", status: "PAID" }),
      getStatus: () => new Promise(() => {}),
    };
    renderWithProviders(<SuccessScreen bookingId="bk-1" />, {
      container: { paymentRepository: pending },
    });
    expect(screen.getByTestId("success-loading")).toBeTruthy();
  });

  it("defaults to one e-ticket when ticketCount is unknown", async () => {
    useSessionStore.getState().reset();
    useSessionStore.getState().setPaymentMethod("QRIS", "pay-1");
    renderWithProviders(<SuccessScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo("PAID") },
    });
    await waitFor(() => expect(screen.getByTestId("eticket-0")).toBeTruthy());
    expect(screen.queryByTestId("eticket-1")).toBeNull();
  });
});
