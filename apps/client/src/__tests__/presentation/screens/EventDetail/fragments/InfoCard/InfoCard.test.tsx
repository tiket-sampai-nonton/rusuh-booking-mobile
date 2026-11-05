import { render, screen } from "@testing-library/react-native";
import { Platform } from "react-native";

import { InfoCard } from "../../../../../../presentation/screens/EventDetail/fragments/InfoCard/index";

describe("InfoCard", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform });
  });

  it("shows date, time, and venue on native", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
    render(<InfoCard date="15 November 2026" time="19:00 WIB" venue="Gelora Bung Karno" />);
    expect(screen.getByText("15 November 2026, 19:00 WIB")).toBeTruthy();
    expect(screen.getByText("Gelora Bung Karno")).toBeTruthy();
  });

  it("supports a date without a time and omits the card on web", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    render(<InfoCard date="15 November 2026" time="" venue="Gelora Bung Karno" />);
    expect(screen.queryByText("15 November 2026")).toBeNull();
  });

  it("renders the date alone when the event has no start time", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
    render(<InfoCard date="15 November 2026" time="" venue="Gelora Bung Karno" />);
    expect(screen.getByText("15 November 2026")).toBeTruthy();
  });
});
