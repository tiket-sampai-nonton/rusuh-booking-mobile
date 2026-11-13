import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PDFDocument } from "pdf-lib";

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
});
