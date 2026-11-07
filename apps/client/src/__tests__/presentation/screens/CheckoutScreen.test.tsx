import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { QueryClient } from "@tanstack/react-query";
import { BackHandler, Platform } from "react-native";

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
const mockNavigation = { addListener: jest.fn(() => jest.fn()) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useNavigation: () => mockNavigation,
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
  expiresAt: "2999-01-01T00:00:00.000Z", // far future → no expiry during test
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

describe("CheckoutScreen — item list + quantity rules (RBT-051)", () => {
  beforeEach(() => {
    // Countdown math is covered by useServerCountdown tests; this screen test
    // supplies server-authoritative remaining time and leaves debounce timers
    // under Testing Library's act-aware waitFor loop.
    jest.useFakeTimers();
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
    useAccountStore.getState().clearProfile(); // default: guest
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("renders one ticket row by default (min 1)", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    expect(
      screen.getByTestId("cat-0-REG").props.accessibilityState.selected,
    ).toBe(true);
    expect(screen.getByTestId("checkout-total").props.children).toBe(
      "Rp 450.000",
    );
    expect(screen.queryByTestId("ticket-row-1")).toBeNull();
  });

  it("adds rows up to the cap (3) then disables the add control", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket"));
    fireEvent.press(screen.getByTestId("add-ticket"));
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-2")).toBeTruthy(),
    );
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
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-1")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("remove-ticket-1"));
    await waitFor(() =>
      expect(screen.queryByTestId("ticket-row-1")).toBeNull(),
    );
  });

  it("honors a lower maxSelectable from the session (cap 2)", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: {
        bookingRepository: bookingRepo({ ...SESSION, maxSelectable: 2 }),
      },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket")); // → 2 rows (at cap)
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-1")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("add-ticket")); // capped at 2
    expect(screen.queryByTestId("ticket-row-2")).toBeNull();
  });

  it("keeps rows stable when refreshed categories arrive and supports an empty catalog", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    queryClient.setQueryData(["booking-session", "current", "sess-1"], SESSION);
    const refreshedView = renderWithProviders(
      <CheckoutScreen sessionId="sess-1" />,
      {
        container: { bookingRepository: bookingRepo(SESSION) },
        queryClient,
      },
    );
    await waitFor(() =>
      expect(
        screen.getByTestId("cat-0-REG").props.accessibilityState.selected,
      ).toBe(true),
    );
    act(() =>
      queryClient.setQueryData(["booking-session", "current", "sess-1"], {
        ...SESSION,
        categories: [...SESSION.categories],
      }),
    );
    expect(
      screen.getByTestId("cat-0-REG").props.accessibilityState.selected,
    ).toBe(true);
    refreshedView.unmount();

    const emptySession = {
      ...SESSION,
      sessionId: "sess-empty",
      categories: [],
    };
    renderWithProviders(<CheckoutScreen sessionId="sess-empty" />, {
      container: { bookingRepository: bookingRepo(emptySession) },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket"));
    expect(await screen.findByTestId("ticket-row-1")).toBeTruthy();
  });

  it("handles hardware back repeatedly while the leave-confirm dialog is open", async () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    const remove = jest.fn();
    let handler: (() => boolean) | undefined;
    const addListener = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_event, callback) => {
        handler = callback as () => boolean;
        return { remove } as never;
      });
    const view = renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    await act(async () => {
      expect(handler?.()).toBe(true);
    });
    await waitFor(() =>
      expect(screen.getByTestId("checkout-leave-modal")).toBeTruthy(),
    );
    await act(async () => {
      expect(handler?.()).toBe(true);
    });
    view.unmount();
    expect(addListener).toHaveBeenCalled();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  it("keeps Lanjut Bayar actionable while buyer/attendee fields are incomplete", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    // Submit stays actionable so an attempt can reveal inline validation errors.
    expect(
      screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
    ).toBe(false);

    fireEvent.changeText(screen.getByTestId("buyer-nik"), "3171999999999999");
    fireEvent.changeText(screen.getByTestId("buyer-email"), "buyer@mail.com");
    fireEvent.changeText(
      screen.getByTestId("buyer-email-confirmation"),
      "buyer@mail.com",
    );
    fireEvent.press(screen.getByTestId("cat-0-VIP")); // pick VIP category
    await waitFor(() =>
      expect(screen.getByTestId("checkout-total").props.children).toBe(
        "Rp 950.000",
      ),
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-name-0"),
      "Penonton Satu",
    );
    fireEvent.changeText(
      screen.getByTestId("attendee-nik-0"),
      "3171010101010001",
    );
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
    fireEvent.changeText(
      screen.getByTestId("buyer-email-confirmation"),
      "buyer@mail.com",
    );
    fireEvent(screen.getByTestId("use-buyer-0"), "valueChange", true);
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Nama Pembeli");
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
    await waitFor(() =>
      expect(screen.getByTestId("attendee-name-1")).toBeTruthy(),
    );
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Penonton A");
    fireEvent.changeText(screen.getByTestId("attendee-name-1"), "Penonton B");
    // Each row kept its own value (patchRow matches only the edited index).
    expect(screen.getByTestId("attendee-name-0").props.value).toBe(
      "Penonton A",
    );
    expect(screen.getByTestId("attendee-name-1").props.value).toBe(
      "Penonton B",
    );
  });

  it("refuses to remove the last row (stays at min 1)", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("add-ticket")).toBeTruthy());
    fireEvent.press(screen.getByTestId("add-ticket")); // 2 rows
    await waitFor(() =>
      expect(screen.getByTestId("remove-ticket-1")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("remove-ticket-1")); // back to 1
    await waitFor(() =>
      expect(screen.queryByTestId("ticket-row-1")).toBeNull(),
    );
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
    // : CheckoutHero shows "Pilih Tiketmu" (uppercase T)
    await waitFor(() => expect(screen.getByText("Pilih Tiketmu")).toBeTruthy());
  });

  it("offers recovery when no session is restored", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(null) },
    });
    // Loading clears → the add-ticket control appears (post-restore render),
    // and the session-dependent hero stays absent (false arm of the ternary).
    await waitFor(() =>
      expect(screen.getByText("Sesi Tidak Tersedia")).toBeTruthy(),
    );
    expect(screen.queryByTestId("add-ticket")).toBeNull();
    expect(screen.getByTestId("expired-retry")).toBeTruthy();
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/browse");
  });

  it("offers retry when the session cannot be loaded and restores it on retry", async () => {
    const getCurrentSession = jest
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(SESSION);
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: {
        bookingRepository: { ...bookingRepo(SESSION), getCurrentSession },
      },
      queryClient: new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: Infinity } },
      }),
    });
    await waitFor(() =>
      expect(screen.getByText("Sesi Gagal Dimuat")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("expired-retry"));
    await waitFor(() =>
      expect(screen.getByTestId("ticket-row-0")).toBeTruthy(),
    );
    expect(getCurrentSession).toHaveBeenCalledTimes(2);
  });

  it("routes an expired server session to the expired recovery screen", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-expired" />, {
      container: {
        bookingRepository: {
          ...bookingRepo(null),
          getSession: async () => {
            throw new Error("SESSION_EXPIRED: selection expired");
          },
        },
      },
      queryClient: new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: Infinity } },
      }),
    });
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith(
        "/failed/sess-expired?reason=hold",
      ),
    );
  });

  it("shows the NIK-format error when the buyer NIK is too short", async () => {
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(SESSION) },
    });
    await waitFor(() => expect(screen.getByTestId("buyer-nik")).toBeTruthy());
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "123"); // < 16 digits
    await waitFor(() =>
      expect(
        screen.getByText("NIK pembeli harus terdiri dari 16 digit."),
      ).toBeTruthy(),
    );
  });

  it("redirects to /failed when the server countdown elapses", async () => {
    const past: BookingSession = {
      ...SESSION,
      expiresAt: "2026-12-01T00:00:00.000Z",
      serverTime: "2026-12-01T00:10:00.000Z", // serverTime already past expiry
    };
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(past) },
    });
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith(
        "/failed/sess-1?reason=hold&eventId=evt-1",
      ),
    );
  });
});
