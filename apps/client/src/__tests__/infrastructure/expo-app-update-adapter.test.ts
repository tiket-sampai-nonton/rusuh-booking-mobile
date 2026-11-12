import { ExpoAppUpdateAdapter } from "@infrastructure/updates/expo-app-update.adapter";

jest.mock("expo-constants", () => ({
  appOwnership: null,
  executionEnvironment: "bare",
  expoConfig: null,
}));
jest.mock("expo-updates", () => ({
  isEnabled: true,
  isEmbeddedLaunch: true,
  checkForUpdateAsync: jest.fn().mockResolvedValue({ isAvailable: true }),
  fetchUpdateAsync: jest.fn().mockResolvedValue({ isNew: true }),
  reloadAsync: jest.fn().mockResolvedValue(undefined),
}));

const ExpoConstants = jest.requireMock("expo-constants") as {
  appOwnership: string | null;
  executionEnvironment: string;
  expoVersion?: string | null;
  expoConfig: {
    version?: string;
    extra?: { buildInfo?: { environment?: string; otaRevision?: string } };
  } | null;
};
const Updates = jest.requireMock("expo-updates") as {
  isEnabled: boolean;
  isEmbeddedLaunch: boolean;
  checkForUpdateAsync: jest.Mock;
  fetchUpdateAsync: jest.Mock;
  reloadAsync: jest.Mock;
};

describe("ExpoAppUpdateAdapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ExpoConstants.appOwnership = null;
    ExpoConstants.executionEnvironment = "bare";
    delete ExpoConstants.expoVersion;
    ExpoConstants.expoConfig = null;
    Updates.isEnabled = true;
    Updates.isEmbeddedLaunch = true;
  });

  it("disables updates in Expo Go without touching the native module", async () => {
    ExpoConstants.executionEnvironment = "storeClient";
    const adapter = new ExpoAppUpdateAdapter();

    expect(adapter.isEnabled).toBe(false);
    await expect(adapter.checkForUpdate()).resolves.toBe(false);
    await expect(adapter.downloadUpdate()).resolves.toBe(false);
    await expect(adapter.reload()).resolves.toBeUndefined();
    expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
    expect(Updates.fetchUpdateAsync).not.toHaveBeenCalled();
    expect(Updates.reloadAsync).not.toHaveBeenCalled();
  });

  it("uses the native update API when enabled", async () => {
    const adapter = new ExpoAppUpdateAdapter();

    expect(adapter.isEnabled).toBe(true);
    await expect(adapter.checkForUpdate()).resolves.toBe(true);
    await expect(adapter.downloadUpdate()).resolves.toBe(true);
    await adapter.reload();
    expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
    expect(Updates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it("checks for updates when expoVersion is absent in a bare native app", async () => {
    expect(ExpoConstants.expoVersion).toBeUndefined();
    const adapter = new ExpoAppUpdateAdapter();
    expect(adapter.isEnabled).toBe(true);
    await expect(adapter.checkForUpdate()).resolves.toBe(true);
    expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
  });

  it("disables updates when Expo Go ownership is reported", () => {
    ExpoConstants.appOwnership = "expo";

    expect(new ExpoAppUpdateAdapter().isEnabled).toBe(false);
    expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
  });

  it("returns a build label for an embedded development build", () => {
    ExpoConstants.expoConfig = {
      version: "0.1.0",
      extra: { buildInfo: { environment: "development", otaRevision: "42" } },
    };

    expect(new ExpoAppUpdateAdapter().getBuildLabel()).toBe(
      "PREPROD 0.1.0.000",
    );
  });

  it("returns the OTA revision for a production update", () => {
    ExpoConstants.expoConfig = {
      version: "1.2.3",
      extra: { buildInfo: { environment: "production", otaRevision: "7" } },
    };
    Updates.isEmbeddedLaunch = false;

    expect(new ExpoAppUpdateAdapter().getBuildLabel()).toBe("PROD 1.2.3.007");
  });

  it("falls back safely when app config or OTA revision is missing or invalid", () => {
    ExpoConstants.expoConfig = {
      extra: { buildInfo: { environment: "production", otaRevision: "dev" } },
    };
    Updates.isEmbeddedLaunch = false;

    expect(new ExpoAppUpdateAdapter().getBuildLabel()).toBe("PROD 0.0.0.000");

    ExpoConstants.expoConfig = null;
    Updates.isEnabled = false;
    expect(new ExpoAppUpdateAdapter().getBuildLabel()).toBe(
      "PREPROD 0.0.0.000",
    );
  });

  it("keeps startup safe when update requests fail", async () => {
    const adapter = new ExpoAppUpdateAdapter();
    Updates.checkForUpdateAsync.mockRejectedValueOnce(new Error("offline"));
    Updates.fetchUpdateAsync.mockRejectedValueOnce(new Error("offline"));
    Updates.reloadAsync.mockRejectedValueOnce(new Error("offline"));

    await expect(adapter.checkForUpdate()).resolves.toBe(false);
    await expect(adapter.downloadUpdate()).resolves.toBe(false);
    await expect(adapter.reload()).resolves.toBeUndefined();
  });

  it("degrades safely when the native module is missing", async () => {
    Updates.isEnabled = false;
    const adapter = new ExpoAppUpdateAdapter();

    expect(adapter.isEnabled).toBe(false);
    await expect(adapter.checkForUpdate()).resolves.toBe(false);
  });
});
