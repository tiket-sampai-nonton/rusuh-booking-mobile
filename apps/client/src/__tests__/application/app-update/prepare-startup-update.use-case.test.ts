import type { AppUpdatePort } from "@domain/services/app-update.port";
import { PrepareStartupUpdate } from "@application/app-update/prepare-startup-update.use-case";

function makeAppUpdate(isEnabled = true): AppUpdatePort {
  return {
    isEnabled,
    checkForUpdate: jest.fn().mockResolvedValue(false),
    downloadUpdate: jest.fn().mockResolvedValue(true),
    reload: jest.fn().mockResolvedValue(undefined),
  };
}

describe("PrepareStartupUpdate", () => {
  it("skips update checks when Expo Updates is unavailable", async () => {
    const appUpdate = makeAppUpdate(false);

    await expect(new PrepareStartupUpdate(appUpdate).execute()).resolves.toBe(
      false,
    );
    expect(appUpdate.checkForUpdate).not.toHaveBeenCalled();
    expect(appUpdate.downloadUpdate).not.toHaveBeenCalled();
  });

  it("keeps the installed bundle when no compatible update is available", async () => {
    const appUpdate = makeAppUpdate();

    await expect(new PrepareStartupUpdate(appUpdate).execute()).resolves.toBe(
      false,
    );
    expect(appUpdate.checkForUpdate).toHaveBeenCalledTimes(1);
    expect(appUpdate.downloadUpdate).not.toHaveBeenCalled();
  });

  it("downloads an available update before telling the caller to reload", async () => {
    const appUpdate = makeAppUpdate();
    jest.mocked(appUpdate.checkForUpdate).mockResolvedValue(true);
    const onDownloadStart = jest.fn();

    await expect(
      new PrepareStartupUpdate(appUpdate).execute(onDownloadStart),
    ).resolves.toBe(true);
    expect(onDownloadStart).toHaveBeenCalledTimes(1);
    expect(appUpdate.downloadUpdate).toHaveBeenCalledTimes(1);
    expect(appUpdate.reload).not.toHaveBeenCalled();
  });
});
