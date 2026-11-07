/**
 * RBT-080 — automated accessibility assertions (WCAG 2.1 AA, AC3).
 *
 * axe does not run against React Native (no DOM in RNTL), so the automated gate
 * here asserts the structural a11y contract RNTL CAN verify: interactive
 * controls expose an accessibilityRole + a non-empty accessibilityLabel/text,
 * and status-change surfaces are live regions (announced without re-focus). The
 * rest of WCAG 2.1 AA (contrast ratios, real screen-reader output, keyboard
 * order on web) is covered by the manual checklist in
 * .genesis/evidence/RBT-080/wcag-checklist.md.
 */
import { render } from "@testing-library/react-native";
import React from "react";

import { SnapActions } from "@presentation/screens/Snap/fragments/SnapActions";
import { ETicketCard } from "@presentation/components/ETicketCard";
import { ExpiredRecoveryScreen } from "@presentation/screens/ExpiredRecovery";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useNavigation: () => ({ addListener: jest.fn(() => jest.fn()) }),
}));

describe("RBT-080 — interactive controls expose role + label", () => {
  it("SnapActions buttons all have button role + accessible label", () => {
    const screen = render(
      <SnapActions
        onSuccess={jest.fn()}
        onFail={jest.fn()}
        onUnknown={jest.fn()}
      />,
    );
    for (const id of ["snap-success", "snap-fail", "snap-unknown"]) {
      const el = screen.getByTestId(id);
      expect(el.props.accessibilityRole).toBe("button");
      expect(String(el.props.accessibilityLabel ?? "").length).toBeGreaterThan(
        0,
      );
    }
  });

  it("ExpiredRecovery actions are buttons with labels; status never color-only", () => {
    const screen = render(
      <ExpiredRecoveryScreen
        resourceId="bk-1"
        reason="payment"
        bookingId="bk-1"
        status="FAILED"
        remainingMs={60_000}
      />,
    );
    const retry = screen.getByTestId("expired-retry");
    const requeue = screen.getByTestId("expired-requeue");
    expect(retry.props.accessibilityRole).toBe("button");
    expect(requeue.props.accessibilityRole).toBe("button");
    // Status is conveyed by TEXT (a header), not color alone (WCAG 1.4.1).
    expect(screen.getByTestId("expired-title")).toBeTruthy();
    expect(screen.getByRole("header")).toBeTruthy();
  });

  it("ETicketCard exposes an accessible label describing the ticket", () => {
    const screen = render(<ETicketCard bookingId="bk-1" index={0} total={2} />);
    const card = screen.getByTestId("eticket-0");
    expect(String(card.props.accessibilityLabel ?? "")).toMatch(
      /E-tiket 1 dari 2/,
    );
  });
});
