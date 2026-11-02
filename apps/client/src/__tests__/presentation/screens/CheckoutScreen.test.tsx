import { fireEvent, screen, waitFor } from "@testing-library/react-native";

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
  expiresAt: "2999-01-01T00:00:00.000Z", // far future → no expiry during test
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

describe("CheckoutScreen — item list + quantity rules (RBT-051)", () => {
  beforeEach(() => {
    // Fake timers (auto-advancing) stop the 1s server-countdown setInterval from
    // spinning a real wall-clock loop per mount — that accumulation OOMs the
    // suite on the memory-tight CI host. waitFor still flushes via microtasks.
    jest.useFakeTimers({ advanceTimers: true });
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
    useAccountStore.getState().clearProfile(); // default: guest
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders one ticket row by default (min 1)", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("ticket-row-0")).toBeTruthy());
    expect(screen.queryByTestId("ticket-row-1")).toBeNull();
  });

  it("adds rows up to the cap (3) then disables the add control", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket"));
    fireEvent.press(screen.getByTestId("add-ticket"));
    await waitFor(() => expect(screen.getByTestId("ticket-row-2")).toBeTruthy());
    // 4th add is capped: pressing again does not create row-3.
    fireEvent.press(screen.getByTestId("add-ticket"));
    expect(screen.queryByTestId("ticket-row-3")).toBeNull();
  });

  it("removes a row (back down toward min 1)", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket"));
    await waitFor(() => expect(screen.getByTestId("ticket-row-1")).toBeTruthy());
    fireEvent.press(screen.getByTestId("remove-ticket-1"));
    await waitFor(() => expect(screen.queryByTestId("ticket-row-1")).toBeNull());
  });

  it("honors a lower maxSelectable from the session (cap 2)", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo({ ...SESSION, maxSelectable: 2 }) },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket")); // → 2 rows (at cap)
    await waitFor(() => expect(screen.getByTestId("ticket-row-1")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket")); // capped at 2
    expect(screen.queryByTestId("ticket-row-2")).toBeNull();
  });

  it("selecting a category + filling valid buyer/attendee enables Lanjut Bayar", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("ticket-row-0")).toBeTruthy());
    // Submit starts disabled (empty buyer/attendee).
    expect(screen.getByTestId("checkout-submit").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.press(screen.getByTestId("cat-0-VIP")); // pick VIP category
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Penonton Satu");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), "3171010101010001");
    fireEvent.press(screen.getByTestId("checkout-consent")); // guest consent (RBT-052)

    await waitFor(() =>
      expect(
        screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
      ).toBe(false),
    );
  });

  it("toggling 'use buyer NIK' fills the row from the buyer (single-use)", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("use-buyer-0")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent(screen.getByTestId("use-buyer-0"), "valueChange", true);
    fireEvent.press(screen.getByTestId("checkout-consent")); // guest consent (RBT-052)
    // With the buyer attending row-0, the order is ready (buyer NIK valid).
    await waitFor(() =>
      expect(
        screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
      ).toBe(false),
    );
  });

  it("buyer-NIK switch is single-use: turning it on for a 2nd row clears the 1st", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket")); // 2 rows
    await waitFor(() => expect(screen.getByTestId("use-buyer-1")).toBeTruthy());
    fireEvent(screen.getByTestId("use-buyer-0"), "valueChange", true);
    expect(screen.getByTestId("use-buyer-0").props.value).toBe(true);
    // Turning it on for row-1 must turn row-0 off (single-use across rows).
    fireEvent(screen.getByTestId("use-buyer-1"), "valueChange", true);
    await waitFor(() =>
      expect(screen.getByTestId("use-buyer-1").props.value).toBe(true),
    );
    expect(screen.getByTestId("use-buyer-0").props.value).toBe(false);
    // Turning row-1 back off leaves both off.
    fireEvent(screen.getByTestId("use-buyer-1"), "valueChange", false);
    await waitFor(() =>
      expect(screen.getByTestId("use-buyer-1").props.value).toBe(false),
    );
  });

  it("editing one row's attendee leaves the other rows untouched (patch by index)", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket")); // 2 rows
    await waitFor(() => expect(screen.getByTestId("attendee-name-1")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Penonton A");
    fireEvent.changeText(screen.getByTestId("attendee-name-1"), "Penonton B");
    // Each row kept its own value (patchRow matches only the edited index).
    expect(screen.getByTestId("attendee-name-0").props.value).toBe("Penonton A");
    expect(screen.getByTestId("attendee-name-1").props.value).toBe("Penonton B");
  });

  it("refuses to remove the last row (stays at min 1)", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket")); // 2 rows
    await waitFor(() => expect(screen.getByTestId("remove-ticket-1")).toBeTruthy());
    fireEvent.press(screen.getByTestId("remove-ticket-1")); // back to 1
    await waitFor(() => expect(screen.queryByTestId("ticket-row-1")).toBeNull());
    // The lone row has no remove control, so the min-1 guard holds.
    expect(screen.queryByTestId("remove-ticket-0")).toBeNull();
    expect(screen.getByTestId("ticket-row-0")).toBeTruthy();
  });

  it("shows a loading state while the session restores", async () => {
    let release!: (s: BookingSession | null) => void;
    const gate = new Promise<BookingSession | null>((r) => (release = r));
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: {
        bookingRepository: {
          ...bookingRepo(SESSION),
          getCurrentSession: () => gate,
        },
      },
    });
    expect(screen.getByTestId("checkout-loading")).toBeTruthy();
    release(SESSION);
    await waitFor(() =>
      expect(screen.queryByTestId("checkout-loading")).toBeNull(),
    );
  });

  it("renders the hero when a session is restored", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByText("Pilih tiketmu")).toBeTruthy());
  });

  it("renders without the hero when no session is restored", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(null) },
    });
    // Loading clears → the add-ticket control appears (post-restore render),
    // and the session-dependent hero stays absent (false arm of the ternary).
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    expect(screen.queryByText("Pilih tiketmu")).toBeNull();
    expect(screen.getByTestId("ticket-row-0")).toBeTruthy();
  });

  it("shows the NIK-format error when the buyer NIK is too short", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("buyer-nik")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "123"); // < 16 digits
    await waitFor(() =>
      expect(screen.getByText("NIK harus 16 digit.")).toBeTruthy(),
    );
  });

  it("redirects to /expired when the server countdown elapses", async () => {
    const past: BookingSession = {
      ...SESSION,
      expiresAt: "2026-12-01T00:00:00.000Z",
      serverTime: "2026-12-01T00:10:00.000Z", // serverTime already past expiry
    };
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(past) },
    });
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/expired/sess-1"),
    );
  });
});
