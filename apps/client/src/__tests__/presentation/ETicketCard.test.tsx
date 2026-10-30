import { render, screen } from "@testing-library/react-native";

import { ETicketCard, ticketRef } from "@presentation/components/ETicketCard";

describe("ticketRef", () => {
  it("builds a non-PII reference (booking + 1-based index)", () => {
    expect(ticketRef("bk-1", 0)).toBe("RBT|bk-1|1");
    expect(ticketRef("bk-1", 2)).toBe("RBT|bk-1|3");
  });
});

describe("ETicketCard", () => {
  it("renders the ticket label, QR value and gate hint", () => {
    render(<ETicketCard bookingId="bk-9" index={0} total={2} />);
    expect(screen.getByText("E-Tiket 1 / 2")).toBeTruthy();
    expect(screen.getByText("RBT|bk-9|1")).toBeTruthy();
    expect(screen.getByLabelText("Kode QR tiket")).toBeTruthy();
  });

  it("does not render any raw NIK in the QR payload", () => {
    render(<ETicketCard bookingId="bk-9" index={0} total={1} />);
    // The payload is only RBT|booking|n — assert no 16-digit sequence leaks.
    expect(screen.queryByText(/\d{16}/)).toBeNull();
  });
});
