import { act, screen, waitFor } from "@testing-library/react-native";

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
  resolvePaymentPageUrl,
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

describe("PaymentWebViewScreen (RBT-062)", () => {
  const origOS = RN.Platform.OS;
  const originalSiteUrl = process.env.EXPO_PUBLIC_SITE_URL;
  const webViewMock = require("react-native-webview") as {
    __sendMessage: (value: string) => void;
  };
  afterEach(() => {
    Object.defineProperty(RN.Platform, "OS", {
      value: origOS,
      configurable: true,
    });
    mockRouter.replace.mockReset();
    if (originalSiteUrl === undefined) delete process.env.EXPO_PUBLIC_SITE_URL;
    else process.env.EXPO_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("native: mints a token and opens the validated bootstrap route", async () => {
    process.env.EXPO_PUBLIC_SITE_URL = "https://rusuh-booking.pages.dev";
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: { paymentRepository: repo() },
    });
    await waitFor(() =>
      expect(screen.getByTestId("paywv-webview")).toBeTruthy(),
    );
    expect(screen.getByTestId("paywv-webview").props.accessibilityLabel).toBe(
      "https://rusuh-booking.pages.dev/pay/bk-1?ppt=pgt_1&embedded=1",
    );
  });

  it("resolves BE site-relative pay URLs against the configured site origin", () => {
    expect(
      resolvePaymentPageUrl(
        "/pay/bk-1?ppt=one-time&embedded=1",
        "bk-1",
        "one-time",
        "https://rusuh-booking.pages.dev/",
      ),
    ).toBe("https://rusuh-booking.pages.dev/pay/bk-1?ppt=one-time&embedded=1");
  });

  it("accepts same-origin absolute URLs and rejects unsafe origins and protocols", () => {
    expect(
      resolvePaymentPageUrl(
        "https://rusuh-booking.pages.dev/pay/bk-1?ppt=one-time&embedded=1",
        "bk-1",
        "one-time",
        "https://rusuh-booking.pages.dev",
      ),
    ).toBe("https://rusuh-booking.pages.dev/pay/bk-1?ppt=one-time&embedded=1");
    expect(() =>
      resolvePaymentPageUrl(
        "https://attacker.example/pay/bk-1?ppt=one-time",
        "bk-1",
        "one-time",
        "https://rusuh-booking.pages.dev",
      ),
    ).toThrow("Payment page URL must use the configured site origin");
    expect(() =>
      resolvePaymentPageUrl("javascript:alert(1)", "bk-1", "one-time"),
    ).toThrow("Payment page URL must use HTTPS");
    expect(() =>
      resolvePaymentPageUrl("/pay/bk-2?ppt=one-time", "bk-1", "one-time"),
    ).toThrow("Payment page URL must point to this booking");
    expect(() =>
      resolvePaymentPageUrl("/pay/bk-1?ppt=other", "bk-1", "one-time"),
    ).toThrow("Payment page URL must carry its one-time page token");
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
    const createPageToken = jest.fn();
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: { paymentRepository: repo({ createPageToken }) },
    });
    await waitFor(() => expect(screen.getByTestId("paywv-web")).toBeTruthy());
    expect(createPageToken).not.toHaveBeenCalled();
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
            pageUrl: `/pay/${bookingId}?ppt=pgt_1&embedded=1&rbtest_nav=${encodeURIComponent("https://rusuh-booking.pages.dev/success/bk-1")}`,
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
            pageUrl: `/pay/${bookingId}?ppt=pgt_1&embedded=1&rbtest_nav=${encodeURIComponent("https://snap.mock/step")}`,
          }),
        }),
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("paywv-webview")).toBeTruthy(),
    );
    expect(mockRouter.replace).not.toHaveBeenCalled(); // route === null → stay
  });

  it("does not route a payment callback for another booking", () => {
    expect(
      resolveWebViewNav(
        "https://rusuh-booking.pages.dev/success/another-booking",
        "bk-1",
      ),
    ).toBeNull();
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
              return {
                pageToken: "pgt_1",
                pageUrl: `/pay/${bookingId}?ppt=pgt_1&embedded=1`,
              };
            },
          }),
        },
      },
    );
    unmount(); // cancelled = true
    release(); // mint resolves after unmount → guarded, no state set / no throw
    await Promise.resolve();
  });

  it("native: a page-token mint failure offers a fresh retry", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: repo({
          createPageToken: async () => {
            throw new Error("expired token");
          },
        }),
      },
    });
    await waitFor(() => expect(screen.getByTestId("paywv-error")).toBeTruthy());
  });

  it("native: displays a recoverable message from the same-origin bootstrap", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: { paymentRepository: repo() },
    });
    await waitFor(() =>
      expect(screen.getByTestId("paywv-webview")).toBeTruthy(),
    );
    act(() => webViewMock.__sendMessage("rb-pay-error"));
    await waitFor(() => expect(screen.getByTestId("paywv-error")).toBeTruthy());
  });
});

describe("resolveWebViewNav (RBT-062)", () => {
  it("routes a success return to the result GATE, not straight to /success (RBT-063)", () => {
    // never trust the callback — it must go through the authoritative verify.
    expect(
      resolveWebViewNav(
        "https://app/success/bk-1",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBe("/payment-result/bk-1");
  });
  it("carries attemptId into the result gate when known", () => {
    expect(
      resolveWebViewNav(
        "https://app/success/bk-1",
        "bk-1",
        "a7",
        "https://app",
      ),
    ).toBe("/payment-result/bk-1?attemptId=a7");
  });
  it("routes a failed or expired return straight to /failed", () => {
    expect(
      resolveWebViewNav(
        "https://app/failed?x=1",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBe("/failed/bk-1");
    expect(
      resolveWebViewNav(
        "https://app/expired/bk-1",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBe("/failed/bk-1");
  });
  it("stays (null) for an intermediate SNAP URL", () => {
    expect(
      resolveWebViewNav(
        "https://snap.mock/bk-1/step",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBeNull();
    expect(
      resolveWebViewNav(
        "https://attacker.example/success/bk-1",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBeNull();
  });
});
