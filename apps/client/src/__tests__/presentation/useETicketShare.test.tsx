/**
 * RBT-071 — useETicketShare + buildTicketManifest: safe download/share.
 */
import { renderHook } from "@testing-library/react-native";

import {
  buildTicketManifest,
  useETicketShare,
} from "@presentation/hooks/useETicketShare";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RN = require("react-native") as typeof import("react-native");

describe("buildTicketManifest (RBT-071)", () => {
  it("lists one safe ref per ticket and carries NO PII", () => {
    const m = buildTicketManifest("bk-1", 2, ["TICKET-1", "TICKET-2"]);
    expect(m).toContain("Nomor Pesanan: bk-1");
    expect(m).toContain("TICKET-1");
    expect(m).toContain("TICKET-2");
    expect(/\d{16}/.test(m)).toBe(false); // no raw NIK
  });
});

describe("useETicketShare (RBT-071)", () => {
  const origOS = RN.Platform.OS;
  afterEach(() => {
    Object.defineProperty(RN.Platform, "OS", {
      value: origOS,
      configurable: true,
    });
  });

  it("web: opens a print window with the manifest", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "web",
      configurable: true,
    });
    const openPrint = jest.fn();
    const writeAndShare = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useETicketShare(openPrint, writeAndShare),
    );
    await result.current.shareTickets("bk-1", 2, ["TICKET-1", "TICKET-2"]);
    expect(openPrint).toHaveBeenCalledTimes(1);
    expect(openPrint.mock.calls[0][0]).toContain("TICKET-1");
    expect(writeAndShare).not.toHaveBeenCalled();
  });

  it("native: writes a file and hands it to the share sheet", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    const openPrint = jest.fn();
    const writeAndShare = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useETicketShare(openPrint, writeAndShare),
    );
    await result.current.shareTickets("bk-1", 1, ["TICKET-1"]);
    expect(writeAndShare).toHaveBeenCalledWith(
      "eticket-bk-1.txt",
      expect.stringContaining("TICKET-1"),
    );
    expect(openPrint).not.toHaveBeenCalled();
  });

  it("web DEFAULT openPrint writes the manifest to a print window", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "web",
      configurable: true,
    });
    const write = jest.fn();
    const close = jest.fn();
    const print = jest.fn();
    const open = jest
      .fn()
      .mockReturnValue({ document: { write, close }, print });
    Object.defineProperty(globalThis, "open", {
      value: open,
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useETicketShare()); // real defaults
    await result.current.shareTickets("bk-1", 1, ["TICKET-1"]);
    expect(open).toHaveBeenCalled();
    expect(write).toHaveBeenCalledWith(expect.stringContaining("TICKET-1"));
    expect(close).toHaveBeenCalled();
    expect(print).toHaveBeenCalled();
    delete (globalThis as { open?: unknown }).open;
  });

  // Native default writeAndShare — isolateModules so each case's fresh
  // expo-* mock is the one the hook's lazy require() picks up.
  async function runNativeDefault(
    available: boolean,
    cacheDirectory: string | null = "file:///cache/",
  ): Promise<{
    writeAsStringAsync: jest.Mock;
    shareAsync: jest.Mock;
  }> {
    const writeAsStringAsync = jest.fn().mockResolvedValue(undefined);
    const shareAsync = jest.fn().mockResolvedValue(undefined);
    await jest.isolateModulesAsync(async () => {
      jest.doMock("expo-file-system", () => ({
        cacheDirectory: cacheDirectory ?? undefined,
        writeAsStringAsync,
      }));
      jest.doMock("expo-sharing", () => ({
        isAvailableAsync: jest.fn().mockResolvedValue(available),
        shareAsync,
      }));
      const mod =
        require("@presentation/hooks/useETicketShare") as typeof import("@presentation/hooks/useETicketShare");
      const { result } = renderHook(() => mod.useETicketShare());
      await result.current.shareTickets("bk-2", 1, ["TICKET-1"]);
    });
    return { writeAsStringAsync, shareAsync };
  }

  it("native DEFAULT writeAndShare writes a cache file + shares it", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    const { writeAsStringAsync, shareAsync } = await runNativeDefault(true);
    expect(writeAsStringAsync).toHaveBeenCalledWith(
      "file:///cache/eticket-bk-2.txt",
      expect.stringContaining("TICKET-1"),
    );
    expect(shareAsync).toHaveBeenCalledWith("file:///cache/eticket-bk-2.txt");
  });

  it("native DEFAULT: when sharing is unavailable, writes but does not share", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    const { writeAsStringAsync, shareAsync } = await runNativeDefault(false);
    expect(writeAsStringAsync).toHaveBeenCalled();
    expect(shareAsync).not.toHaveBeenCalled();
  });

  it("native DEFAULT tolerates a missing cache directory", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    const { writeAsStringAsync, shareAsync } = await runNativeDefault(
      true,
      null,
    );
    expect(writeAsStringAsync).toHaveBeenCalledWith(
      "eticket-bk-2.txt",
      expect.stringContaining("TICKET-1"),
    );
    expect(shareAsync).toHaveBeenCalledWith("eticket-bk-2.txt");
  });

  it("web DEFAULT: a window with no document is handled without throwing", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "web",
      configurable: true,
    });
    Object.defineProperty(globalThis, "open", {
      value: jest.fn().mockReturnValue(null), // no window/document
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useETicketShare());
    await expect(
      result.current.shareTickets("bk-4", 1),
    ).resolves.toBeUndefined();
    delete (globalThis as { open?: unknown }).open;
  });
});
