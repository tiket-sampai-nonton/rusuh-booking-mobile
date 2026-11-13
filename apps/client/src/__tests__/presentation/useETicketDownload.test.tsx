import { renderHook } from "@testing-library/react-native";
import React from "react";

import type {
  FileSharePort,
  ShareableFile,
} from "@domain/services/file-share.port";
import type { ETicketPdfGenerator } from "@domain/services/eticket-pdf-generator.port";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { useETicketDownload } from "@presentation/hooks/useETicketDownload";

function renderDownload(
  save: jest.Mock,
  generatedFile: ShareableFile = {
    fileName: "eticket-booking-id.pdf",
    mimeType: "application/pdf",
    base64: "JVBERi0xLjQK",
  },
) {
  const base = createContainer({ useMocks: true });
  const fileShare: FileSharePort = { save, share: jest.fn() };
  const eticketPdfGenerator: ETicketPdfGenerator = {
    generate: jest.fn().mockResolvedValue(generatedFile),
  };
  const container: Container = { ...base, fileShare, eticketPdfGenerator };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ServiceProvider container={container}>{children}</ServiceProvider>
  );
  return {
    ...renderHook(() => useETicketDownload(), { wrapper }),
    eticketPdfGenerator,
  };
}

const sampleTicket = {
  bookingId: "booking/id",
  eventName: `Rock & <Night> "'`,
  venue: "Aula Teratai, Bandung",
  startsAt: "2026-11-15T12:30:00Z",
  attendeeName: "Penonton QA",
  attendeeNikMasked: "3573********1114",
  categoryCode: "VIP",
  qrPayload: "opaque-safe-qr-payload",
  ticketCode: "TK-001",
  index: 0,
  total: 1,
};

describe("useETicketDownload", () => {
  it("generates and saves a PDF with event, attendee, category, and QR data", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const { result, eticketPdfGenerator } = renderDownload(save);

    await result.current.downloadTickets("booking/id", [sampleTicket]);

    expect(eticketPdfGenerator.generate).toHaveBeenCalledWith(
      "booking/id",
      [sampleTicket],
      expect.objectContaining({ headerStart: expect.any(String) }),
    );
    expect(save).toHaveBeenCalledWith({
      fileName: "eticket-booking-id.pdf",
      mimeType: "application/pdf",
      base64: "JVBERi0xLjQK",
    });
  });

  it("rejects an empty ticket collection and does not save a file", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const { result, eticketPdfGenerator } = renderDownload(save);

    await expect(
      result.current.downloadTickets("booking-2", []),
    ).rejects.toThrow("E-tiket belum tersedia untuk diunduh.");
    expect(eticketPdfGenerator.generate).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});
