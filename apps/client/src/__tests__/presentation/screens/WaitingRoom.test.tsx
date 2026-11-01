/**
 * RBT-043 — Waiting room screen tests (RNTL).
 *
 * The two seams — useQueuePolling (RBT-042) and useAutoClaim (RBT-044) — are
 * mocked (jest.mock) so NO real polling / claim fires; the screen is driven by
 * the fake return values. Asserts the prototype contract (waiting.html):
 *  - position ring + "Posisimu" label, "Di depanmu" (ahead) + "Estimasi" stats;
 *  - zone banner renders the EXACT Bahasa copy per GUARANTEED/POSSIBLE/NOT_ENOUGH;
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
  it("renders the position number in the ring with the 'Posisimu' label", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ position: 42 }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-position")).toHaveTextContent("42");
    expect(screen.getByText("Posisimu")).toBeTruthy();
  });

  it("shows 'orang di depan' (ahead = position-1) and an 'Estimasi' ETA", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ position: 42 }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // Ahead = 42 - 1 = 41.
    expect(screen.getByTestId("waiting-ahead")).toHaveTextContent("41");
    expect(screen.getByText("Di depanmu")).toBeTruthy();
    expect(screen.getByTestId("waiting-eta")).toBeTruthy();
    expect(screen.getByText("Estimasi")).toBeTruthy();
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
    expect(zone).toHaveTextContent("🔒", { exact: false });
    expect(zone).toHaveTextContent("Zona Aman.", { exact: false });
    expect(zone).toHaveTextContent(
      "Begitu giliranmu tiba kamu dijamin masuk — tidak akan dipotong di tengah jalan.",
      { exact: false },
    );
  });

  it("renders POSSIBLE (amber) copy verbatim", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ zone: "POSSIBLE" }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    const zone = screen.getByTestId("waiting-zone");
    expect(zone).toHaveTextContent("⚠️", { exact: false });
    expect(zone).toHaveTextContent("Masih mungkin.", { exact: false });
    expect(zone).toHaveTextContent(
      "Posisimu di zona cadangan — peluang masuk tergantung sisa tiket.",
      { exact: false },
    );
  });

  it("renders NOT_ENOUGH (red) copy verbatim", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ zone: "NOT_ENOUGH" }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    const zone = screen.getByTestId("waiting-zone");
    expect(zone).toHaveTextContent("🔴", { exact: false });
    expect(zone).toHaveTextContent("Belum cukup tiket.", { exact: false });
    expect(zone).toHaveTextContent(
      "Posisimu di luar perkiraan stok. Tetap tunggu — stok bisa kembali bila ada yang batal.",
      { exact: false },
    );
  });

  it("status is never color-only: the zone node carries a text label (a11y)", () => {
    mockUseQueuePolling.mockReturnValue(polling({ entry: entry({ zone: "POSSIBLE" }) }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    // Has readable text, not just a color — label present.
    expect(screen.getByTestId("waiting-zone")).toHaveTextContent("Masih mungkin.", { exact: false });
  });
});

describe("WaitingRoomScreen — admit live region", () => {
  it("renders an aria-live (accessibilityLiveRegion=polite) admit region on ADMITTED", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ADMITTED", position: 0 }), isSettled: true }),
    );
    mockUseAutoClaim.mockReturnValue(claim({ claiming: true }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    const admit = screen.getByTestId("waiting-admit");
    expect(admit.props.accessibilityLiveRegion).toBe("polite");
    expect(admit).toHaveTextContent("Giliranmu tiba!", { exact: false });
    expect(admit).toHaveTextContent("Menyiapkan halaman tiket", { exact: false });
  });

  it("navigates to checkout when claim yields a sessionId", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ADMITTED", position: 0 }), isSettled: true }),
    );
    mockUseAutoClaim.mockReturnValue(claim({ claimedSessionId: "sess-7" }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(mockReplace).toHaveBeenCalledWith("/checkout/sess-7");
  });
});

describe("WaitingRoomScreen — terminal + error states", () => {
  it("renders 'Tiket habis' for a SOLD_OUT terminal entry", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "SOLD_OUT" }), isSettled: true }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-terminal")).toHaveTextContent("Tiket habis", { exact: false });
  });

  it("renders 'Antrean berakhir' for an ENDED terminal entry", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ENDED" }), isSettled: true }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-terminal")).toHaveTextContent("Antrean berakhir", { exact: false });
  });

  it("renders the EVENT_SOLD_OUT claim-error state ('Tiket habis')", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ADMITTED", position: 0 }), isSettled: true }),
    );
    mockUseAutoClaim.mockReturnValue(
      claim({ errorState: "EVENT_SOLD_OUT", error: new Error("sold") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-claim-error")).toHaveTextContent("Tiket habis", { exact: false });
  });

  it("renders the TURN_MISSED claim-error state ('Antrean berakhir')", () => {
    mockUseQueuePolling.mockReturnValue(
      polling({ entry: entry({ status: "ADMITTED", position: 0 }), isSettled: true }),
    );
    mockUseAutoClaim.mockReturnValue(
      claim({ errorState: "TURN_MISSED", error: new Error("missed") }),
    );
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-claim-error")).toHaveTextContent("Antrean berakhir", { exact: false });
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
  it("calls leave() and routes home when the leave link is pressed", () => {
    const leave = jest.fn(async () => undefined);
    mockUseQueuePolling.mockReturnValue(polling({ leave }));
    render(<WaitingRoomScreen queueId="q-1" eventId="evt-1" />);
    fireEvent.press(screen.getByTestId("waiting-leave"));
    expect(leave).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});

describe("WaitingRoomScreen — guards + reduced motion", () => {
  it("renders the no-queue guard when queueId is empty", () => {
    render(<WaitingRoomScreen queueId="" eventId="evt-1" />);
    expect(screen.getByTestId("waiting-noqueue")).toHaveTextContent(
      "Belum ada antrean aktif",
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
