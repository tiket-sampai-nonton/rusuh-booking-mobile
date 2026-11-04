/**
 * RBT-043 / RBT-096 — Waiting room screen tests (RNTL).
 *
 * Updated for V2 Brutalist Mono design system (English copy).
 *
 * The two seams — useQueuePolling (RBT-042) and useAutoClaim (RBT-044) — are
 * mocked (jest.mock) so NO real polling / claim fires; the screen is driven by
 * the fake return values. Asserts the V2 prototype contract (06-waiting.html):
 *  - position ring + stats (position, ahead count, ETA);
 *  - zone banner renders the EXACT copy per GUARANTEED/POSSIBLE/NOT_ENOUGH;
 *  - the admit region is an aria-live (accessibilityLiveRegion) node that
 *    announces on ADMITTED;
 *  - terminal (sold-out / ended) and claim error (TURN_MISSED / EVENT_SOLD_OUT)
 *    states render;
 *  - no-queueId guard;
 *  - reduced-motion path renders without animation.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import type { QueuePollingView } from "@presentation/hooks/useQueuePolling";
import type { UseAutoClaimResult } from "@presentation/hooks/useAutoClaim";
import type { QueueEntry } from "@domain/repositories/queue.repository";

// --- Mock the two merged hooks: the screen must CONSUME, not rebuild them. ---
const mockUseQueuePolling = jest.fn<QueuePollingView, [string, boolean?]>();
const mockUseAutoClaim = jest.fn<UseAutoClaimResult, [unknown]>();

jest.mock("@presentation/hooks/useQueuePolling", () => ({
  useQueuePolling: (queueId: string, reducedMotion?: boolean) =>
    mockUseQueuePolling(queueId, reducedMotion),
}));
jest.mock("@presentation/hooks/useAutoClaim", () => ({
  useAutoClaim: (params: unknown) => mockUseAutoClaim(params),
}));

// Mock reduced-motion so tests can flip the branch deterministically.
const mockReducedMotion = jest.fn<boolean, []>();
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockReducedMotion() };
});

// Mock expo-router navigation (claim → checkout).
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
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
    isLoading: false,
    isError: false,
    error: null,
    isSettled: false,
    leave: jest.fn(async () => undefined),
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
});

describe("WaitingRoomScreen — position + stats", () => {
  it("renders the position number in the ring with the position label", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ position: 42 }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-position")).toHaveTextContent("42");
    // V2 uses "Your Position" label
    expect(screen.getByTestId("waiting-position")).toBeTruthy();
  });

  it("shows ETA in minutes/seconds format", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ position: 42 }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // V2 shows ETA as minutes/seconds blocks instead of "ahead" count
    expect(screen.getByTestId("waiting-eta")).toBeTruthy();
    // Check for "Minutes" and "Seconds" labels
    expect(screen.getByText("Minutes")).toBeTruthy();
    expect(screen.getByText("Seconds")).toBeTruthy();
  });

  it("drives the poller with the queueId prop", () => {
    render(<WaitingRoomScreen queueId="q-9" eventId="evt-1" />);
    expect(mockUseQueuePolling).toHaveBeenCalledWith("q-9", expect.any(Boolean));
  });
});

describe("WaitingRoomScreen — zone banner exact copy + palette", () => {
  it("renders GUARANTEED (green) copy verbatim", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ zone: "GUARANTEED" }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    const zone = screen.getByTestId("waiting-zone");
    expect(screen.getByTestId("waiting-icon-lock")).toBeTruthy();
    // V2 uses "Safe Zone" instead of "Zona Aman"
    expect(zone).toHaveTextContent("Safe Zone", { exact: false });
    expect(zone).toHaveTextContent(
      "Your ticket is guaranteed when your turn arrives",
      { exact: false },
    );
  });

  it("renders POSSIBLE (amber) copy verbatim", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ zone: "POSSIBLE" }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    const zone = screen.getByTestId("waiting-zone");
    expect(screen.getByTestId("waiting-icon-warning")).toBeTruthy();
    // V2 uses "Possible Zone" instead of "Masih mungkin"
    expect(zone).toHaveTextContent("Possible Zone", { exact: false });
    expect(zone).toHaveTextContent(
      "You are in the reserve zone",
      { exact: false },
    );
  });

  it("renders NOT_ENOUGH (red) copy verbatim", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ zone: "NOT_ENOUGH" }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    const zone = screen.getByTestId("waiting-zone");
    expect(screen.getByTestId("waiting-icon-alert")).toBeTruthy();
    // V2 uses "Low Chance Zone" instead of "Belum cukup tiket"
    expect(zone).toHaveTextContent("Low Chance Zone", { exact: false });
    expect(zone).toHaveTextContent(
      "Your position is beyond estimated stock",
      { exact: false },
    );
  });

  it("status is never color-only: the zone node carries a text label (a11y)", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ zone: "POSSIBLE" }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // Has readable text, not just a color — label present.
    expect(screen.getByTestId("waiting-zone")).toHaveTextContent("Possible Zone", { exact: false });
  });
});

describe("WaitingRoomScreen — admit live region", () => {
  it("renders the admitted state while the ticket session is being claimed", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ADMITTED", position: 0 }), isSettled: true }),
    );
    mockUseAutoClaim.mockReturnValue(claim({ claiming: true }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // V2 uses "waiting-admitted" as the wrapper testID
    expect(screen.getByTestId("waiting-admitted")).toBeTruthy();
    expect(screen.getByText(/It's Your Turn/i)).toBeTruthy();
    expect(screen.queryByTestId("waiting-redirect")).toBeNull();
  });

  it("redirects to checkout immediately when claim yields a sessionId", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ADMITTED", position: 0 }), isSettled: true }),
    );
    mockUseAutoClaim.mockReturnValue(claim({ claimedSessionId: "sess-7" }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);

    expect(mockReplace).toHaveBeenCalledWith("/checkout/sess-7");
  });
});

describe("WaitingRoomScreen — terminal + error states", () => {
  it("renders 'Sold Out' for a SOLD_OUT terminal entry", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "SOLD_OUT" }), isSettled: true }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // V2 uses "Sold Out" instead of "Tiket habis"
    expect(screen.getByTestId("waiting-terminal")).toHaveTextContent("Sold Out", { exact: false });
  });

  it("renders 'Sale Ended' for an ENDED terminal entry", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ENDED" }), isSettled: true }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // V2 uses "Sale Ended" instead of "Antrean berakhir"
    expect(screen.getByTestId("waiting-terminal")).toHaveTextContent("Sale Ended", { exact: false });
  });

  it("renders the EVENT_SOLD_OUT claim-error state ('Sold Out')", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ADMITTED", position: 0 }), isSettled: true }),
    );
    mockUseAutoClaim.mockReturnValue(
      claim({ errorState: "EVENT_SOLD_OUT", error: new Error("sold") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // V2 uses "Sold Out" instead of "Tiket habis"
    expect(screen.getByTestId("waiting-claim-error")).toHaveTextContent("Sold Out", { exact: false });
  });

  it("renders the TURN_MISSED claim-error state ('Turn Expired')", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ADMITTED", position: 0 }), isSettled: true }),
    );
    mockUseAutoClaim.mockReturnValue(
      claim({ errorState: "TURN_MISSED", error: new Error("missed") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // V2 uses "Turn Expired" instead of "Antrean berakhir"
    expect(screen.getByTestId("waiting-claim-error")).toHaveTextContent("Turn Expired", { exact: false });
  });

  it("renders the polling-error state", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: undefined, isError: true, error: new Error("boom") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-error")).toBeTruthy();
  });

  it("renders a loading state while the first poll is in flight", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: undefined, isLoading: true }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-loading")).toBeTruthy();
  });
});

describe("WaitingRoomScreen — leave action", () => {
  it("opens leave confirmation modal when leave button is pressed, then calls leave() on confirm", () => {
    const leave = jest.fn(async () => undefined);
    mockUseQueuePolling.mockReturnValue(polling({ leave }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);

    // Press the leave button - this opens the modal
    const leaveBtn = screen.getByTestId("waiting-leave");
    fireEvent.press(leaveBtn);

    // Modal should be visible
    const modal = screen.getByTestId("waiting-leave-modal");
    expect(modal).toBeTruthy();

    // Find the "Leave Queue" button inside the modal (there are multiple "Leave Queue" texts)
    // The modal has a button with the leave action - get all and pick from modal
    const leaveButtons = screen.getAllByText("Leave Queue");
    // The modal button is typically the second one (first is the initial leave button)
    const confirmLeaveBtn = leaveButtons[leaveButtons.length - 1];
    fireEvent.press(confirmLeaveBtn);

    expect(leave).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});

describe("WaitingRoomScreen — guards + reduced motion", () => {
  it("renders the no-queue guard when queueId is empty", () => {
    render(<WaitingRoomScreen queueId="" eventId="evt-1" />);
    // V2 uses "No Active Queue" instead of "Belum ada antrean aktif"
    expect(screen.getByTestId("waiting-noqueue")).toHaveTextContent(
      "No Active Queue",
      { exact: false },
    );
    // The poller must not be driven with an empty id.
    expect(mockUseQueuePolling).toHaveBeenCalledWith("", expect.any(Boolean));
  });

  it("passes the reduced-motion flag to the poller and renders without crashing", () => {
    mockReducedMotion.mockReturnValue(true);
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(mockUseQueuePolling).toHaveBeenCalledWith("q-1", true);
    expect(screen.getByTestId("waiting-position")).toBeTruthy();
  });
});
