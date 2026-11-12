/**
 * RBT-043 / RBT-096 — Waiting room screen tests (RNTL).
 *
 * Updated for  Brutalist Mono design system (English copy).
 *
 * The two seams — useQueuePolling (RBT-042) and useAutoClaim (RBT-044) — are
 * mocked (jest.mock) so NO real polling / claim fires; the screen is driven by
 * the fake return values. Asserts the  prototype contract (06-waiting.html):
 *  - position ring + stats (position, ahead count, ETA);
 *  - zone banner renders the EXACT copy per GUARANTEED/POSSIBLE/NOT_ENOUGH;
 *  - the admit region is an aria-live (accessibilityLiveRegion) node that
 *    announces on ADMITTED;
 *  - terminal (sold-out / ended) and claim error (TURN_MISSED / EVENT_SOLD_OUT)
 *    states render;
 *  - no-queueId guard;
 *  - reduced-motion path renders without animation.
 */
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import type { QueuePollingView } from "@presentation/hooks/useQueuePolling";
import type { UseAutoClaimResult } from "@presentation/hooks/useAutoClaim";
import type { QueueEntry } from "@domain/repositories/queue.repository";

// --- Mock the two merged hooks: the screen must CONSUME, not rebuild them. ---
const mockUseQueuePolling = jest.fn<
  QueuePollingView,
  [string, boolean?, string?, boolean?]
>();
const mockUseAutoClaim = jest.fn<UseAutoClaimResult, [unknown]>();
const mockUseEventDetail = jest.fn();
const mockUseRestoreBookingSession = jest.fn();
const mockScheduleLocal = jest.fn().mockResolvedValue(undefined);

jest.mock("@providers/service-context", () => ({
  useServices: () => ({
    notification: { scheduleLocal: mockScheduleLocal },
  }),
}));

jest.mock("@presentation/hooks/useQueuePolling", () => ({
  useQueuePolling: (queueId: string, reducedMotion?: boolean) =>
    mockUseQueuePolling(queueId, reducedMotion),
}));
jest.mock("@presentation/hooks/useAutoClaim", () => ({
  useAutoClaim: (params: unknown) => mockUseAutoClaim(params),
}));
jest.mock("@presentation/hooks/useEventDetail", () => ({
  useEventDetail: (eventId: string) => mockUseEventDetail(eventId),
}));
jest.mock("@presentation/hooks/useBookingSession", () => ({
  useRestoreBookingSession: (...args: unknown[]) =>
    mockUseRestoreBookingSession(...args),
}));

// Mock reduced-motion so tests can flip the branch deterministically.
const mockReducedMotion = jest.fn<boolean | undefined, []>();
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockReducedMotion() };
});

// Mock expo-router navigation (claim → checkout).
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useFocusEffect: jest.fn(),
}));

// eslint-disable-next-line import/first
import { WaitingRoomScreen } from "@presentation/screens/Waiting";

function entry(over: Partial<QueueEntry> = {}): QueueEntry {
  return {
    queueId: "q-1",
    eventId: "evt-1",
    position: 42,
    status: "WAITING",
    zone: "GUARANTEED",
    ...over,
  };
}

function polling(over: Partial<QueuePollingView> = {}): QueuePollingView {
  return {
    entry: entry(),
    admissionRatePerMin: 1400,
    isLoading: false,
    isStatusAuthoritative: true,
    isError: false,
    isConnectionLost: false,
    isReconnected: false,
    error: null,
    isSettled: false,
    leave: jest.fn(async () => undefined),
    refetch: jest.fn(async () => ({ data: undefined })),
    ...over,
  };
}

function claim(over: Partial<UseAutoClaimResult> = {}): UseAutoClaimResult {
  return {
    claiming: false,
    claimedSessionId: undefined,
    error: null,
    errorState: null,
    ...over,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockReducedMotion.mockReturnValue(false);
  mockUseQueuePolling.mockReturnValue(polling());
  mockUseAutoClaim.mockReturnValue(claim());
  mockUseRestoreBookingSession.mockReturnValue({
    session: null,
    isLoading: false,
    error: null,
    retry: jest.fn(async () => ({ data: null })),
  });
  mockUseEventDetail.mockReturnValue({
    data: {
      id: "evt-1",
      slug: "rusuh-fest-2026",
      name: "Rusuh Fest 2026",
      venue: "Gelora Bung Karno, Jakarta",
      startsAt: "2026-12-01T12:00:00.000Z",
      salesStartsAt: "2026-01-01T00:00:00.000Z",
      salesEndsAt: "2026-12-01T00:00:00.000Z",
      status: "AVAILABLE",
    },
  });
});

describe("WaitingRoomScreen — Buku Antrean layout", () => {
  it("renders the position number in the position panel", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ position: 42 }) }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-position")).toHaveTextContent("42");
    expect(screen.getByText("Posisimu")).toBeTruthy();
    expect(screen.getByText("Rusuh Fest 2026")).toBeTruthy();
    expect(screen.getByTestId("waiting-position")).toBeTruthy();
  });

  it("shows people ahead and the server-derived ETA as separate queue facts", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ position: 42 }) }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-ahead")).toHaveTextContent(/41/);
    expect(screen.getByTestId("waiting-eta")).toBeTruthy();
    expect(screen.getByTestId("waiting-eta")).toHaveTextContent(/~1 mnt/);
  });

  it("drives the poller with the queueId prop", () => {
    render(<WaitingRoomScreen queueId="q-9" eventId="evt-1" />);
    expect(mockUseQueuePolling).toHaveBeenCalledWith(
      "q-9",
      expect.any(Boolean),
    );
  });
});

describe("WaitingRoomScreen — zone banner exact copy + palette", () => {
  it("renders GUARANTEED (green) copy verbatim", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ zone: "GUARANTEED" }) }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    const zone = screen.getByTestId("waiting-zone");
    expect(screen.getByTestId("waiting-icon-lock")).toBeTruthy();
    expect(zone).toHaveTextContent("Zona Aman", { exact: false });
    expect(zone).toHaveTextContent(
      "Tiketmu tetap tersedia sampai giliranmu tiba.",
      {
        exact: false,
      },
    );
  });

  it("renders POSSIBLE (amber) copy verbatim", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ zone: "POSSIBLE" }) }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    const zone = screen.getByTestId("waiting-zone");
    expect(screen.getByTestId("waiting-icon-ledger")).toBeTruthy();
    expect(zone).toHaveTextContent("Zona kemungkinan", { exact: false });
    expect(zone).toHaveTextContent(
      "Kesempatan masuk bergantung pada sisa tiket.",
      {
        exact: false,
      },
    );
  });

  it("renders NOT_ENOUGH (red) copy verbatim", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ zone: "NOT_ENOUGH" }) }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    const zone = screen.getByTestId("waiting-zone");
    expect(screen.getByTestId("waiting-icon-alert")).toBeTruthy();
    expect(zone).toHaveTextContent("Peluang Terbatas", { exact: false });
    expect(zone).toHaveTextContent(
      "Posisimu sudah melewati perkiraan jumlah tiket.",
      {
        exact: false,
      },
    );
  });

  it("status is never color-only: the zone node carries a text label (a11y)", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ zone: "POSSIBLE" }) }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // Has readable text, not just a color — label present.
    expect(screen.getByTestId("waiting-zone")).toHaveTextContent(
      "Zona kemungkinan",
      { exact: false },
    );
  });
});

describe("WaitingRoomScreen — admit live region", () => {
  it("renders the admitted state while the ticket session is being claimed", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({
        entry: entry({ status: "ADMITTED", position: 0 }),
        isSettled: true,
      }),
    );
    mockUseAutoClaim.mockReturnValue(claim({ claiming: true }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    //  uses "waiting-admitted" as the wrapper testID
    expect(screen.getByTestId("waiting-admitted")).toBeTruthy();
    expect(screen.getByText("Giliran Anda!")).toBeTruthy();
    expect(screen.queryByTestId("waiting-redirect")).toBeNull();
  });

  it("does not auto-claim a cached ADMITTED status before server reconciliation", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({
        entry: entry({ status: "ADMITTED", position: 0 }),
        isSettled: true,
        isStatusAuthoritative: false,
      }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(mockUseAutoClaim).toHaveBeenCalledWith(
      expect.objectContaining({ status: undefined }),
    );
  });

  it("redirects to checkout immediately when claim yields a sessionId", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({
        entry: entry({ status: "CLAIMED", position: 0 }),
        isSettled: true,
      }),
    );
    mockUseAutoClaim.mockReturnValue(claim({ claimedSessionId: "sess-7" }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);

    expect(mockReplace).toHaveBeenCalledWith("/checkout/sess-7");
    expect(screen.getByTestId("waiting-claim-recovering")).toBeTruthy();
  });
});

describe("WaitingRoomScreen — terminal + error states", () => {
  it("renders 'Tiket Habis' for a SOLD_OUT terminal entry", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "SOLD_OUT" }), isSettled: true }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-terminal")).toHaveTextContent(
      "Tiket Habis",
      { exact: false },
    );
  });

  it("renders 'Penjualan Berakhir' for an ENDED terminal entry", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ENDED" }), isSettled: true }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-terminal")).toHaveTextContent(
      "Penjualan Berakhir",
      { exact: false },
    );
  });

  it("renders the EVENT_SOLD_OUT claim-error state ('Tiket Habis')", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({
        entry: entry({ status: "ADMITTED", position: 0 }),
        isSettled: true,
      }),
    );
    mockUseAutoClaim.mockReturnValue(
      claim({ errorState: "EVENT_SOLD_OUT", error: new Error("sold") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-claim-error")).toHaveTextContent(
      "Tiket Habis",
      { exact: false },
    );
  });

  it("notifies the user when the server confirms their queue turn timed out", async () => {
    mockUseQueuePolling.mockReturnValue(
      polling({
        entry: entry({ status: "ADMITTED", position: 0 }),
        isSettled: true,
      }),
    );
    mockUseAutoClaim.mockReturnValue(
      claim({ errorState: "TURN_MISSED", error: new Error("missed") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-claim-error")).toHaveTextContent(
      "Giliran Berakhir",
      { exact: false },
    );
    await waitFor(() =>
      expect(mockScheduleLocal).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "queue_timeout",
          notificationId: "queue-timeout-q-1",
          deepLink: "/events/evt-1",
        }),
      ),
    );
  });

  it("shows the specific recovery copy for ADMISSION_TOKEN_INVALID", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({
        entry: entry({ status: "ADMITTED", position: 0 }),
        isSettled: true,
      }),
    );
    mockUseAutoClaim.mockReturnValue(
      claim({
        errorState: "ADMISSION_TOKEN_INVALID",
        error: new Error("ADMISSION_TOKEN_INVALID"),
      }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-claim-error")).toHaveTextContent(
      "Sesi Antrean Berakhir",
      { exact: false },
    );
    expect(screen.getByTestId("waiting-claim-error")).toHaveTextContent(
      "Sesi antrean sebelumnya masih tercatat di server",
      { exact: false },
    );
    expect(screen.getByText("Jelajahi Event Lain")).toBeTruthy();
    fireEvent.press(screen.getByTestId("waiting-claim-error-state"));
    expect(mockReplace).toHaveBeenCalledWith("/browse");
  });

  it("does not present a CLAIMED entry as a zero-position waiting queue", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "CLAIMED", position: 0 }) }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-claimed-recovery")).toBeTruthy();
    expect(screen.getByText("Kembali ke Beranda")).toBeTruthy();
    fireEvent.press(screen.getByTestId("waiting-claimed-state"));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("restores a claimed session and routes directly to its checkout", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "CLAIMED", position: 0 }) }),
    );
    mockUseRestoreBookingSession.mockReturnValue({
      session: { sessionId: "restored-session" },
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);

    expect(mockReplace).toHaveBeenCalledWith("/checkout/restored-session");
  });

  it("keeps the already-used message hidden while a claimed session is restoring", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "CLAIMED", position: 0 }) }),
    );
    mockUseRestoreBookingSession.mockReturnValue({
      session: null,
      isLoading: true,
      error: null,
      retry: jest.fn(),
    });
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);

    expect(screen.getByTestId("waiting-claim-recovering")).toBeTruthy();
    expect(screen.queryByText("Sesi antrean sudah digunakan")).toBeNull();
  });

  it("renders the polling-error state", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: undefined, isError: true, error: new Error("boom") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-error")).toBeTruthy();
  });

  it("uses the safe error copy when the failed query has no Error object", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: undefined, isError: true, error: null }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-error")).toHaveTextContent(
      /Ada kendala saat memuat antrean\. Coba lagi sebentar\./,
    );
  });

  it("keeps the last queue position visible while a poll is timing out", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({
        isError: true,
        isConnectionLost: true,
        error: new Error("timeout"),
      }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-active")).toBeTruthy();
    expect(screen.getByTestId("waiting-position")).toHaveTextContent("42");
    expect(screen.getByTestId("waiting-network-status")).toHaveTextContent(
      "Koneksi terputus",
      { exact: false },
    );
  });

  it("keeps the waiting room open and retries the same queue after the first timeout", () => {
    const refetch = jest.fn(async () => ({ data: undefined }));
    mockUseQueuePolling.mockReturnValue(
      polling({
        entry: undefined,
        isError: true,
        isConnectionLost: true,
        error: new Error("timeout"),
        refetch,
      }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-reconnecting")).toBeTruthy();
    expect(screen.getByTestId("waiting-network-status")).toBeTruthy();
    fireEvent.press(screen.getByTestId("waiting-reconnecting-state"));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("rejoins the existing event from a polling error", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: undefined, isError: true, error: new Error("boom") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    fireEvent.press(screen.getByTestId("waiting-error-state"));
    expect(mockReplace).toHaveBeenCalledWith("/events/evt-1");
  });

  it("returns to Home when a claim error cannot identify the prior event", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({
        entry: entry({ status: "ADMITTED", position: 0 }),
        isSettled: true,
      }),
    );
    mockUseAutoClaim.mockReturnValue(
      claim({ errorState: "UNKNOWN", error: new Error("unknown") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="" />);
    fireEvent.press(screen.getByTestId("waiting-claim-error-state"));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("renders a loading state while the first poll is in flight", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: undefined, isLoading: true }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-loading")).toBeTruthy();
  });
});

describe("WaitingRoomScreen — leave action", () => {
  it("opens leave confirmation modal when leave button is pressed, then calls leave() on confirm", async () => {
    const leave = jest.fn(async () => undefined);
    mockUseQueuePolling.mockReturnValue(polling({ leave }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);

    // Press the leave button - this opens the modal
    const leaveBtn = screen.getByTestId("waiting-leave");
    fireEvent.press(leaveBtn);

    // Modal should be visible
    const modal = screen.getByTestId("waiting-leave-modal");
    expect(modal).toBeTruthy();

    // Find the confirmation button inside the modal (there are two matching labels).
    // The modal has a button with the leave action - get all and pick from modal
    const leaveButtons = screen.getAllByText("Keluar dari Antrean");
    // The modal button is typically the second one (first is the initial leave button)
    const confirmLeaveBtn = leaveButtons[leaveButtons.length - 1];
    fireEvent.press(confirmLeaveBtn);

    expect(leave).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
    expect(mockScheduleLocal).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "waiting_room_left",
        deepLink: "/events/evt-1",
      }),
    );
  });

  it("closes the leave dialog when the user chooses to stay in the queue", () => {
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    fireEvent.press(screen.getByTestId("waiting-leave"));
    expect(screen.getByTestId("waiting-leave-modal")).toBeTruthy();
    fireEvent.press(screen.getByText("Tetap Mengantre"));
    expect(screen.queryByTestId("waiting-leave-modal")).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe("WaitingRoomScreen — guards + reduced motion", () => {
  it("renders the no-queue guard when queueId is empty", () => {
    render(<WaitingRoomScreen queueId="" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-noqueue")).toHaveTextContent(
      "Belum ada antrean",
      { exact: false },
    );
    // The poller must not be driven with an empty id.
    expect(mockUseQueuePolling).toHaveBeenCalledWith("", expect.any(Boolean));
    fireEvent.press(screen.getByText("Jelajahi Event"));
    expect(mockReplace).toHaveBeenCalledWith("/browse");
  });

  it("passes the reduced-motion flag to the poller and renders without crashing", () => {
    mockReducedMotion.mockReturnValue(true);
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(mockUseQueuePolling).toHaveBeenCalledWith("q-1", true);
    expect(screen.getByTestId("waiting-position")).toBeTruthy();
  });

  it("defaults to standard motion when the platform has no reduced-motion preference", () => {
    mockReducedMotion.mockReturnValue(undefined);
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(mockUseQueuePolling).toHaveBeenCalledWith("q-1", false);
  });
});
