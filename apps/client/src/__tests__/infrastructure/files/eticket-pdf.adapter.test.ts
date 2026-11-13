import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PDFDocument } from "pdf-lib";
import { Asset } from "expo-asset";
import { Platform } from "react-native";

import {
  ExpoETicketPdfAdapter,
  type ETicketFontAssets,
} from "@infrastructure/files/eticket-pdf.adapter";
import type { ETicketPdfTheme } from "@domain/services/eticket-pdf-generator.port";

const theme: ETicketPdfTheme = {
  headerStart: "#FF5A2D",
  headerEnd: "#EC1C24",
  ink: "#111111",
  muted: "#777777",
  line: "#DDDDDD",
  paper: "#FFFFFF",
};

describe("ExpoETicketPdfAdapter", () => {
  it("creates one valid PDF page per issued ticket with vector QR data", async () => {
    const fonts: ETicketFontAssets = {
      regular: readFileSync(
        resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Regular.ttf"),
      ),
      bold: readFileSync(
        resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Bold.ttf"),
      ),
    };
    const result = await new ExpoETicketPdfAdapter(async () => fonts).generate(
      "booking-123",
      [1, 2].map((index) => ({
        bookingId: "booking-123",
        eventName: "Malam Akustik Rintik",
        venue: "Aula Teratai, Bandung",
        startsAt: "2026-11-15T12:30:00Z",
        attendeeName: `Penonton ${index}`,
        attendeeNikMasked: "3573********1114",
        categoryCode: index === 1 ? "REG" : "VIP",
        qrPayload: `opaque-ticket-${index}`,
        ticketCode: `TK-${index}`,
        index: index - 1,
        total: 2,
      })),
      theme,
    );

    expect(result.fileName).toBe("eticket-booking-123.pdf");
    expect(result.mimeType).toBe("application/pdf");
    const bytes = Uint8Array.from(atob(result.base64), (char) =>
      char.charCodeAt(0),
    );
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    const parsed = await PDFDocument.load(bytes);
    expect(parsed.getPageCount()).toBe(2);
  });

  it("retries failed default font loading and safely renders incomplete ticket data", async () => {
    const regularFont = readFileSync(
      resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Regular.ttf"),
    );
    const boldFont = readFileSync(
      resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Bold.ttf"),
    );
    const asArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer;
    const originalFetch = global.fetch;
    const originalPlatform = Object.getOwnPropertyDescriptor(Platform, "OS");
    const fetchMock = jest.fn().mockResolvedValue({ ok: false } as Response);
    const assetSpy = jest.spyOn(Asset, "fromModule").mockImplementation(
      () =>
        ({
          uri: "asset://ticket-font",
          downloadAsync: jest.fn().mockResolvedValue(undefined),
        }) as unknown as ReturnType<typeof Asset.fromModule>,
    );

    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "web",
    });
    global.fetch = fetchMock;

    try {
      const adapter = new ExpoETicketPdfAdapter();
      const ticket = {
        bookingId: "",
        eventName: "Malam Akustik Rintik ".repeat(12),
        venue: "",
        startsAt: "invalid-date",
        attendeeName: "Penonton dengan nama yang sangat panjang ".repeat(8),
        attendeeNikMasked: "",
        categoryCode: "",
        qrPayload: "opaque-ticket-payload",
        ticketCode: "",
        index: 0,
        total: 1,
      };

      await expect(adapter.generate("", [ticket], theme)).rejects.toThrow(
        "Font tiket tidak dapat dimuat.",
      );

      fetchMock.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => asArrayBuffer(regularFont),
      } as Response);
      const result = await adapter.generate("", [ticket], {
        ...theme,
        headerStart: "#fff",
        headerEnd: "invalid",
        ink: "#xyzxyz",
        muted: "#eee",
        line: "no-color",
        paper: "transparent",
      });

      expect(result.fileName).toBe("eticket-booking.pdf");
      expect(fetchMock).toHaveBeenCalledTimes(4);
      const bytes = Uint8Array.from(atob(result.base64), (char) =>
        char.charCodeAt(0),
      );
      const parsed = await PDFDocument.load(bytes);
      expect(parsed.getPageCount()).toBe(1);

      fetchMock.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => asArrayBuffer(boldFont),
      } as Response);
      await adapter.generate("booking/second", [ticket], theme);
      expect(fetchMock).toHaveBeenCalledTimes(4);
      expect(assetSpy).toHaveBeenCalledTimes(4);
    } finally {
      global.fetch = originalFetch;
      assetSpy.mockRestore();
      if (originalPlatform) {
        Object.defineProperty(Platform, "OS", originalPlatform);
      }
    }
  });
});
