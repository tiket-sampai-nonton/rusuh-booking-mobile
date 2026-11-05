/**
 * useETicketShare — platform-aware e-ticket download/share (RBT-071, AC1).
 *
 * web    → open a printable window (Blob/print) the user can save as PDF.
 * native → write a small text manifest to the cache dir and hand it to the OS
 *          share sheet via expo-sharing.
 *
 * The shared/printed content carries only SAFE ticket references (RBT|booking|n)
 * — NEVER a raw NIK / token / PII (D7.1). Platform modules are required lazily
 * so importing this hook in a test (or on the wrong platform) loads nothing.
 */
import { Platform } from "react-native";

import { ticketRef } from "@presentation/components/ETicketCard";

/** Build the plain-text manifest shared/printed (safe refs only, no PII). */
export function buildTicketManifest(
  bookingId: string,
  ticketCount: number,
): string {
  const lines = [`Rusuh Tiket — E-Tiket`, `Nomor Pesanan: ${bookingId}`, ""];
  for (let i = 0; i < ticketCount; i += 1) {
    lines.push(`Tiket ${i + 1}/${ticketCount}: ${ticketRef(bookingId, i)}`);
  }
  lines.push("", "Tunjukkan QR di aplikasi pada gerbang masuk.");
  return lines.join("\n");
}

export interface ETicketShare {
  readonly shareTickets: (
    bookingId: string,
    ticketCount: number,
  ) => Promise<void>;
}

/**
 * Returns a `shareTickets` action. `openPrint` / `writeAndShare` are injected
 * with lazy platform defaults so the hook is deterministic in tests.
 */
export function useETicketShare(
  openPrint: (html: string) => void = defaultOpenPrint,
  writeAndShare: (
    filename: string,
    content: string,
  ) => Promise<void> = defaultWriteAndShare,
): ETicketShare {
  const shareTickets = async (
    bookingId: string,
    ticketCount: number,
  ): Promise<void> => {
    const manifest = buildTicketManifest(bookingId, ticketCount);
    if (Platform.OS === "web") {
      openPrint(
        `<pre style="font:14px/1.6 monospace;padding:24px">${escapeHtml(manifest)}</pre>`,
      );
      return;
    }
    await writeAndShare(`eticket-${bookingId}.txt`, manifest);
  };
  return { shareTickets };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Web default: open a print window with the manifest. */
function defaultOpenPrint(html: string): void {
  const w = (globalThis as { open?: (u?: string) => unknown }).open?.("");
  const win = w as
    | { document?: { write: (s: string) => void; close: () => void }; print?: () => void }
    | undefined;
  if (win?.document) {
    win.document.write(`<html><body>${html}</body></html>`);
    win.document.close();
    win.print?.();
  }
}

/** Native default: write a cache file and hand it to the OS share sheet. */
async function defaultWriteAndShare(
  filename: string,
  content: string,
): Promise<void> {
  const FileSystem = require("expo-file-system") as typeof import("expo-file-system");
  const Sharing = require("expo-sharing") as typeof import("expo-sharing");
  const uri = `${FileSystem.cacheDirectory ?? ""}${filename}`;
  await FileSystem.writeAsStringAsync(uri, content);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
}
