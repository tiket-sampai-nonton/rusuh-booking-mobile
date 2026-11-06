/**
 * RBT-064 — ExpiredRecoveryScreen: failure/expiry recovery UI + routing.
 * FAILED+payable → Retry (→ /payment); not-payable/expired → Re-queue
 * (→ /events or /browse). Reason-specific copy.
 */
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Platform } from "react-native";

import { ExpiredRecoveryScreen } from "@presentation/screens/ExpiredRecovery";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

beforeEach(() => mockRouter.replace.mockReset());

describe("ExpiredRecoveryScreen (RBT-064)", () => {
  it("FAILED + payable: shows Retry and routes to the payment page", () => {
    const screen = render(
      <ExpiredRecoveryScreen
        resourceId="bk-1"
        reason="payment"
        bookingId="bk-1"
        eventId="evt-7"
        status="FAILED"
        remainingMs={60_000}
      />,
    );
    const retry = screen.getByTestId("expired-retry");
    expect(retry).toBeTruthy();
    fireEvent.press(retry);
    expect(mockRouter.replace).toHaveBeenCalledWith("/payment/bk-1");
  });

  it("FAILED + payable: the secondary action returns to the event to rejoin", () => {
    const screen = render(
      <ExpiredRecoveryScreen
        resourceId="bk-1"
        reason="payment"
        bookingId="bk-1"
        eventId="evt-7"
        status="FAILED"
        remainingMs={60_000}
      />,
    );
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/events/evt-7");
  });

  it("BOOKING_NOT_PAYABLE: hides Retry, offers re-queue only", () => {
    const screen = render(
      <ExpiredRecoveryScreen
        resourceId="bk-1"
        reason="payment"
        bookingId="bk-1"
        eventId="evt-7"
        status="FAILED"
        errorCode="BOOKING_NOT_PAYABLE"
        remainingMs={60_000}
      />,
    );
    expect(screen.queryByTestId("expired-retry")).toBeNull();
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/events/evt-7");
  });

  it("deadline passed: hides Retry even for FAILED", () => {
    const screen = render(
      <ExpiredRecoveryScreen
        resourceId="bk-1"
        reason="payment"
        bookingId="bk-1"
        eventId="evt-7"
        status="FAILED"
        remainingMs={0}
      />,
    );
    expect(screen.queryByTestId("expired-retry")).toBeNull();
  });

  it("queue reason: re-queue goes to browse", () => {
    const screen = render(
      <ExpiredRecoveryScreen resourceId="q-1" reason="queue" />,
    );
    expect(screen.queryByTestId("expired-retry")).toBeNull();
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/browse");
  });

  it("no eventId: re-queue falls back to browse", () => {
    const screen = render(
      <ExpiredRecoveryScreen resourceId="bk-1" reason="hold" status="FAILED" />,
    );
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/browse");
  });

  it("defaults (reason=queue, remainingMs=0) when only resourceId is given", () => {
    // exercises the default-parameter arms; no retry, re-queue to browse
    const screen = render(<ExpiredRecoveryScreen resourceId="x-1" />);
    expect(screen.queryByTestId("expired-retry")).toBeNull();
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/browse");
  });

  it("renders reason-specific copy", () => {
    const screen = render(
      <ExpiredRecoveryScreen resourceId="bk-1" reason="payment" />,
    );
    expect(screen.getByTestId("expired-title").props.children).toMatch(
      /Pembayaran/i,
    );
  });

  it("retry is a no-op guard when bookingId is missing", () => {
    // status FAILED + payable but no bookingId → canRetry false (no button)
    const screen = render(
      <ExpiredRecoveryScreen
        resourceId="bk-1"
        reason="payment"
        status="FAILED"
        remainingMs={60_000}
      />,
    );
    expect(screen.queryByTestId("expired-retry")).toBeNull();
  });

  it("returns to Home from the native recovery screen", () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    const screen = render(
      <ExpiredRecoveryScreen resourceId="hold-1" reason="hold" />,
    );
    fireEvent.press(screen.getByTestId("expired-home"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });
});
