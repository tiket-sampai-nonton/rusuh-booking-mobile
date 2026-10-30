import { fireEvent, render, screen } from "@testing-library/react-native";

import type { EventSummary } from "@domain/repositories/event.repository";
import { EventHero } from "@presentation/components/EventHero";

function ev(id: string, name: string): EventSummary {
  return {
    id,
    slug: id,
    name,
    venue: "GBK Jakarta",
    startsAt: "2026-12-01T12:00:00.000Z",
    salesStartsAt: "2026-11-01T00:00:00.000Z",
    salesEndsAt: "2026-11-30T23:59:59.000Z",
    status: "AVAILABLE",
    minPriceMinor: 45000000,
    remainingTickets: 120,
  };
}

describe("EventHero", () => {
  it("renders null when there are no events", () => {
    const { toJSON } = render(
      <EventHero events={[]} onBook={() => {}} onSeeAll={() => {}} />,
    );
    expect(toJSON()).toBeNull();
  });

  it("features the first event with its meta and CTAs", () => {
    render(
      <EventHero
        events={[ev("evt-1", "Rusuh Fest 2026"), ev("evt-2", "Jazz Senja")]}
        onBook={() => {}}
        onSeeAll={() => {}}
      />,
    );
    expect(screen.getByTestId("home-hero")).toBeTruthy();
    expect(screen.getByText("Rusuh Fest 2026")).toBeTruthy();
    expect(screen.getByText(/GBK Jakarta/)).toBeTruthy();
    expect(screen.getByText(/01-Des-2026/)).toBeTruthy();
    expect(screen.getByTestId("hero-book")).toBeTruthy();
    expect(screen.getByTestId("hero-see-all")).toBeTruthy();
  });

  it("books the featured event and sees-all", () => {
    const onBook = jest.fn();
    const onSeeAll = jest.fn();
    render(
      <EventHero events={[ev("evt-1", "Fest")]} onBook={onBook} onSeeAll={onSeeAll} />,
    );
    fireEvent.press(screen.getByTestId("hero-book"));
    expect(onBook).toHaveBeenCalledWith("evt-1");
    fireEvent.press(screen.getByTestId("hero-see-all"));
    expect(onSeeAll).toHaveBeenCalled();
  });

  it("renders a single-event hero without dots", () => {
    render(
      <EventHero events={[ev("evt-1", "Solo")]} onBook={() => {}} onSeeAll={() => {}} />,
    );
    expect(screen.getByText("Solo")).toBeTruthy();
  });

  it("omits venue and date when the featured event has neither", () => {
    const bare: EventSummary = {
      id: "evt-x",
      slug: "x",
      name: "Bare Event",
      salesStartsAt: "2026-01-01T00:00:00.000Z",
      salesEndsAt: "2026-02-01T00:00:00.000Z",
      status: "AVAILABLE",
      // no venue, no startsAt
    };
    render(<EventHero events={[bare]} onBook={() => {}} onSeeAll={() => {}} />);
    expect(screen.getByText("Bare Event")).toBeTruthy();
    expect(screen.queryByText(/📍/)).toBeNull();
    expect(screen.queryByText(/🗓/)).toBeNull();
  });
});
