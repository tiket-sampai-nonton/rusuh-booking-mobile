import type { ShareableFile } from "@domain/services/file-share.port";

export interface ETicketPdfItem {
  readonly bookingId: string;
  readonly eventName: string;
  readonly venue?: string;
  readonly startsAt?: string;
  readonly attendeeName?: string;
  readonly attendeeNikMasked?: string;
  readonly categoryCode?: string;
  readonly qrPayload: string;
  readonly ticketCode: string;
  readonly index: number;
  readonly total: number;
}

export interface ETicketPdfTheme {
  readonly headerStart: string;
  readonly headerEnd: string;
  readonly ink: string;
  readonly muted: string;
  readonly line: string;
  readonly paper: string;
}

/** Creates a platform-neutral PDF containing issued tickets and their QR data. */
export interface ETicketPdfGenerator {
  generate(
    bookingId: string,
    tickets: readonly ETicketPdfItem[],
    theme: ETicketPdfTheme,
  ): Promise<ShareableFile>;
}
