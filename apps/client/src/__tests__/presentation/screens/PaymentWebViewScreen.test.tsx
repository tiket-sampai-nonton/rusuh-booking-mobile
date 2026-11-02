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
    ): Promise<PaymentAttempt> => ({ attemptId: "a", bookingId, status: "AWAITING_PAYMENT" }),
    getStatus: async (): Promise<PaymentAttempt> => ({ attemptId: "a", bookingId: "b", status: "PAID" }),
    createPageToken: async (bookingId: string): Promise<PageToken> => ({
      pageToken: "pgt_1",
      pageUrl: `/payment/${bookingId}?rb_pay_token=pgt_1`,
    }),
    exchangePageToken: async (): Promise<void> => {},
    ...over,
  };
}

describe("PaymentWebViewScreen (RBT-062)", () => {
  const origOS = RN.Platform.OS;
  afterEach(() => {
    Object.defineProperty(RN.Platform, "OS", { value: origOS, configurable: true });
    mockRouter.replace.mockReset();
  });

  it("native: mints a token, mounts the WebView, exchanges on load", async () => {
    Object.defineProperty(RN.Platform, "OS", { value: "ios", configurable: true });
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
    await waitFor(() => expect(screen.getByTestId("paywv-webview")).toBeTruthy());
    // The mocked WebView fires onLoadEnd once → token exchanged.
    await waitFor(() => expect(exchanged).toEqual(["pgt_1"]));
  });

  it("native: shows an error when the token mint fails", async () => {
    Object.defineProperty(RN.Platform, "OS", { value: "ios", configurable: true });
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
    Object.defineProperty(RN.Platform, "OS", { value: "web", configurable: true });
    renderWithProviders(<PaymentWebViewScreen bookingId="bk-1" />, {
      container: { paymentRepository: repo() },
    });
    await waitFor(() => expect(screen.getByTestId("paywv-web")).toBeTruthy());
  });

  it("native: a SNAP success return routes to /success", async () => {
    Object.defineProperty(RN.Platform, "OS", { value: "ios", configurable: true });
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
      expect(mockRouter.replace).toHaveBeenCalledWith("/success/bk-1"),
    );
  });

  it("native: an intermediate SNAP URL does not navigate", async () => {
    Object.defineProperty(RN.Platform, "OS", { value: "ios", configurable: true });
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
    await waitFor(() => expect(screen.getByTestId("paywv-webview")).toBeTruthy());
    expect(mockRouter.replace).not.toHaveBeenCalled(); // route === null → stay
  });

  it("native: unmounting mid-mint does not set state (cleanup guard)", async () => {
    Object.defineProperty(RN.Platform, "OS", { value: "ios", configurable: true });
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
    Object.defineProperty(RN.Platform, "OS", { value: "ios", configurable: true });
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
  it("routes a success return to /success", () => {
    expect(resolveWebViewNav("https://app/success/bk-1", "bk-1")).toBe("/success/bk-1");
  });
  it("routes a failed or expired return to /expired", () => {
    expect(resolveWebViewNav("https://app/failed?x=1", "bk-1")).toBe("/expired/bk-1");
    expect(resolveWebViewNav("https://app/expired/bk-1", "bk-1")).toBe("/expired/bk-1");
  });
  it("stays (null) for an intermediate SNAP URL", () => {
    expect(resolveWebViewNav("https://snap.mock/bk-1/step", "bk-1")).toBeNull();
  });
});
