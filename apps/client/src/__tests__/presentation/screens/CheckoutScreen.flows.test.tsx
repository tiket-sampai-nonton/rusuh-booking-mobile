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
import { BOOKING_CATEGORY_FIXTURE } from "@shared/test-fixtures/booking-categories.fixture";

const mockRouter = { push: jest.fn(), replace: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));
jest.mock("@presentation/hooks/useServerCountdown", () => {
  const { useEffect, useRef } = jest.requireActual("react");
  return {
    useServerCountdown: ({
      expiresAtIso,
      serverTimeIso,
      onExpire,
    }: {
      expiresAtIso?: string;
      serverTimeIso?: string;
      onExpire?: () => void;
    }) => {
      const deadline = expiresAtIso ? Date.parse(expiresAtIso) : 0;
      const serverNow = serverTimeIso ? Date.parse(serverTimeIso) : deadline;
      const expired = Boolean(expiresAtIso && deadline <= serverNow);
      const fired = useRef(false);
      useEffect(() => {
        if (!expired) {
          fired.current = false;
        } else if (!fired.current) {
          fired.current = true;
          onExpire?.();
        }
      }, [expired, onExpire]);
      return { remainingMs: Math.max(0, deadline - serverNow), expired };
    },
  };
});

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
  categories: BOOKING_CATEGORY_FIXTURE,
};

function bookingRepo(session: BookingSession | null): BookingRepository {
  return {
    createSession: async () => session as BookingSession,
    getCurrentSession: async () => session,
    checkAttendee: async (): Promise<AttendeeCheck> => ({
      nikMasked: "31****01",
      result: "AVAILABLE",
    }),
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
function attendeeVerdict(nik: string): AttendeeCheck["result"] {
  if (nik.endsWith("00")) return "ALREADY_REGISTERED";
  if (nik.endsWith("99")) return "CHECK_LIMIT_REACHED";
  return "AVAILABLE";
}

function verdictRepo(session: BookingSession | null): BookingRepository {
  return {
    ...bookingRepo(session),
    checkAttendee: async (_s, nik): Promise<AttendeeCheck> => ({
      nikMasked: "31****01",
      result: attendeeVerdict(nik),
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
    // The countdown hook is mocked here; use waitFor to flush attendee debounce
    // and async repository responses through Testing Library's act boundaries.
    jest.useFakeTimers();
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
    useAccountStore.getState().clearProfile(); // default: guest
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // ---- RBT-052: attendee checks + inline consent ----

  it("a guest sees the missing-consent error when submitting before ticking it", async () => {
    const hold = jest.fn(async () => ({
      bookingId: "b1",
      sessionId: "sess-1",
      status: "HELD" as const,
      amountMinor: 1,
    }));
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: { ...verdictRepo(SESSION), hold } },
    });
    await waitFor(() =>
      expect(screen.getByTestId("checkout-consent")).toBeTruthy(),
    );
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(
      screen.getByTestId("buyer-email-confirmation"),
      "buyer@mail.com",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-name-0"),
      "Penonton Satu",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-nik-0"),
      "3171010101010001",
    );
    await waitFor(
      () =>
        expect(screen.getByTestId("attendee-status-0").props.children).toMatch(
          /tersedia/i,
        ),
      { timeout: 3000 },
    );
    expect(
      screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
    ).toBe(false);
    fireEvent.press(screen.getByTestId("checkout-submit"));
    expect(screen.getByTestId("checkout-consent-error").props.children).toMatch(
      /persetujuan diperlukan/i,
    );
    expect(hold).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId("checkout-consent")); // give consent
    expect(screen.queryByTestId("checkout-consent-error")).toBeNull();
    expect(
      screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
    ).toBe(false);
    expect(screen.getByText("Lanjut Bayar")).toBeTruthy();
  });

  it("a logged-in user skips the inline consent gate", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: verdictRepo(SESSION) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    expect(screen.queryByTestId("checkout-consent")).toBeNull();
  });

  it("an ALREADY_REGISTERED attendee shows its status and does not hold", async () => {
    const hold = jest.fn(async () => ({
      bookingId: "b1",
      sessionId: "sess-1",
      status: "HELD" as const,
      amountMinor: 1,
    }));
    useAccountStore.getState().setProfile(LOGGED_IN);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: { ...verdictRepo(SESSION), hold } },
    });
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(
      screen.getByTestId("buyer-email-confirmation"),
      "buyer@mail.com",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-name-0"),
      "Penonton Satu",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-nik-0"),
      "3171010101010100",
    );
    await waitFor(
      () =>
        expect(screen.getByTestId("attendee-status-0").props.children).toMatch(
          /sudah terdaftar/i,
        ),
      { timeout: 3000 },
    );
    expect(
      screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
    ).toBe(false);
    fireEvent.press(screen.getByTestId("checkout-submit"));
    expect(hold).not.toHaveBeenCalled();
  });

  it("CHECK_LIMIT_REACHED warns but still allows submit", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: verdictRepo(SESSION) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(
      screen.getByTestId("buyer-email-confirmation"),
      "buyer@mail.com",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-name-0"),
      "Penonton Satu",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-nik-0"),
      "3171010101010199",
    );
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

  // ---- Checkout buyer details + confirm-leave ----

  it("shows an account badge and asks for an unmasked email", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("prefill-badge")).toBeTruthy(),
    );
    expect(screen.getByTestId("buyer-email").props.value).toBe("");
  });

  it("back opens the confirm-leave dialog; leaving re-queues to home", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("checkout-back")).toBeTruthy(),
    );
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

  it("submit includes buyer details in the booking hold", async () => {
    useAccountStore.getState().setProfile(LOGGED_IN);
    const calls: [string, string, string][] = [];
    const repo: BookingRepository = {
      ...verdictRepo(SESSION),
      hold: async (s, _items, _key, buyer) => {
        calls.push([s, buyer?.nik ?? "", buyer?.email ?? ""]);
        return {
          bookingId: "b1",
          sessionId: s,
          status: "HELD",
          amountMinor: 0,
        };
      },
    };
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: repo },
    });
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(
      screen.getByTestId("buyer-email-confirmation"),
      "buyer@mail.com",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-name-0"),
      "Penonton Satu",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-nik-0"),
      "3171010101010001",
    );
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
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(
      screen.getByTestId("buyer-email-confirmation"),
      "buyer@mail.com",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-name-0"),
      "Penonton Satu",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-nik-0"),
      "3171010101010001",
    );
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
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(
      screen.getByTestId("buyer-email-confirmation"),
      "buyer@mail.com",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-name-0"),
      "Penonton Satu",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-nik-0"),
      "3171010101010001",
    );
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
