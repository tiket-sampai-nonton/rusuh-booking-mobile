import { useCallback } from "react";

import { DownloadETickets } from "@application/tickets/download-etickets.use-case";
import type { ETicketPdfItem } from "@domain/services/eticket-pdf-generator.port";
import { designColors } from "@presentation/theme";
import { useServices } from "@providers/service-context";

/** Presentation hook: forwards the ticket data to the application use case. */
export function useETicketDownload() {
  const { eticketPdfGenerator, fileShare } = useServices();
  return {
    downloadTickets: useCallback(
      async (bookingId: string, tickets: readonly ETicketPdfItem[]) => {
        await new DownloadETickets(eticketPdfGenerator, fileShare).execute({
          bookingId,
          tickets,
          theme: {
            headerStart: designColors.ember,
            headerEnd: designColors.danger,
            ink: designColors.ink,
            muted: designColors.gray,
            line: designColors.field,
            paper: designColors.ground,
          },
        });
      },
      [eticketPdfGenerator, fileShare],
    ),
  };
}
