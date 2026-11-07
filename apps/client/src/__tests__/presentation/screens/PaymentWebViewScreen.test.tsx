import { screen, waitFor } from "@testing-library/react-native";

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

// eslint-disable-next-line import/first, @typescript-eslint/no-require-imports
const RN = require("react-native") as typeof import("react-native");
// eslint-disable-next-line import/first
import {
  PaymentWebViewScreen,
  resolveWebViewNav,
} from "@presentation/screens/PaymentWebView";

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
      _m: PaymentMethod,
      _k: string,
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
      pageUrl: `/payment/${bookingId}?rb_pay_token=pgt_1`,
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

describe("PaymentWebViewScreen (RBT-062)", () => {
  const origOS = RN.Platform.OS;
  const originalMocks = process.env.EXPO_PUBLIC_USE_MOCKS;
  const originalBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const webViewMock = require("react-native-webview") as {
    __setExchangeResult: (value: string) => void;
    __injections: string[];
  };
  afterEach(() => {
    Object.defineProperty(RN.Platform, "OS", {
      value: origOS,
      configurable: true,
    });
    mockRouter.replace.mockReset();
    if (originalMocks === undefined) delete process.env.EXPO_PUBLIC_USE_MOCKS;
    else process.env.EXPO_PUBLIC_USE_MOCKS = originalMocks;
    if (originalBaseUrl === undefined)
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = originalBaseUrl;
    webViewMock.__setExchangeResult("rb-pay-exchanged");
    webViewMock.__injections.length = 0;
  });

  it("native: mints a token, mounts the WebView, exchanges on load", async () => {
    process.env.EXPO_PUBLIC_USE_MOCKS = "false";
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.example.com/api/v1";
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    const exchanged: string[] = [];
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: repo({
          exchangePageToken: async (t) => {
            exchanged.push(t);
          },
        }),
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("paywv-webview")).toBeTruthy(),
    );
    await waitFor(() => expect(webViewMock.__injections.length).toBe(1));
    expect(webViewMock.__injections[0]).toContain("payment-page-sessions");
    expect(webViewMock.__injections[0]).toContain("pgt_1");
    expect(exchanged).toEqual([]);
  });

  it("native: shows an error when the token mint fails", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: repo({
          createPageToken: async () => {
            throw new Error("boom");
          },
        }),
      },
    });
    await waitFor(() => expect(screen.getByTestId("paywv-error")).toBeTruthy());
  });

  it("web: renders the no-WebView notice (handoff not needed on web)", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "web",
      configurable: true,
    });
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: { paymentRepository: repo() },
    });
    await waitFor(() => expect(screen.getByTestId("paywv-web")).toBeTruthy());
  });

  it("native: a SNAP success return routes to the verify gate, not /success (RBT-063)", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: repo({
          createPageToken: async (bookingId: string): Promise<PageToken> => ({
            pageToken: "pgt_1",
            // The mock WebView fires onNavigationStateChange with this url.
            pageUrl: `/payment/${bookingId}?rbtest_nav=${encodeURIComponent("/success/bk-1")}`,
          }),
        }),
      },
    });
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/payment-result/bk-1"),
    );
  });

  it("native: an intermediate SNAP URL does not navigate", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: repo({
          createPageToken: async (bookingId: string): Promise<PageToken> => ({
            pageToken: "pgt_1",
            pageUrl: `/payment/${bookingId}?rbtest_nav=${encodeURIComponent("https://snap.mock/step")}`,
          }),
        }),
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("paywv-webview")).toBeTruthy(),
    );
    expect(mockRouter.replace).not.toHaveBeenCalled(); // route === null → stay
  });

  it("native: unmounting mid-mint does not set state (cleanup guard)", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const { unmount } = renderWithProviders(
      <PaymentWebViewScreen bookingId="bk-1" />,
      {
        container: {
          paymentRepository: repo({
            createPageToken: async (bookingId: string): Promise<PageToken> => {
              await gate; // hold the mint until after unmount
              return { pageToken: "pgt_1", pageUrl: `/payment/${bookingId}` };
            },
          }),
        },
      },
    );
    unmount(); // cancelled = true
    release(); // mint resolves after unmount → guarded, no state set / no throw
    await Promise.resolve();
  });

  it("native: an exchange failure surfaces the error state", async () => {
    process.env.EXPO_PUBLIC_USE_MOCKS = "false";
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.example.com/api/v1";
    webViewMock.__setExchangeResult("rb-pay-error");
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: repo({
          exchangePageToken: async () => {
            throw new Error("expired token");
          },
        }),
      },
    });
    await waitFor(() => expect(screen.getByTestId("paywv-error")).toBeTruthy());
  });
});

describe("resolveWebViewNav (RBT-062)", () => {
  it("routes a success return to the result GATE, not straight to /success (RBT-063)", () => {
    // never trust the callback — it must go through the authoritative verify.
    expect(resolveWebViewNav("https://app/success/bk-1", "bk-1")).toBe(
      "/payment-result/bk-1",
    );
  });
  it("carries attemptId into the result gate when known", () => {
    expect(resolveWebViewNav("https://app/success/bk-1", "bk-1", "a7")).toBe(
      "/payment-result/bk-1?attemptId=a7",
    );
  });
  it("routes a failed or expired return straight to /failed", () => {
    expect(resolveWebViewNav("https://app/failed?x=1", "bk-1")).toBe(
      "/failed/bk-1",
    );
    expect(resolveWebViewNav("https://app/expired/bk-1", "bk-1")).toBe(
      "/failed/bk-1",
    );
  });
  it("stays (null) for an intermediate SNAP URL", () => {
    expect(resolveWebViewNav("https://snap.mock/bk-1/step", "bk-1")).toBeNull();
  });
});
