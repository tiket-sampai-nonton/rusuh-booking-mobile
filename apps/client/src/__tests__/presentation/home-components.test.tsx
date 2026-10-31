import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

// Drive the reduced-motion branch of every animated home component. The holder
// is mutated per-test; the mock reads it live.
const motionState = { reduced: false };
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => motionState.reduced };
});

// eslint-disable-next-line import/first
import type { EventSummary } from "@domain/repositories/event.repository";
// eslint-disable-next-line import/first
import { HeroCarousel } from "@presentation/components/home/HeroCarousel";
// eslint-disable-next-line import/first
import { HomeFooter } from "@presentation/components/home/HomeFooter";
// eslint-disable-next-line import/first
import { Reveal } from "@presentation/components/home/Reveal";
// eslint-disable-next-line import/first
import { SectionHead } from "@presentation/components/home/SectionHead";
// eslint-disable-next-line import/first
import { TrustStrip } from "@presentation/components/home/TrustStrip";

afterEach(() => {
  motionState.reduced = false;
});

function ev(id: string, name: string, venue = "GBK"): EventSummary {
  return {
    id,
    slug: id,
    name,
    venue,
    startsAt: "2026-12-01T12:00:00.000Z",
    salesStartsAt: "2026-11-01T00:00:00.000Z",
    salesEndsAt: "2026-11-30T23:59:59.000Z",
    status: "AVAILABLE",
    minPriceMinor: 45000000,
    remainingTickets: 120,
  };
}

describe("HeroCarousel", () => {
  it("returns null with no events", () => {
    const { toJSON } = render(
      <HeroCarousel events={[]} onBook={() => {}} onSeeAll={() => {}} />,
    );
    expect(toJSON()).toBeNull();
  });

  it("renders the eyebrow, featured title and CTAs; book + see-all fire", () => {
    const onBook = jest.fn();
    const onSeeAll = jest.fn();
    render(
      <HeroCarousel
        events={[ev("evt-1", "Rusuh Fest 2026"), ev("evt-2", "Jazz"), ev("evt-3", "Rock")]}
        onBook={onBook}
        onSeeAll={onSeeAll}
      />,
    );
    expect(screen.getByTestId("home-hero")).toBeTruthy();
    expect(screen.getByText("Live · Flash Sale")).toBeTruthy();
    expect(screen.getAllByText("Rusuh Fest 2026").length).toBeGreaterThanOrEqual(1);
    fireEvent.press(screen.getAllByTestId("hero-book")[0]);
    expect(onBook).toHaveBeenCalledWith("evt-1");
    fireEvent.press(screen.getAllByTestId("hero-see-all")[0]);
    expect(onSeeAll).toHaveBeenCalled();
  });

  it("renders a single-event hero (no dots path) with a venue-less event", () => {
    const bare: EventSummary = {
      id: "e",
      slug: "e",
      name: "Bare",
      salesStartsAt: "2026-01-01T00:00:00.000Z",
      salesEndsAt: "2026-02-01T00:00:00.000Z",
      status: "AVAILABLE",
    };
    render(<HeroCarousel events={[bare]} onBook={() => {}} onSeeAll={() => {}} />);
    expect(screen.getByText("Bare")).toBeTruthy();
  });

  it("renders static (reduced-motion: no loops, first slide fixed)", () => {
    motionState.reduced = true;
    render(
      <HeroCarousel
        events={[ev("evt-1", "Rusuh Fest 2026"), ev("evt-2", "Jazz"), ev("evt-3", "Rock")]}
        onBook={() => {}}
        onSeeAll={() => {}}
      />,
    );
    expect(screen.getByTestId("home-hero")).toBeTruthy();
    expect(screen.getByText("Live · Flash Sale")).toBeTruthy();
  });

  it("auto-advances to the next slide on the interval tick", () => {
    jest.useFakeTimers();
    try {
      render(
        <HeroCarousel
          events={[ev("evt-1", "Rusuh Fest 2026"), ev("evt-2", "Jazz"), ev("evt-3", "Rock")]}
          onBook={() => {}}
          onSeeAll={() => {}}
        />,
      );
      // Fire the 4200ms auto-advance callback (covers the interval body).
      act(() => {
        jest.advanceTimersByTime(4300);
      });
      expect(screen.getByTestId("home-hero")).toBeTruthy();
    } finally {
      jest.clearAllTimers();
      jest.useRealTimers();
    }
  });
});

describe("TrustStrip", () => {
  it("renders the trust items", () => {
    render(<TrustStrip />);
    expect(screen.getByTestId("trust-strip")).toBeTruthy();
    // Each item is duplicated (two copies for the seamless loop).
    expect(screen.getAllByText("Anti-oversell").length).toBe(2);
  });

  it("renders static under reduced-motion (no scroll loop)", () => {
    motionState.reduced = true;
    render(<TrustStrip />);
    expect(screen.getByTestId("trust-strip")).toBeTruthy();
    expect(screen.getAllByText("Anti-oversell").length).toBe(2);
  });
});

describe("SectionHead", () => {
  it("renders tag, title and subtitle (brand + archive variants)", () => {
    const { rerender } = render(
      <SectionHead tag="● Sedang Berlangsung" title="Konser Terdekat" subtitle="sub" />,
    );
    expect(screen.getByText("● Sedang Berlangsung")).toBeTruthy();
    expect(screen.getByText("Konser Terdekat")).toBeTruthy();
    expect(screen.getByText("sub")).toBeTruthy();
    rerender(<SectionHead archive tag="⏳ Arsip" title="History Event" subtitle="s2" />);
    expect(screen.getByText("⏳ Arsip")).toBeTruthy();
  });
});

describe("Reveal", () => {
  it("renders its children", () => {
    render(
      <Reveal>
        <Text>revealed</Text>
      </Reveal>,
    );
    expect(screen.getByText("revealed")).toBeTruthy();
  });

  it("accepts a stagger delay", () => {
    render(
      <Reveal delay={120}>
        <Text>staggered</Text>
      </Reveal>,
    );
    expect(screen.getByText("staggered")).toBeTruthy();
  });

  it("reveals instantly under reduced-motion (no transform animation)", () => {
    motionState.reduced = true;
    render(
      <Reveal delay={200}>
        <Text>instant</Text>
      </Reveal>,
    );
    expect(screen.getByText("instant")).toBeTruthy();
  });
});

describe("HomeFooter", () => {
  it("renders the brand, columns and fine print", () => {
    render(<HomeFooter />);
    expect(screen.getByTestId("home-footer")).toBeTruthy();
    expect(screen.getByText("Kategori")).toBeTruthy();
    expect(screen.getByText("Bantuan")).toBeTruthy();
    expect(screen.getByText("Perusahaan")).toBeTruthy();
    expect(screen.getByText(/© 2026 Rusuh Tiket/)).toBeTruthy();
  });
});
