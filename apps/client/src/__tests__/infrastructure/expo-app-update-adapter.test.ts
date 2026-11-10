import { ExpoAppUpdateAdapter } from "@infrastructure/updates/expo-app-update.adapter";

jest.mock("expo-constants", () => ({
  appOwnership: null,
  executionEnvironment: "standalone",
  expoVersion: null,
}));
jest.mock("expo-updates", () => ({
  isEnabled: true,
  checkForUpdateAsync: jest.fn().mockResolvedValue({ isAvailable: true }),
  fetchUpdateAsync: jest.fn().mockResolvedValue({ isNew: true }),
  reloadAsync: jest.fn().mockResolvedValue(undefined),
}));

const ExpoConstants = jest.requireMock("expo-constants") as {
  appOwnership: string | null;
  executionEnvironment: string;
  expoVersion: string | null;
};
const Updates = jest.requireMock("expo-updates") as {
  isEnabled: boolean;
  checkForUpdateAsync: jest.Mock;
  fetchUpdateAsync: jest.Mock;
  reloadAsync: jest.Mock;
};

describe("ExpoAppUpdateAdapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ExpoConstants.appOwnership = null;
    ExpoConstants.executionEnvironment = "standalone";
    ExpoConstants.expoVersion = null;
    Updates.isEnabled = true;
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

  it("detects Expo Go from its runtime version when other flags are absent", () => {
    ExpoConstants.expoVersion = "53.0.0";

    expect(new ExpoAppUpdateAdapter().isEnabled).toBe(false);
  });

  it("degrades safely when the native module is missing", async () => {
    Updates.isEnabled = false;
    const adapter = new ExpoAppUpdateAdapter();

    expect(adapter.isEnabled).toBe(false);
    await expect(adapter.checkForUpdate()).resolves.toBe(false);
  });
});
