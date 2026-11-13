/** Build the plain-text manifest shared/printed (safe refs only, no PII). */
export function buildTicketManifest(
  bookingId: string,
  ticketCount: number,
  ticketCodes: readonly string[] = [],
): string {
  const lines = [`Rusuh Tiket — E-Tiket`, `Nomor Pesanan: ${bookingId}`, ""];
  for (let i = 0; i < ticketCount; i += 1) {
    if (ticketCodes[i])
      lines.push(`Tiket ${i + 1}/${ticketCount}: ${ticketCodes[i]}`);
  }
  lines.push("", "Tunjukkan QR di aplikasi pada gerbang masuk.");
  return lines.join("\n");
}
