import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  Booking,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import { useSessionStore } from "@presentation/stores/session-store";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line import/first
import { CheckoutScreen } from "@presentation/screens/Checkout";

const BUYER = "3201019999999999";
const NIK_A = "3201010101010001";

function futureSession(msAhead = 300_000): BookingSession {
  return {
    sessionId: "sess-1",
    eventId: "evt-1",
    expiresAt: new Date(Date.now() + msAhead).toISOString(),
    serverTime: new Date().toISOString(),
    maxSelectable: 3,
  };
}

function bookingRepo(
  session: BookingSession | null,
  overrides: Partial<BookingRepository> = {},
): BookingRepository {
  return {
    createSession: async () => session ?? futureSession(),
    getCurrentSession: async () => session,
    checkAttendee: async (_s, nik) => ({ nikMasked: nik, result: "AVAILABLE" }),
    hold: async (sessionId): Promise<Booking> => ({
      bookingId: "bk-1",
      sessionId,
      status: "HELD",
      amountMinor: 90000000,
    }),
    ...overrides,
  };
}

async function renderCheckout(repo: BookingRepository) {
  const r = renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
    container: { bookingRepository: repo },
  });
  await waitFor(() => expect(screen.getByTestId("checkout-scroll")).toBeTruthy());
  return r;
}

describe("CheckoutScreen", () => {
  beforeEach(() => {
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
    useSessionStore.getState().reset();
  });

  it("disables submit until the form is valid, then holds and routes to payment", async () => {
    await renderCheckout(bookingRepo(futureSession()));

    fireEvent.press(screen.getByTestId("checkout-submit"));
    expect(mockRouter.push).not.toHaveBeenCalled(); // still invalid

    fireEvent.changeText(screen.getByTestId("buyer-nik"), BUYER);
    fireEvent.changeText(screen.getByTestId("buyer-email"), "a@b.co");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Andi");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), NIK_A);

    fireEvent.press(screen.getByTestId("checkout-submit"));
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith("/payment/bk-1"),
    );
    expect(useSessionStore.getState().bookingId).toBe("bk-1");
  });

  it("strips non-digits and caps the buyer NIK at 16", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "32-01a0101010100019999");
    expect(screen.getByTestId("buyer-nik").props.value).toBe("3201010101010001");
  });

  it("adds and removes ticket rows up to the cap", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    expect(screen.getByTestId("ticket-row-0")).toBeTruthy();
    fireEvent.press(screen.getByTestId("add-ticket"));
    fireEvent.press(screen.getByTestId("add-ticket"));
    expect(screen.getByTestId("ticket-row-2")).toBeTruthy();
    // Cap is 3 — a 4th add is disabled (no row-3).
    fireEvent.press(screen.getByTestId("add-ticket"));
    expect(screen.queryByTestId("ticket-row-3")).toBeNull();
    // Remove one.
    fireEvent.press(screen.getByTestId("remove-ticket-2"));
    expect(screen.queryByTestId("ticket-row-2")).toBeNull();
  });

  it("single-use buyer NIK: enabling it on row 0 disables that row's fields", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    fireEvent.press(screen.getByTestId("add-ticket"));
    // Turn on buyer NIK for row 0.
    fireEvent(screen.getByTestId("use-buyer-0"), "valueChange", true);
    // Row 0 name field now shows "Pembeli" and is non-editable.
    expect(screen.getByTestId("attendee-name-0").props.value).toBe("Pembeli");
    expect(screen.getByTestId("attendee-name-0").props.editable).toBe(false);
    // Turning it on for row 1 turns row 0 off (single-use).
    fireEvent(screen.getByTestId("use-buyer-1"), "valueChange", true);
    expect(screen.getByTestId("attendee-name-0").props.editable).toBe(true);
    // Turning row 1 OFF again re-enables its own fields (off branch).
    fireEvent(screen.getByTestId("use-buyer-1"), "valueChange", false);
    expect(screen.getByTestId("attendee-name-1").props.editable).toBe(true);
  });

  it("selects a ticket category", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    fireEvent.press(screen.getByTestId("cat-0-VIP"));
    // VIP chip is now selected (accessibilityState.selected true).
    expect(screen.getByTestId("cat-0-VIP").props.accessibilityState.selected).toBe(
      true,
    );
  });

  it("shows a hold error message", async () => {
    await renderCheckout(
      bookingRepo(futureSession(), {
        hold: async () => {
          throw new Error("Kuota tiket untuk NIK ini sudah habis.");
        },
      }),
    );
    fireEvent.changeText(screen.getByTestId("buyer-nik"), BUYER);
    fireEvent.changeText(screen.getByTestId("buyer-email"), "a@b.co");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Andi");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), NIK_A);
    fireEvent.press(screen.getByTestId("checkout-submit"));
    await waitFor(() =>
      expect(
        screen.getByText("Kuota tiket untuk NIK ini sudah habis."),
      ).toBeTruthy(),
    );
  });

  it("redirects to expired when the hold deadline has passed", async () => {
    // An already-expired session: the countdown's first tick fires onExpire.
    const expiredSession: BookingSession = {
      sessionId: "sess-1",
      eventId: "evt-1",
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      serverTime: new Date().toISOString(),
      maxSelectable: 3,
    };
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: bookingRepo(expiredSession) },
    });
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/expired/sess-1"),
    );
    // The CTA reflects the expired state (disabled, "Waktu habis").
    expect(screen.getByText("Waktu habis")).toBeTruthy();
  });

  it("disables a ready form's CTA once the deadline passes mid-session", async () => {
    // Expires ~1.2s out: fill a valid form (ready), then the countdown expires
    // while mounted → CTA flips to "Waktu habis" (ready && !expired false arm).
    await renderCheckout(bookingRepo(futureSession(1200)));
    fireEvent.changeText(screen.getByTestId("buyer-nik"), BUYER);
    fireEvent.changeText(screen.getByTestId("buyer-email"), "a@b.co");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Andi");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), NIK_A);
    await waitFor(
      () => expect(screen.getByText("Waktu habis")).toBeTruthy(),
      { timeout: 4000 },
    );
  });

  it("shows a generic hold-error message when the error has no text", async () => {
    await renderCheckout(
      bookingRepo(futureSession(), {
        hold: async () => {
          throw new Error("");
        },
      }),
    );
    fireEvent.changeText(screen.getByTestId("buyer-nik"), BUYER);
    fireEvent.changeText(screen.getByTestId("buyer-email"), "a@b.co");
    fireEvent.changeText(screen.getByTestId("attendee-name-0"), "Andi");
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), NIK_A);
    fireEvent.press(screen.getByTestId("checkout-submit"));
    await waitFor(() =>
      expect(
        screen.getByText("Gagal memproses pemesanan. Coba lagi."),
      ).toBeTruthy(),
    );
  });

  it("shows a NIK-format error under an invalid buyer NIK", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    fireEvent.changeText(screen.getByTestId("buyer-nik"), "123");
    expect(screen.getByText("NIK harus 16 digit.")).toBeTruthy();
  });

  it("shows a NIK-format error under an invalid attendee NIK", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    fireEvent.changeText(screen.getByTestId("attendee-nik-0"), "999");
    expect(screen.getAllByText("NIK harus 16 digit.").length).toBeGreaterThanOrEqual(1);
  });

  it("holds with a buyer-NIK attendee row (resolved to the buyer)", async () => {
    let heldItems: unknown;
    await renderCheckout(
      bookingRepo(futureSession(), {
        hold: async (sessionId, items) => {
          heldItems = items;
          return { bookingId: "bk-1", sessionId, status: "HELD", amountMinor: 0 };
        },
      }),
    );
    fireEvent.changeText(screen.getByTestId("buyer-nik"), BUYER);
    fireEvent.changeText(screen.getByTestId("buyer-email"), "a@b.co");
    // Row 0 uses the buyer NIK (name/nik fields disabled, resolved on hold).
    fireEvent(screen.getByTestId("use-buyer-0"), "valueChange", true);
    fireEvent.press(screen.getByTestId("checkout-submit"));
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/payment/bk-1"));
    expect(heldItems).toEqual([
      { categoryId: "REG", attendeeName: "Pembeli", attendeeNik: BUYER },
    ]);
  });

  it("does not render a remove button when only one row exists", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    expect(screen.queryByTestId("remove-ticket-0")).toBeNull();
  });

  it("back opens the 'Tinggalkan halaman ini?' confirm (no immediate nav)", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    fireEvent.press(screen.getByTestId("checkout-back"));
    // Prototype opens a confirm dialog; it must NOT navigate yet.
    expect(screen.getByTestId("checkout-leave-modal")).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    // "Tetap di sini" closes it, still no navigation.
    fireEvent.press(screen.getByTestId("checkout-stay"));
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("'Ya, keluar' on the confirm leaves to home", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    fireEvent.press(screen.getByTestId("checkout-back"));
    fireEvent.press(screen.getByTestId("checkout-leave-confirm"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("tapping the confirm backdrop dismisses it without leaving", async () => {
    await renderCheckout(bookingRepo(futureSession()));
    fireEvent.press(screen.getByTestId("checkout-back"));
    expect(screen.getByTestId("checkout-leave-modal")).toBeTruthy();
    // Tap outside the card (backdrop) → onStay, same as "Tetap di sini".
    fireEvent.press(screen.getByTestId("checkout-leave-backdrop"));
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("shows the loading state while the session restores", () => {
    const pending: BookingRepository = {
      ...bookingRepo(futureSession()),
      getCurrentSession: () => new Promise(() => {}),
    };
    renderWithProviders(<CheckoutScreen sessionId="sess-1" />, {
      container: { bookingRepository: pending },
    });
    expect(screen.getByTestId("checkout-loading")).toBeTruthy();
  });
});
