import { useCallback } from "react";

import { useServices } from "@providers/service-context";

function utf8Base64(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function safeFileId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "booking";
}

/** Save the safe ticket-reference file directly through the platform adapter. */
export function useETicketDownload() {
  const { fileShare } = useServices();
  return {
    downloadTickets: useCallback(async (bookingId: string, ticketCount: number, qrImages: readonly string[], eventName?: string, ticketCodes?: readonly string[]) => {
      const tickets = Array.from({ length: ticketCount }, (_, index) => `
        <article class="ticket">
          <h2>E-Tiket ${index + 1} / ${ticketCount}</h2>
          <img alt="Kode QR tiket ${index + 1}" src="data:image/png;base64,${qrImages[index] ?? ""}" />
          <p class="code">${escapeHtml(ticketCodes?.[index] ?? `RBT|${bookingId}|${index + 1}`)}</p>
          ${eventName ? `<h3>${escapeHtml(eventName)}</h3>` : ""}
          <p>Tunjukkan QR ini di gerbang masuk.</p>
        </article>`).join("");
      const content = `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>E-Tiket ${escapeHtml(bookingId)}</title><style>body{font:16px Arial,sans-serif;color:#111;margin:24px}.ticket{max-width:420px;border:2px solid #111;margin:0 auto 24px;page-break-after:always;padding:20px;text-align:center}.ticket h2{margin:-20px -20px 20px;padding:14px;background:#111;color:#fff;text-align:left;font-size:16px}.ticket img{width:240px;height:240px}.ticket h3{text-transform:uppercase}.code{font:700 13px monospace;letter-spacing:1px} @media print{body{margin:0}}</style><body>${tickets}</body></html>`;
      await fileShare.save({
        fileName: `eticket-${safeFileId(bookingId)}.html`,
        mimeType: "text/html",
        base64: utf8Base64(content),
      });
    }, [fileShare]),
  };
}
