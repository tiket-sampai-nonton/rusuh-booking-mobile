import { Platform } from "react-native";

let mockStorageAccessFrameworkAvailable = true;
let mockCacheDirectory: string | undefined = "file://cache/";
const mockRequestDirectoryPermissionsAsync = jest.fn();
const mockCreateFileAsync = jest.fn();

jest.mock("expo-file-system", () => ({
  get cacheDirectory() {
    return mockCacheDirectory;
  },
  EncodingType: { Base64: "base64" },
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  get StorageAccessFramework() {
    return mockStorageAccessFrameworkAvailable
      ? {
          requestDirectoryPermissionsAsync:
            mockRequestDirectoryPermissionsAsync,
          createFileAsync: mockCreateFileAsync,
        }
      : undefined;
  },
}));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// eslint-disable-next-line import/first
import * as FileSystem from "expo-file-system";
// eslint-disable-next-line import/first
import * as Sharing from "expo-sharing";
// eslint-disable-next-line import/first
import { ExpoFileShareAdapter } from "../../../infrastructure/files/expo-file-share.adapter";

describe("ExpoFileShareAdapter", () => {
  const originalPlatform = Platform.OS;
  const adapter = new ExpoFileShareAdapter();
  const file = {
    fileName: "ticket.pdf",
    mimeType: "application/pdf",
    base64: "cGRm",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageAccessFrameworkAvailable = true;
    mockCacheDirectory = "file://cache/";
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  });

  afterAll(() =>
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    }),
  );

  it("writes an Android file through the system folder picker", async () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    jest
      .mocked(
        FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync,
      )
      .mockResolvedValue({
        granted: true,
        directoryUri: "content://tickets",
      } as never);
    jest
      .mocked(FileSystem.StorageAccessFramework.createFileAsync)
      .mockResolvedValue("content://tickets/ticket.pdf" as never);

    await adapter.save(file);

    expect(
      FileSystem.StorageAccessFramework.createFileAsync,
    ).toHaveBeenCalledWith(
      "content://tickets",
      "ticket.pdf",
      "application/pdf",
    );
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      "content://tickets/ticket.pdf",
      "cGRm",
      {
        encoding: FileSystem.EncodingType.Base64,
      },
    );
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it("reports a user-cancelled Android folder picker", async () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    jest
      .mocked(
        FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync,
      )
      .mockResolvedValue({ granted: false } as never);
    await expect(adapter.save(file)).rejects.toThrow(
      "Penyimpanan tiket dibatalkan.",
    );
    expect(
      FileSystem.StorageAccessFramework.createFileAsync,
    ).not.toHaveBeenCalled();
  });

  it("uses the share sheet for iOS saves and reports unavailable sharing", async () => {
    jest
      .mocked(Sharing.isAvailableAsync)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    await adapter.save(file);
    expect(Sharing.shareAsync).toHaveBeenCalledWith("file://cache/ticket.pdf", {
      mimeType: "application/pdf",
      dialogTitle: "Simpan e-tiket",
    });

    await expect(adapter.save(file)).rejects.toThrow(
      "Berbagi file tidak tersedia di perangkat ini.",
    );
  });

  it("shares files when available and silently skips sharing when unavailable", async () => {
    jest
      .mocked(Sharing.isAvailableAsync)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    await adapter.share(file);
    expect(Sharing.shareAsync).toHaveBeenCalledWith("file://cache/ticket.pdf", {
      mimeType: "application/pdf",
    });
    await adapter.share(file);
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
  });

  it("falls back to the app cache on Android when the folder picker is unavailable", async () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    mockStorageAccessFrameworkAvailable = false;
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(true);

    await adapter.save(file);
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      "file://cache/ticket.pdf",
      "cGRm",
      {
        encoding: FileSystem.EncodingType.Base64,
      },
    );
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      "file://cache/ticket.pdf",
      expect.any(Object),
    );
  });

  it("uses the filename alone when the platform has no cache directory", async () => {
    mockCacheDirectory = undefined;
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);

    await adapter.save(file);
    await adapter.share(file);

    expect(FileSystem.writeAsStringAsync).toHaveBeenNthCalledWith(
      1,
      "ticket.pdf",
      "cGRm",
      expect.any(Object),
    );
    expect(FileSystem.writeAsStringAsync).toHaveBeenNthCalledWith(
      2,
      "ticket.pdf",
      "cGRm",
      expect.any(Object),
    );
  });
});
