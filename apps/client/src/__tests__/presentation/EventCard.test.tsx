import { fireEvent, render, screen } from "@testing-library/react-native";

import type { EventSummary } from "@domain/repositories/event.repository";
import { EventCard } from "@presentation/components/EventCard";
import { StatusBadge } from "@presentation/components/StatusBadge";

const available: EventSummary = {
  id: "evt-1",
  slug: "e",
  name: "Rusuh Fest 2026",
  venue: "GBK Jakarta",
  startsAt: "2026-12-01T12:00:00.000Z",
  salesStartsAt: "2026-11-01T00:00:00.000Z",
  salesEndsAt: "2026-11-30T23:59:59.000Z",
  status: "AVAILABLE",
  minPriceMinor: 45000000,
  remainingTickets: 120,
};

describe("StatusBadge", () => {
  it("renders the label with an accessible status label (not color-only)", () => {
    render(<StatusBadge tone="ok" label="Tersedia" />);
    expect(screen.getByLabelText("Status: Tersedia")).toBeTruthy();
    expect(screen.getByText("Tersedia")).toBeTruthy();
  });

  it("renders each tone", () => {
    for (const tone of ["ok", "low", "soon", "soldout", "done"] as const) {
      const { unmount } = render(<StatusBadge tone={tone} label={tone} />);
      expect(screen.getByText(tone)).toBeTruthy();
      unmount();
    }
  });
});

describe("EventCard (1:1 prototype .card)", () => {
  it("renders name, venue, date, compact price tag, qty and badge", () => {
    render(<EventCard event={available} onPress={() => {}} />);
    expect(screen.getByText("Rusuh Fest 2026")).toBeTruthy();
    expect(screen.getByText(/GBK Jakarta/)).toBeTruthy();
    expect(screen.getByText(/01-Des-2026/)).toBeTruthy();
    // Compact price tag (prototype card: "Rp 450rb"), not the full form.
    expect(screen.getByText("Rp 450rb")).toBeTruthy();
    // Availability qty (nested: bold count + " tiket tersedia").
    expect(screen.getByText("120")).toBeTruthy();
    expect(screen.getByText(/tiket tersedia/)).toBeTruthy();
    // 120 < low-stock threshold (200) → "Stok Menipis" badge.
    expect(screen.getByText("Stok Menipis")).toBeTruthy();
  });

  it("calls onPress with the event id when enterable", () => {
    const onPress = jest.fn();
    render(<EventCard event={available} onPress={onPress} />);
    fireEvent.press(screen.getByTestId("event-card-evt-1"));
    expect(onPress).toHaveBeenCalledWith("evt-1");
  });

  it("disables a SOLD_OUT card: no price tag, Sold Out badge + avail", () => {
    const onPress = jest.fn();
    const soldOut: EventSummary = {
      ...available,
      id: "evt-4",
      status: "SOLD_OUT",
      remainingTickets: 0,
    };
    render(<EventCard event={soldOut} onPress={onPress} />);
    fireEvent.press(screen.getByTestId("event-card-evt-4"));
    expect(onPress).not.toHaveBeenCalled();
    // "Sold Out" appears in the badge; the foot avail reads "Sold Out" too.
    expect(screen.getAllByText("Sold Out").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Rp 450rb")).toBeNull();
  });

  it("renders a CLOSED card with the Selesai badge + 'Event selesai' avail", () => {
    const closed: EventSummary = {
      ...available,
      id: "evt-5",
      status: "CLOSED",
      remainingTickets: 0,
    };
    render(<EventCard event={closed} onPress={() => {}} />);
    expect(screen.getByText("Selesai")).toBeTruthy();
    expect(screen.getByText("Event selesai")).toBeTruthy();
  });

  it("renders the history (dimmed, non-interactive) variant", () => {
    const onPress = jest.fn();
    render(<EventCard event={available} onPress={onPress} history />);
    fireEvent.press(screen.getByTestId("event-card-evt-1"));
    expect(onPress).not.toHaveBeenCalled();
    // A history card is forced disabled → shows the Sold-Out-style avail.
    expect(screen.getByText("Sold Out")).toBeTruthy();
  });

  it("shows a date-less card when optional fields are absent", () => {
    const sparse: EventSummary = {
      id: "evt-9",
      slug: "s",
      name: "Sparse Event",
      salesStartsAt: "2026-01-01T00:00:00.000Z",
      salesEndsAt: "2026-02-01T00:00:00.000Z",
      status: "AVAILABLE",
    };
    render(<EventCard event={sparse} onPress={() => {}} />);
    // No minPrice → compact of 0 renders "Rp 0".
    expect(screen.getByText("Rp 0")).toBeTruthy();
    // No remainingTickets → qty count "0".
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.queryByText(/🗓/)).toBeNull();
    expect(screen.queryByText(/📍/)).toBeNull();
  });
});
