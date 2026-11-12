import { act, render, waitFor } from "@testing-library/react-native";

import type { AppUpdatePort } from "@domain/services/app-update.port";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { StartupUpdateBridge } from "@presentation/bridges/StartupUpdateBridge";

function renderBridge(appUpdate: AppUpdatePort) {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, appUpdate };
  const onComplete = jest.fn();
  const onStatusChange = jest.fn();
  const onBuildLabelChange = jest.fn();
  const view = render(
    <ServiceProvider container={container}>
      <StartupUpdateBridge
        onComplete={onComplete}
        onStatusChange={onStatusChange}
        onBuildLabelChange={onBuildLabelChange}
      />
    </ServiceProvider>,
  );
  return { ...view, onComplete, onStatusChange, onBuildLabelChange };
}

function appUpdate(overrides: Partial<AppUpdatePort> = {}): AppUpdatePort {
  return {
    isEnabled: true,
    getBuildLabel: () => "preprod 0.1.1.001",
    checkForUpdate: async () => false,
    downloadUpdate: async () => false,
    reload: async () => undefined,
    ...overrides,
  };
}

describe("StartupUpdateBridge", () => {
  afterEach(() => jest.useRealTimers());

  it("continues immediately when remote updates are disabled", async () => {
    const checkForUpdate = jest.fn();
    const port = appUpdate({ isEnabled: false, checkForUpdate });
    const { onComplete, onStatusChange, onBuildLabelChange } =
      renderBridge(port);

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onBuildLabelChange).toHaveBeenCalledWith("preprod 0.1.1.001");
    expect(onStatusChange).not.toHaveBeenCalled();
    expect(checkForUpdate).not.toHaveBeenCalled();
  });

  it("checks for updates and completes when none are available", async () => {
    const checkForUpdate = jest.fn().mockResolvedValue(false);
    const { onComplete, onStatusChange } = renderBridge(
      appUpdate({ checkForUpdate }),
    );

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(checkForUpdate).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenCalledWith("Memeriksa pembaruan");
  });

  it("announces download progress and reloads after a compatible update", async () => {
    const downloadUpdate = jest.fn().mockResolvedValue(true);
    const reload = jest.fn().mockResolvedValue(undefined);
    const { onComplete, onStatusChange } = renderBridge(
      appUpdate({
        checkForUpdate: jest.fn().mockResolvedValue(true),
        downloadUpdate,
        reload,
      }),
    );

    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    expect(downloadUpdate).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenNthCalledWith(1, "Memeriksa pembaruan");
    expect(onStatusChange).toHaveBeenNthCalledWith(2, "Mengunduh pembaruan");
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("continues with the current bundle when checking an update fails", async () => {
    const { onComplete } = renderBridge(
      appUpdate({
        checkForUpdate: jest.fn().mockRejectedValue(new Error("offline")),
      }),
    );

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  it("does not reload if a timed-out request completes later", async () => {
    jest.useFakeTimers();
    let resolveCheck: (available: boolean) => void = () => undefined;
    const checkForUpdate = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveCheck = resolve;
        }),
    );
    const reload = jest.fn();
    const { onComplete } = renderBridge(
      appUpdate({ checkForUpdate, downloadUpdate: async () => true, reload }),
    );

    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    await act(async () => resolveCheck(true));
    expect(reload).not.toHaveBeenCalled();
  });
});
