/**
 * RBT-071 — ETicketCard + ticketRef: a safe QR reference, never PII.
 */
import { render } from "@testing-library/react-native";
import React from "react";

import { ETicketCard, ticketRef } from "@presentation/components/ETicketCard";

describe("ticketRef (RBT-071)", () => {
  it("encodes a safe reference (RBT|booking|n), 1-based index, no PII", () => {
    expect(ticketRef("bk-1", 0)).toBe("RBT|bk-1|1");
    expect(ticketRef("bk-1", 2)).toBe("RBT|bk-1|3");
    // never a 16-digit NIK
    expect(/\d{16}/.test(ticketRef("bk-1", 0))).toBe(false);
  });
});

describe("ETicketCard (RBT-071)", () => {
  it("renders the card + QR whose value is the safe ticket ref", () => {
    const screen = render(<ETicketCard bookingId="bk-1" index={0} total={3} />);
    expect(screen.getByTestId("eticket-0")).toBeTruthy();
    // QR mock carries the encoded value as accessibilityLabel
    expect(screen.getByLabelText("RBT|bk-1|1")).toBeTruthy();
    expect(screen.getByText("E-Tiket 1 / 3")).toBeTruthy();
  });

  it("the rendered card never contains a raw 16-digit NIK", () => {
    const screen = render(<ETicketCard bookingId="bk-9" index={1} total={2} />);
    expect(screen.queryByText(/\d{16}/)).toBeNull();
  });

  it("shows event details with safe fallbacks when optional details are missing", () => {
    const screen = render(
      <ETicketCard
        bookingId="bk-2"
        index={0}
        total={1}
        eventName="Rusuh Fest"
      />,
    );
    expect(screen.getByText("Rusuh Fest")).toBeTruthy();
    expect(screen.getByText("Pemegang tiket · ••••")).toBeTruthy();
    expect(screen.getByText("Tanggal menyusul · Lokasi menyusul")).toBeTruthy();
  });

  it("renders provided event and attendee details", () => {
    const screen = render(
      <ETicketCard
        bookingId="bk-3"
        index={1}
        total={2}
        eventName="Rusuh Fest"
        venue="Gelora Bung Karno"
        startsAt="15 November 2026"
        attendeeName="Penonton QA"
        attendeeNikMasked="31****99"
      />,
    );
    expect(screen.getByText("Penonton QA · 31****99")).toBeTruthy();
    expect(
      screen.getByText("15 November 2026 · Gelora Bung Karno"),
    ).toBeTruthy();
  });
});
