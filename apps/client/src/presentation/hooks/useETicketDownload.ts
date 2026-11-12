import { useCallback } from "react";
import { toString as renderQrSvg } from "qrcode";

import { designColors } from "@presentation/theme";
import { useServices } from "@providers/service-context";

function utf8Base64(value: string): string {
  const binary = encodeURIComponent(value).replace(
    /%([0-9A-F]{2})|([^%])/gi,
    (_match, hex: string | undefined, character: string | undefined) =>
      hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : (character ?? ""),
  );
  return btoa(binary);
}

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

function safeFileId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "booking";
}

/** Save the safe ticket-reference file directly through the platform adapter. */
export function useETicketDownload() {
  const { fileShare } = useServices();
  return {
    downloadTickets: useCallback(
      async (
        bookingId: string,
        ticketCount: number,
        qrPayloads: readonly string[],
        eventName?: string,
        ticketCodes?: readonly string[],
      ) => {
        const qrImages = await Promise.all(
          Array.from({ length: ticketCount }, async (_, index) => {
            const qrPayload = qrPayloads[index];
            if (!qrPayload) return "";
            const svg = await renderQrSvg(qrPayload, {
              type: "svg",
              margin: 1,
            });
            return utf8Base64(svg);
          }),
        );
        const tickets = Array.from(
          { length: ticketCount },
          (_, index) => `
        <article class="ticket">
          <h2>E-Tiket ${index + 1} / ${ticketCount}</h2>
          <img alt="Kode QR tiket ${index + 1}" src="data:image/svg+xml;base64,${qrImages[index] ?? ""}" />
          <p class="code">${escapeHtml(ticketCodes?.[index] ?? `RBT|${bookingId}|${index + 1}`)}</p>
          ${eventName ? `<h3>${escapeHtml(eventName)}</h3>` : ""}
          <p>Tunjukkan QR ini di gerbang masuk.</p>
        </article>`,
        ).join("");
        const content = `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>E-Tiket ${escapeHtml(bookingId)}</title><style>body{font:16px Arial,sans-serif;color:${designColors.ink};margin:24px}.ticket{max-width:420px;border:2px solid ${designColors.ink};margin:0 auto 24px;page-break-after:always;padding:20px;text-align:center}.ticket h2{margin:-20px -20px 20px;padding:14px;background:${designColors.ink};color:${designColors.ground};text-align:left;font-size:16px}.ticket img{width:240px;height:240px}.ticket h3{text-transform:uppercase}.code{font:700 13px monospace;letter-spacing:1px} @media print{body{margin:0}}</style><body>${tickets}</body></html>`;
        await fileShare.save({
          fileName: `eticket-${safeFileId(bookingId)}.html`,
          mimeType: "text/html",
          base64: utf8Base64(content),
        });
      },
      [fileShare],
    ),
  };
}
