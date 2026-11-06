import { renderHook } from "@testing-library/react-native";
import React from "react";

import type { FileSharePort } from "@domain/services/file-share.port";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { useETicketDownload } from "@presentation/hooks/useETicketDownload";

function renderDownload(save: jest.Mock) {
  const base = createContainer({ useMocks: true });
  const fileShare: FileSharePort = { save, share: jest.fn() };
  const container: Container = { ...base, fileShare };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ServiceProvider container={container}>{children}</ServiceProvider>
  );
  return renderHook(() => useETicketDownload(), { wrapper });
}

function savedHtml(save: jest.Mock): string {
  const savedFile = save.mock.calls[0]?.[0] as { base64: string } | undefined;
  if (!savedFile) throw new Error("Expected an e-ticket file to be saved.");
  return decodeBase64Utf8(savedFile.base64);
}

function decodeBase64Utf8(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

describe("useETicketDownload", () => {
  it("saves printable Indonesian ticket HTML with safe names and escaped dynamic content", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const { result } = renderDownload(save);

    await result.current.downloadTickets(
      "booking/id",
      2,
      ["safe-qr-one"],
      `Rock & <Night> "'`,
      ["<VIP&>"],
    );

    expect(save).toHaveBeenCalledWith({
      fileName: "eticket-booking-id.html",
      mimeType: "text/html",
      base64: expect.any(String),
    });
    const html = savedHtml(save);
    expect(html).toContain('<html lang="id">');
    expect(html).toContain("E-Tiket 1 / 2");
    expect(html).toContain("E-Tiket 2 / 2");
    const qrDataUrls = [
      ...html.matchAll(/src="data:image\/svg\+xml;base64,([^"]*)"/g),
    ].map((match) => match[1]);
    expect(qrDataUrls).toHaveLength(2);
    expect(decodeBase64Utf8(qrDataUrls[0] ?? "")).toContain("<svg");
    expect(qrDataUrls[1]).toBe("");
    expect(html).toContain("Rock &amp; &lt;Night&gt; &quot;&#39;");
    expect(html).toContain("&lt;VIP&amp;&gt;");
    expect(html).toContain("RBT|booking/id|2");
    expect(html).toContain("Tunjukkan QR ini di gerbang masuk.");
  });

  it("handles empty order IDs, no event name, and zero tickets", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const { result } = renderDownload(save);

    await result.current.downloadTickets("", 0, []);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: "eticket-booking.html" }),
    );
    const html = savedHtml(save);
    expect(html).not.toContain('<article class="ticket">');
    expect(html).not.toContain("<h3>");
  });

  it("exports a ticket without optional event or QR details", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const { result } = renderDownload(save);

    await result.current.downloadTickets("booking-3", 1, []);

    const html = savedHtml(save);
    expect(html).toContain("RBT|booking-3|1");
    expect(html).toContain('src="data:image/svg+xml;base64,"');
    expect(html).not.toContain("<h3>");
  });
});
