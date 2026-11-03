/**
 * Browse fragment unit tests (RBT-031) — direct renders that exercise the
 * branches the screen-level test doesn't reach on a phone layout: the
 * multi-column desktop grid (columns > 1) and the chip label fallbacks.
 */
import { render, screen } from "@testing-library/react-native";

import type { EventSummary } from "@domain/repositories/event.repository";

import { BrowseChips } from "@presentation/screens/Browse/fragments/BrowseChips";
import { BrowseGrid } from "@presentation/screens/Browse/fragments/BrowseGrid";

function ev(id: string, name: string): EventSummary {
  return {
    id,
    slug: id,
    name,
    venue: "Jakarta",
    salesStartsAt: "2026-11-01T00:00:00.000Z",
    salesEndsAt: "2027-11-01T00:00:00.000Z",
    status: "AVAILABLE",
    startsAt: "2026-12-01T00:00:00.000Z",
    minPriceMinor: 30000000,
    remainingTickets: 300,
  };
}

const EVENTS: readonly EventSummary[] = [ev("a", "A Fest"), ev("b", "B Fest")];

describe("BrowseGrid", () => {
  it("renders a single-column list (phone)", () => {
    render(<BrowseGrid events={EVENTS} onPress={() => {}} columns={1} />);
    expect(screen.getByTestId("v2-event-card-a")).toBeTruthy();
    expect(screen.getByTestId("v2-event-card-b")).toBeTruthy();
  });

  it("renders a multi-column grid (desktop web, columns > 1)", () => {
    render(<BrowseGrid events={EVENTS} onPress={() => {}} columns={3} />);
    expect(screen.getByTestId("browse-grid")).toBeTruthy();
    expect(screen.getByTestId("v2-event-card-a")).toBeTruthy();
    expect(screen.getByTestId("v2-event-card-b")).toBeTruthy();
  });

  it("defaults to a single column when no columns prop is given", () => {
    render(<BrowseGrid events={EVENTS} onPress={() => {}} />);
    expect(screen.getByTestId("v2-event-card-a")).toBeTruthy();
  });
});

describe("BrowseChips", () => {
  it("renders default (unfiltered) labels without a reset button", () => {
    render(
      <BrowseChips
        genre="Semua"
        time="all"
        sort="closest"
        isFiltered={false}
        onRefine={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByText("Semua")).toBeTruthy();
    expect(screen.getByText("Semua waktu")).toBeTruthy();
    expect(screen.getByText("Terdekat")).toBeTruthy();
    expect(screen.queryByTestId("browse-reset")).toBeNull();
  });

  it("maps active time/sort to their Bahasa labels and shows reset", () => {
    render(
      <BrowseChips
        genre="Rock"
        time="week"
        sort="furthest"
        isFiltered
        onRefine={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByText("Rock")).toBeTruthy();
    expect(screen.getByText("Minggu ini")).toBeTruthy();
    expect(screen.getByText("Terjauh")).toBeTruthy();
    expect(screen.getByTestId("browse-reset")).toBeTruthy();
  });

  it("falls back to default labels for unknown time/sort values", () => {
    render(
      <BrowseChips
        genre="Semua"
        time="unknown"
        sort="unknown"
        isFiltered={false}
        onRefine={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByText("Semua waktu")).toBeTruthy();
    expect(screen.getByText("Terdekat")).toBeTruthy();
  });
});
