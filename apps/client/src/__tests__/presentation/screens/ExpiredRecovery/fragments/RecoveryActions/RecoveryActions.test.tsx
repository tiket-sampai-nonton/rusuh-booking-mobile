import { fireEvent, render, screen } from "@testing-library/react-native";

import { RecoveryActions } from "../../../../../../presentation/screens/ExpiredRecovery/fragments/RecoveryActions/index";

describe("RecoveryActions", () => {
  it("retries, offers the home action when enabled, and supports re-queue", () => {
    const onRetry = jest.fn();
    const onRequeue = jest.fn();
    const onHome = jest.fn();
    render(
      <RecoveryActions
        canRetry
        primaryText="Coba Lagi"
        showHome
        onRetry={onRetry}
        onRequeue={onRequeue}
        onHome={onHome}
      />,
    );

    fireEvent.press(screen.getByTestId("expired-retry"));
    fireEvent.press(screen.getByTestId("expired-home"));
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onHome).toHaveBeenCalledTimes(1);
    expect(onRequeue).toHaveBeenCalledTimes(1);
  });

  it("re-queues from the primary action and hides the optional home button", () => {
    const onRetry = jest.fn();
    const onRequeue = jest.fn();
    const onHome = jest.fn();
    render(
      <RecoveryActions
        canRetry={false}
        primaryText="Cari Event Lain"
        showHome={false}
        onRetry={onRetry}
        onRequeue={onRequeue}
        onHome={onHome}
      />,
    );

    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(onRequeue).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
    expect(onHome).not.toHaveBeenCalled();
    expect(screen.queryByTestId("expired-home")).toBeNull();
  });
});
