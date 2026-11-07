/**
 * RBT-065 — SnapActions fragment: buttons fire callbacks; `pending` disables.
 */
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { SnapActions } from "@presentation/screens/Snap/fragments/SnapActions";

describe("SnapActions (RBT-065)", () => {
  it("fires onSuccess / onFail / onUnknown (pending defaults to false)", () => {
    const onSuccess = jest.fn();
    const onFail = jest.fn();
    const onUnknown = jest.fn();
    const screen = render(
      <SnapActions
        onSuccess={onSuccess}
        onFail={onFail}
        onUnknown={onUnknown}
      />,
    );
    fireEvent.press(screen.getByTestId("snap-success"));
    fireEvent.press(screen.getByTestId("snap-fail"));
    fireEvent.press(screen.getByTestId("snap-unknown"));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onUnknown).toHaveBeenCalledTimes(1);
  });

  it("disables the buttons when pending", () => {
    const screen = render(
      <SnapActions
        pending
        onSuccess={jest.fn()}
        onFail={jest.fn()}
        onUnknown={jest.fn()}
      />,
    );
    expect(
      screen.getByTestId("snap-success").props.accessibilityState.disabled,
    ).toBe(true);
  });
});
