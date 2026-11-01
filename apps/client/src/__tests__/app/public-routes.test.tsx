import { render, screen, waitFor } from "@testing-library/react-native";

import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

// Dynamic routes read params via expo-router's useLocalSearchParams; stub it so
// the route bodies execute under jest without a navigation container. The Home
// route (RBT-030) now renders the real HomeScreen, which also calls useRouter —
// stub both.
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ eventId: "evt-1" }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// eslint-disable-next-line import/first
import HomeScreen from "../../app/(public)/index";
// eslint-disable-next-line import/first
import BrowseScreen from "../../app/(public)/browse";
// eslint-disable-next-line import/first
import HistoryScreen from "../../app/(public)/history";
// eslint-disable-next-line import/first
import EventDetailScreen from "../../app/(public)/events/[eventId]";

describe("(public) routes", () => {
  it("export component functions", () => {
    expect(typeof HomeScreen).toBe("function");
    expect(typeof BrowseScreen).toBe("function");
    expect(typeof HistoryScreen).toBe("function");
    expect(typeof EventDetailScreen).toBe("function");
  });

  it("renders the Home screen (RBT-030: real event catalog, not a placeholder)", async () => {
    // The Home route wires the mock catalog through the provider stack; the
    // "Konser Terdekat" / "History Event" sections prove the real screen mounts.
    renderWithProviders(<HomeScreen />);
    await waitFor(() =>
      expect(screen.getByText("Konser Terdekat")).toBeTruthy(),
    );
    expect(screen.getByText("History Event")).toBeTruthy();
  });

  it("renders the Browse screen (RBT-031: real URL-driven results, not a placeholder)", async () => {
    // The Browse route wires the mock catalog through the provider stack and
    // reads filters from the URL; the "Event Terfilter" header + a result count
    // prove the real screen mounts.
    renderWithProviders(<BrowseScreen />);
    await waitFor(() =>
      expect(screen.getByText("Event Terfilter")).toBeTruthy(),
    );
    expect(screen.getByTestId("browse-count")).toBeTruthy();
  });

  it("renders History placeholder", () => {
    render(<HistoryScreen />);
    expect(screen.getByRole("header")).toHaveTextContent(/History/);
  });

  it("renders the Event Detail screen for the route param (RBT-032: real detail, not a placeholder)", async () => {
    // The route reads eventId=evt-1 (stubbed) and wires the mock event through
    // the provider stack; the resolved event name proves the real screen mounts.
    renderWithProviders(<EventDetailScreen />);
    await waitFor(() =>
      expect(
        screen.getAllByText("Rusuh Fest 2026").length,
      ).toBeGreaterThanOrEqual(1),
    );
  });
});
