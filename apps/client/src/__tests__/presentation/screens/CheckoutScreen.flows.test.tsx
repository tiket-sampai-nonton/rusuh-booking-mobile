import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { mapError } from "@domain/errors/error-mapper";
import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn(), replace: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line import/first
import { CheckoutScreen } from "@presentation/screens/Checkout";
// eslint-disable-next-line import/first
import { useAccountStore } from "@presentation/stores/account-store";

const SESSION: BookingSession = {
  sessionId: "sess-1",
  eventId: "evt-1",
  expiresAt: "2999-01-01T00:00:00.000Z",
  serverTime: "2026-12-01T00:00:00.000Z",
  maxSelectable: 3,
};

function bookingRepo(session: BookingSession | null): BookingRepository {
  return {
    createSession: async () => session as BookingSession,
    getCurrentSession: async () => session,
    checkAttendee: async (): Promise<AttendeeCheck> => ({
      nikMasked: "31****01",
      result: "AVAILABLE",
    }),
    setBuyer: async (): Promise<void> => {},
    hold: async (
      _s: string,
      _i: readonly BookingItemInput[],
      _k: string,
    ): Promise<Booking> => ({
      bookingId: "b1",
      sessionId: "sess-1",
      status: "HELD",
      amountMinor: 1,
    }),
  };
}

/** A repo whose checkAttendee mirrors the mock's suffix rule (...00 blocks). */
function verdictRepo(session: BookingSession | null): BookingRepository {
  return {
    ...bookingRepo(session),
    checkAttendee: async (_s, nik): Promise<AttendeeCheck> => ({
      nikMasked: "31****01",
      result: nik.endsWith("00")
        ? "ALREADY_REGISTERED"
        : nik.endsWith("99")
          ? "CHECK_LIMIT_REACHED"
          : "AVAILABLE",
    }),
  };
}

const LOGGED_IN = {
  fullName: "Rizky",
  emailMasked: "ri****@mail.com",
  nikMasked: "31****01",
  hasNik: true,
};

describe("CheckoutScreen — attendee checks + consent + buyer (RBT-052/053)", () => {
  beforeEach(() => {
    // Auto-advancing fake timers: tame the countdown interval + the attendee
    // debounce so neither spins real loops accumulating heap across mounts.
    jest.useFakeTimers({ advanceTimers: true });
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
    useAccountStore.getState().clearProfile(); // default: guest
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ---- RBT-052: attendee checks + inline consent ----

  it("a guest sees the inline consent gate and cannot submit until it is ticked", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: verdictRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("checkout-consent")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Penonton Satu");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), "3171010101010001");
    await waitFor(
      () =>
        expect(screen.getByTestId("attendee-status-0").props.children).toMatch(
          /tersedia/i,
        ),
      { timeout: 3000 },
    );
    await waitFor(() =>
      expect(
        screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
      ).toBe(true),
    );
    fireEvent.press(screen.getByTestId("checkout-consent")); // give consent
    await waitFor(() =>
      expect(
        screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
      ).toBe(false),
    );
    expect(screen.getByText("Lanjut Bayar")).toBeTruthy();
  });

  it("a logged-in user skips the inline consent gate", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: verdictRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("ticket-row-0")).toBeTruthy());
    expect(screen.queryByTestId("checkout-consent")).toBeNull();
  });

  it("an ALREADY_REGISTERED attendee NIK blocks submit and shows the status", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: verdictRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("ticket-row-0")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Penonton Satu");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), "3171010101010100");
    await waitFor(
      () =>
        expect(screen.getByTestId("attendee-status-0").props.children).toMatch(
          /sudah terdaftar/i,
        ),
      { timeout: 3000 },
    );
    expect(
      screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
    ).toBe(true);
  });

  it("CHECK_LIMIT_REACHED warns but still allows submit", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: verdictRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("ticket-row-0")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Penonton Satu");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), "3171010101010199");
    await waitFor(
      () =>
        expect(screen.getByTestId("attendee-status-0").props.children).toMatch(
          /Batas pengecekan/i,
        ),
      { timeout: 3000 },
    );
    await waitFor(
      () =>
        expect(
          screen.getByTestId("checkout-submit").props.accessibilityState
            .disabled,
        ).toBe(false),
      { timeout: 3000 },
    );
  });

  // ---- RBT-053: buyer prefill + set-buyer + confirm-leave ----

  it("shows the 'Terisi dari akun' badge and prefills email for a logged-in user", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("prefill-badge")).toBeTruthy());
    expect(screen.getByTestId("buyer-email").props.value).toBe("ri****@mail.com");
  });

  it("back opens the confirm-leave dialog; leaving re-queues to home", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("checkout-back")).toBeTruthy());
    fireEvent.press(screen.getByTestId("checkout-back"));
    await waitFor(() =>
      expect(screen.getByTestId("checkout-leave-modal")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("checkout-stay"));
    await waitFor(() =>
      expect(screen.queryByTestId("checkout-leave-modal")).toBeNull(),
    );
    fireEvent.press(screen.getByTestId("checkout-back"));
    await waitFor(() =>
      expect(screen.getByTestId("checkout-leave-confirm")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("checkout-leave-confirm"));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
  });

  it("submit persists the buyer via setBuyer (RBT-053)", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    const calls: [string, string, string][] = [];
    const repo: BookingRepository = {
      ...verdictRepo(SESSION),
      setBuyer: async (s, nik, email) => {
        calls.push([s, nik, email]);
      },
    };
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: repo },
    });
    await waitFor(() => expect(screen.getByTestId("ticket-row-0")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Penonton Satu");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), "3171010101010001");
    await waitFor(
      () =>
        expect(
          screen.getByTestId("checkout-submit").props.accessibilityState
            .disabled,
        ).toBe(false),
      { timeout: 3000 },
    );
    fireEvent.press(screen.getByTestId("checkout-submit"));
    await waitFor(() =>
      expect(calls).toEqual([["sess-1", "3171999999999999", "buyer@mail.com"]]),
    );
  });

  // ---- RBT-054: idempotent hold → payment / conflict ----

  it("submit holds and redirects to the payment page (RBT-054)", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: verdictRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("ticket-row-0")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Penonton Satu");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), "3171010101010001");
    await waitFor(
      () =>
        expect(
          screen.getByTestId("checkout-submit").props.accessibilityState
            .disabled,
        ).toBe(false),
      { timeout: 3000 },
    );
    fireEvent.press(screen.getByTestId("checkout-submit"));
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/payment/b1"),
    );
  });

  it("a hold conflict shows the mapped Bahasa error and does NOT navigate (FR-16)", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    const repo: BookingRepository = {
      ...verdictRepo(SESSION),
      hold: async () => {
        throw mapError({ code: "CATEGORY_UNAVAILABLE" });
      },
    };
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: repo },
    });
    await waitFor(() => expect(screen.getByTestId("ticket-row-0")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Penonton Satu");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), "3171010101010001");
    await waitFor(
      () =>
        expect(
          screen.getByTestId("checkout-submit").props.accessibilityState
            .disabled,
        ).toBe(false),
      { timeout: 3000 },
    );
    fireEvent.press(screen.getByTestId("checkout-submit"));
    await waitFor(() =>
      expect(screen.getByText(/sudah tidak tersedia/i)).toBeTruthy(),
    );
    expect(mockRouter.replace).not.toHaveBeenCalledWith(
      expect.stringContaining("/payment/"),
    );
  });
});
