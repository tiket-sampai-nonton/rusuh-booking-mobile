import { render, screen } from "@testing-library/react-native";
import { Animated, Platform } from "react-native";

import type { DetailHeroProps } from "../../../../../../presentation/screens/EventDetail/interface";
import { DetailHero } from "../../../../../../presentation/screens/EventDetail/fragments/DetailHero/index";
import { SalesPeriod } from "../../../../../../presentation/screens/EventDetail/fragments/SalesPeriod";

const hero: DetailHeroProps = {
  banner: "https://example.com/event.jpg",
  statusLabel: "Tersedia",
  name: "Konser Musik Jakarta",
  meta: "15 November · 19.00 WIB · Jakarta",
  chips: ["Konser", "Usia 18+"],
};

describe("DetailHero", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.spyOn(Animated, "timing").mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    } as never);
    jest.spyOn(Animated, "loop").mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    } as never);
  });

  afterEach(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
    jest.restoreAllMocks();
  });

  it("renders web metadata, chips, and an optional subtitle", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    render(
      <DetailHero {...hero} subtitle="Satu malam bersama musisi terbaik." />,
    );

    expect(screen.getByText(hero.name)).toBeTruthy();
    expect(screen.getByText(hero.statusLabel)).toBeTruthy();
    expect(screen.getByText("15 November")).toBeTruthy();
    expect(screen.getByText("19.00 WIB")).toBeTruthy();
    expect(screen.getByText("Jakarta")).toBeTruthy();
    expect(screen.getByText("Konser")).toBeTruthy();
    expect(screen.getByText("Usia 18+")).toBeTruthy();
    expect(screen.getByText("Satu malam bersama musisi terbaik.")).toBeTruthy();
  });

  it("keeps metadata and chips out of the native hero when chips are empty", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    render(<DetailHero {...hero} chips={[]} statusLabel="Selesai" />);

    expect(screen.getByText(hero.name)).toBeTruthy();
    expect(screen.queryByText("15 November")).toBeNull();
    expect(screen.queryByText("Konser")).toBeNull();
  });

  it.each(["web", "android", "ios"] as const)(
    "displays the sales period in WIB on %s",
    (platform) => {
      Object.defineProperty(Platform, "OS", {
        configurable: true,
        value: platform,
      });
      render(
        <SalesPeriod
          startsAt="2026-11-02T03:00:00Z"
          endsAt="2026-11-15T08:00:00Z"
          variant={platform === "web" ? "inline" : "card"}
        />,
      );
      if (platform === "web") {
        expect(
          screen.getByText(
            "Penjualan: 02 Nov 2026 10:00 – 15 Nov 2026 15:00 WIB",
          ),
        ).toBeTruthy();
      } else {
        expect(screen.getByText("Mulai: 02 Nov 2026 · 10:00 WIB")).toBeTruthy();
        expect(
          screen.getByText("Berakhir: 15 Nov 2026 · 15:00 WIB"),
        ).toBeTruthy();
      }
    },
  );
});
