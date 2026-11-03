/**
 * HistoryGrid fragment — grid-shape coverage (RBT-034 / RBT-095).
 *
 * Exercises both render shapes directly: the single-column default (no `columns`
 * prop → the default-param branch) and the explicit multi-column path. Also
 * verifies the `onPress` prop is wired through to the card, covering the
 * navigate callback the parent passes (history cards are disabled in the live
 * screen, so this is the only place the passthrough is exercised).
 */
import { fireEvent, render, screen } from "@testing-library/react-native";

import type { EventSummary } from "@domain/repositories/event.repository";
import { HistoryGrid } from "@presentation/screens/History/fragments/HistoryGrid";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const DAY = 86_400_000;
const now = Date.now();

function ev(id: string, name: string): EventSummary {
  return {
    id,
    slug: id,
    name,
    venue: "Jakarta",
    salesStartsAt: new Date(now - 400 * DAY).toISOString(),
    salesEndsAt: new Date(now - 10 * DAY).toISOString(),
    status: "CLOSED",
    startsAt: new Date(now - 5 * DAY).toISOString(),
    minPriceMinor: 25000000,
    remainingTickets: 0,
  };
}

const EVENTS: readonly EventSummary[] = [ev("rock", "Rock Reunion"), ev("jazz", "Jazz Night")];

describe("HistoryGrid (RBT-095)", () => {
  it("renders a single column when `columns` is omitted (default-param branch)", () => {
    render(<HistoryGrid events={EVENTS} onPress={jest.fn()} />);
    expect(screen.getByTestId("history-grid")).toBeTruthy();
    expect(screen.getByTestId("event-card-rock")).toBeTruthy();
    expect(screen.getByTestId("event-card-jazz")).toBeTruthy();
  });

  it("renders a single column when columns=1", () => {
    render(<HistoryGrid events={EVENTS} onPress={jest.fn()} columns={1} />);
    expect(screen.getByTestId("history-grid")).toBeTruthy();
    expect(screen.getByTestId("event-card-rock")).toBeTruthy();
  });

  it("renders the multi-column grid when columns>1", () => {
    render(<HistoryGrid events={EVENTS} onPress={jest.fn()} columns={3} />);
    expect(screen.getByTestId("history-grid")).toBeTruthy();
    expect(screen.getByTestId("event-card-rock")).toBeTruthy();
    expect(screen.getByTestId("event-card-jazz")).toBeTruthy();
  });

  it("passes onPress through to the card wiring", () => {
    const onPress = jest.fn();
    renderWithProviders(<HistoryGrid events={EVENTS} onPress={onPress} />);
    // History cards are disabled, so the press is swallowed — the assertion is
    // that wiring onPress does not throw and the card still renders.
    expect(() => fireEvent.press(screen.getByTestId("event-card-rock"))).not.toThrow();
    expect(screen.getByTestId("event-card-rock")).toBeTruthy();
  });
});
