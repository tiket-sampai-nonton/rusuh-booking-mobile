import type { ETicketPdfGenerator } from "@domain/services/eticket-pdf-generator.port";
import type { FileSharePort } from "@domain/services/file-share.port";
import type {
  ETicketPdfItem,
  ETicketPdfTheme,
} from "@domain/services/eticket-pdf-generator.port";

export interface DownloadETicketsInput {
  readonly bookingId: string;
  readonly tickets: readonly ETicketPdfItem[];
  readonly theme: ETicketPdfTheme;
}

/** Generate and save the e-ticket PDF through the domain ports. */
export class DownloadETickets {
  constructor(
    private readonly pdfGenerator: ETicketPdfGenerator,
    private readonly fileShare: FileSharePort,
  ) {}

  async execute(input: DownloadETicketsInput): Promise<void> {
    if (!input.bookingId || input.tickets.length === 0) {
      throw new Error("E-tiket belum tersedia untuk diunduh.");
    }
    const file = await this.pdfGenerator.generate(
      input.bookingId,
      input.tickets,
      input.theme,
    );
    await this.fileShare.save(file);
  }
}
