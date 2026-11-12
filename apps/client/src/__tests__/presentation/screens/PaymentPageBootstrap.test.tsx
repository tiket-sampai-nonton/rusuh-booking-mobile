import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  PageToken,
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line import/first
import { PaymentPageBootstrap } from "@presentation/screens/PaymentPageBootstrap";

function repo(over: Partial<PaymentRepository> = {}): PaymentRepository {
  return {
    getPaymentPage: async (bookingId): Promise<PaymentPage> => ({
      bookingId,
      methods: ["QRIS"],
      amountMinor: 1,
      paymentExpiresAt: "",
      serverTime: "",
    }),
    createAttempt: async (
      bookingId: string,
      _method: PaymentMethod,
      _key: string,
    ): Promise<PaymentAttempt> => ({
      attemptId: "a",
      bookingId,
      status: "AWAITING_PAYMENT",
    }),
    getStatus: async (): Promise<PaymentAttempt> => ({
      attemptId: "a",
      bookingId: "b",
      status: "PAID",
    }),
    createPageToken: async (bookingId: string): Promise<PageToken> => ({
      pageToken: "pgt_1",
      pageUrl: `/pay/${bookingId}?ppt=pgt_1&embedded=1`,
    }),
    exchangePageToken: async (): Promise<void> => {},
    snapCallback: async (attemptId: string): Promise<PaymentAttempt> => ({
      attemptId,
      bookingId: "b",
      status: "PAID",
    }),
    ...over,
  };
}

describe("PaymentPageBootstrap", () => {
  const originalMocks = process.env.EXPO_PUBLIC_USE_MOCKS;
  const originalBridge = (
    globalThis as typeof globalThis & {
      ReactNativeWebView?: { postMessage: (message: string) => void };
    }
  ).ReactNativeWebView;

  afterEach(() => {
    mockRouter.replace.mockReset();
    if (originalMocks === undefined) delete process.env.EXPO_PUBLIC_USE_MOCKS;
    else process.env.EXPO_PUBLIC_USE_MOCKS = originalMocks;
    if (originalBridge === undefined) {
      delete (
        globalThis as typeof globalThis & {
          ReactNativeWebView?: { postMessage: (message: string) => void };
        }
      ).ReactNativeWebView;
    } else {
      (
        globalThis as typeof globalThis & {
          ReactNativeWebView?: { postMessage: (message: string) => void };
        }
      ).ReactNativeWebView = originalBridge;
    }
  });

  it("exchanges the token once and routes to the existing payment page", async () => {
    process.env.EXPO_PUBLIC_USE_MOCKS = "false";
    const exchanged: string[] = [];
    renderWithProviders(
      <React.StrictMode>
        <PaymentPageBootstrap bookingId="bk-1" pageToken="pgt_1" />
      </React.StrictMode>,
      {
        container: {
          paymentRepository: repo({
            exchangePageToken: async (pageToken) => {
              exchanged.push(pageToken);
            },
          }),
        },
      },
    );

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/payment/bk-1"),
    );
    expect(exchanged).toEqual(["pgt_1"]);
  });

  it("shows a recoverable error and notifies a native WebView host", async () => {
    process.env.EXPO_PUBLIC_USE_MOCKS = "false";
    const postMessage = jest.fn();
    (
      globalThis as typeof globalThis & {
        ReactNativeWebView?: { postMessage: (message: string) => void };
      }
    ).ReactNativeWebView = { postMessage };
    renderWithProviders(
      <PaymentPageBootstrap bookingId="bk-1" pageToken="pgt_1" />,
      {
        container: {
          paymentRepository: repo({
            exchangePageToken: async () => {
              throw new Error("expired token");
            },
          }),
        },
      },
    );

    await waitFor(() => expect(screen.getByTestId("paywv-error")).toBeTruthy());
    expect(postMessage).toHaveBeenCalledWith("rb-pay-error");
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("does not call the repository when the BE URL omitted its token", async () => {
    process.env.EXPO_PUBLIC_USE_MOCKS = "false";
    const exchangePageToken = jest.fn();
    renderWithProviders(
      <PaymentPageBootstrap bookingId="bk-1" pageToken={undefined} />,
      { container: { paymentRepository: repo({ exchangePageToken }) } },
    );

    await waitFor(() => expect(screen.getByTestId("paywv-error")).toBeTruthy());
    expect(exchangePageToken).not.toHaveBeenCalled();
  });

  it("allows retrying a failed browser-context exchange", async () => {
    process.env.EXPO_PUBLIC_USE_MOCKS = "false";
    let attempts = 0;
    renderWithProviders(
      <PaymentPageBootstrap bookingId="bk-1" pageToken="pgt_1" />,
      {
        container: {
          paymentRepository: repo({
            exchangePageToken: async () => {
              attempts += 1;
              if (attempts === 1) throw new Error("temporary network failure");
            },
          }),
        },
      },
    );

    const retry = await screen.findByTestId("paywv-retry");
    fireEvent.press(retry);
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/payment/bk-1"),
    );
    expect(attempts).toBe(2);
  });

  it("bypasses the API session exchange for development mocks", async () => {
    process.env.EXPO_PUBLIC_USE_MOCKS = "true";
    const exchangePageToken = jest.fn();
    renderWithProviders(
      <PaymentPageBootstrap bookingId="bk-1" pageToken="mock-token" />,
      { container: { paymentRepository: repo({ exchangePageToken }) } },
    );

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/payment/bk-1"),
    );
    expect(exchangePageToken).not.toHaveBeenCalled();
  });
});
