import { Asset } from "expo-asset";
import fontkit from "@pdf-lib/fontkit";
import { create as createQr } from "qrcode";
import type { PDFFont, PDFPage } from "pdf-lib";
import { Platform } from "react-native";

import { formatWIBDateID, formatWIBTimeID } from "@domain/services/date-format";
import type {
  ETicketPdfGenerator,
  ETicketPdfItem,
  ETicketPdfTheme,
} from "@domain/services/eticket-pdf-generator.port";
import type { ShareableFile } from "@domain/services/file-share.port";

const PAGE_WIDTH = 420;
const PAGE_HEIGHT = 540;
const QR_BOX_SIZE = 156;
const QR_SIZE = 126;
const LABEL_SIZE = 8;
const VALUE_SIZE = 12;
type PdfLibrary = typeof import("pdf-lib");
type PdfColor = ReturnType<PdfLibrary["rgb"]>;
// pdf-lib 1.17.1's ESM entry imports a tslib 1.x default shim that Metro
// cannot interoperate with. Its self-contained UMD build works across targets.
const { PDFDocument, rgb } =
  require("pdf-lib/dist/pdf-lib.min.js") as PdfLibrary;

export type ETicketFontAssets = {
  regular: Uint8Array;
  bold: Uint8Array;
};
let fontBytesPromise: Promise<ETicketFontAssets> | undefined;

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const result = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    result[index] = binary.charCodeAt(index);
  }
  return result;
}

async function readFontAsset(moduleId: number): Promise<Uint8Array> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  if (Platform.OS === "web") {
    const response = await fetch(asset.uri);
    if (!response.ok) throw new Error("Font tiket tidak dapat dimuat.");
    return new Uint8Array(await response.arrayBuffer());
  }
  const fileSystem = await import("expo-file-system");
  if (!asset.localUri) throw new Error("Font tiket tidak tersedia.");
  const base64 = await fileSystem.readAsStringAsync(asset.localUri, {
    encoding: fileSystem.EncodingType.Base64,
  });
  return base64ToBytes(base64);
}

function getFontBytes(): Promise<ETicketFontAssets> {
  fontBytesPromise ??= Promise.all([
    readFontAsset(require("../../assets/fonts/PlusJakartaSans-Regular.ttf")),
    readFontAsset(require("../../assets/fonts/PlusJakartaSans-Bold.ttf")),
  ])
    .then(([regular, bold]) => ({ regular, bold }))
    .catch((error: unknown) => {
      fontBytesPromise = undefined;
      throw error;
    });
  return fontBytesPromise;
}

function pdfColor(value: string, rgb: PdfLibrary["rgb"]): PdfColor {
  const hex = value.replace(/^#/, "");
  if (!/^[\da-f]{6}$/i.test(hex)) return rgb(0, 0, 0);
  return rgb(
    Number.parseInt(hex.slice(0, 2), 16) / 255,
    Number.parseInt(hex.slice(2, 4), 16) / 255,
    Number.parseInt(hex.slice(4, 6), 16) / 255,
  );
}

function safeFileId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "booking";
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    const finalLine = lines[maxLines - 1] ?? "";
    let clipped = finalLine;
    while (
      clipped.length > 1 &&
      font.widthOfTextAtSize(`${clipped}…`, fontSize) > maxWidth
    ) {
      clipped = clipped.slice(0, -1);
    }
    lines[maxLines - 1] = `${clipped}…`;
  }
  return lines;
}

function drawField(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  regular: PDFFont,
  bold: PDFFont,
  theme: ETicketPdfTheme,
  rgb: PdfLibrary["rgb"],
  alignRight = false,
): void {
  const muted = pdfColor(theme.muted, rgb);
  const ink = pdfColor(theme.ink, rgb);
  const labelWidth = regular.widthOfTextAtSize(label, LABEL_SIZE);
  page.drawText(label, {
    x: alignRight ? x + width - labelWidth : x,
    y,
    size: LABEL_SIZE,
    font: regular,
    color: muted,
  });
  const lines = wrapText(value || "—", bold, VALUE_SIZE, width, 2);
  lines.forEach((line, index) => {
    const lineWidth = bold.widthOfTextAtSize(line, VALUE_SIZE);
    page.drawText(line, {
      x: alignRight ? x + width - Math.min(width, lineWidth) : x,
      y: y - 17 - index * 15,
      size: VALUE_SIZE,
      font: bold,
      color: ink,
    });
  });
}

function drawQr(
  page: PDFPage,
  payload: string,
  theme: ETicketPdfTheme,
  rgb: PdfLibrary["rgb"],
  createQr: typeof import("qrcode").create,
): void {
  const qr = createQr(payload, { errorCorrectionLevel: "M" });
  const boxX = (PAGE_WIDTH - QR_BOX_SIZE) / 2;
  const boxY = 124;
  const inset = (QR_BOX_SIZE - QR_SIZE) / 2;
  const moduleSize = QR_SIZE / qr.modules.size;
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: QR_BOX_SIZE,
    height: QR_BOX_SIZE,
    borderColor: pdfColor(theme.line, rgb),
    borderWidth: 1,
    color: pdfColor(theme.paper, rgb),
  });
  for (let row = 0; row < qr.modules.size; row += 1) {
    for (let column = 0; column < qr.modules.size; column += 1) {
      if (!qr.modules.get(row, column)) continue;
      page.drawRectangle({
        x: boxX + inset + column * moduleSize,
        y: boxY + inset + QR_SIZE - (row + 1) * moduleSize,
        width: moduleSize + 0.08,
        height: moduleSize + 0.08,
        color: pdfColor(theme.ink, rgb),
      });
    }
  }
}

function drawTicket(
  page: PDFPage,
  ticket: ETicketPdfItem,
  regular: PDFFont,
  bold: PDFFont,
  theme: ETicketPdfTheme,
  rgb: PdfLibrary["rgb"],
  createQr: typeof import("qrcode").create,
): void {
  const pad = 28;
  const headerHeight = 74;
  const ink = pdfColor(theme.ink, rgb);
  const white = pdfColor(theme.paper, rgb);
  const red = pdfColor(theme.headerEnd, rgb);
  const lightRed = pdfColor(theme.headerStart, rgb);
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: white,
  });
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - headerHeight,
    width: PAGE_WIDTH,
    height: headerHeight,
    color: red,
  });
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - headerHeight,
    width: 12,
    height: headerHeight,
    color: lightRed,
  });
  const titleLines = wrapText(
    ticket.eventName,
    bold,
    15,
    PAGE_WIDTH - pad * 2,
    2,
  );
  titleLines.forEach((line, index) =>
    page.drawText(line, {
      x: pad,
      y: PAGE_HEIGHT - 39 - index * 18,
      size: 15,
      font: bold,
      color: white,
    }),
  );
  page.drawText(`E-TIKET ${ticket.index + 1} / ${ticket.total}`, {
    x: pad,
    y: PAGE_HEIGHT - 64,
    size: 8,
    font: bold,
    color: white,
  });

  const halfWidth = (PAGE_WIDTH - pad * 2 - 24) / 2;
  const rightX = PAGE_WIDTH - pad - halfWidth;
  drawField(
    page,
    "PENONTON",
    ticket.attendeeName || "Pemegang tiket",
    pad,
    438,
    halfWidth,
    regular,
    bold,
    theme,
    rgb,
  );
  drawField(
    page,
    "NIK",
    ticket.attendeeNikMasked || "••••",
    rightX,
    438,
    halfWidth,
    regular,
    bold,
    theme,
    rgb,
    true,
  );
  drawField(
    page,
    "KATEGORI",
    ticket.categoryCode || "—",
    pad,
    384,
    halfWidth,
    regular,
    bold,
    theme,
    rgb,
  );
  drawField(
    page,
    "TANGGAL",
    formatWIBDateID(ticket.startsAt) || "Menyusul",
    rightX,
    384,
    halfWidth,
    regular,
    bold,
    theme,
    rgb,
    true,
  );
  drawField(
    page,
    "WAKTU",
    formatWIBTimeID(ticket.startsAt) || "Menyusul",
    pad,
    330,
    halfWidth,
    regular,
    bold,
    theme,
    rgb,
  );
  drawField(
    page,
    "VENUE",
    ticket.venue || "Menyusul",
    rightX,
    330,
    halfWidth,
    regular,
    bold,
    theme,
    rgb,
    true,
  );
  page.drawLine({
    start: { x: pad, y: 298 },
    end: { x: PAGE_WIDTH - pad, y: 298 },
    color: pdfColor(theme.line, rgb),
    thickness: 1,
    dashArray: [3, 4],
  });

  drawQr(page, ticket.qrPayload, theme, rgb, createQr);
  const code =
    ticket.ticketCode || `RBT-${ticket.bookingId}-${ticket.index + 1}`;
  const codeWidth = bold.widthOfTextAtSize(code, 10);
  page.drawText(code, {
    x: Math.max(pad, (PAGE_WIDTH - codeWidth) / 2),
    y: 104,
    size: 10,
    font: bold,
    color: ink,
  });
  const ref = `REF: ${ticket.ticketCode || ticket.bookingId}`;
  const refWidth = regular.widthOfTextAtSize(ref, 7);
  page.drawText(ref, {
    x: (PAGE_WIDTH - refWidth) / 2,
    y: 72,
    size: 7,
    font: regular,
    color: pdfColor(theme.muted, rgb),
  });
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

export class ExpoETicketPdfAdapter implements ETicketPdfGenerator {
  constructor(
    private readonly loadFontBytes: () => Promise<ETicketFontAssets> = getFontBytes,
  ) {}

  async generate(
    bookingId: string,
    tickets: readonly ETicketPdfItem[],
    theme: ETicketPdfTheme,
  ): Promise<ShareableFile> {
    if (tickets.length === 0) throw new Error("E-tiket belum tersedia.");
    const assets = await this.loadFontBytes();
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);
    const regular = await pdf.embedFont(assets.regular, { subset: true });
    const bold = await pdf.embedFont(assets.bold, { subset: true });
    pdf.setTitle(`E-Tiket ${bookingId}`);
    pdf.setSubject("E-tiket Rusuh Booking");
    pdf.setCreator("Rusuh Booking");
    for (const ticket of tickets) {
      const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      drawTicket(page, ticket, regular, bold, theme, rgb, createQr);
    }
    return {
      fileName: `eticket-${safeFileId(bookingId)}.pdf`,
      mimeType: "application/pdf",
      base64: encodeBase64(await pdf.save()),
    };
  }
}
