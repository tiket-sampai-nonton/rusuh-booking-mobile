import { render, screen, waitFor } from "@testing-library/react-native";

import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

// Dynamic routes read params via expo-router's useLocalSearchParams; stub it so
// the route bodies execute under jest without a navigation container. The Home
// route (RBT-030) now renders the real HomeScreen, which also calls useRouter —
// stub both.
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ eventId: "evt-1" }),
  useRouter: () => ({ push: jest.fn() }),
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

  it("renders Browse placeholder", () => {
    render(<BrowseScreen />);
    expect(screen.getByRole("header")).toHaveTextContent(/Browse/);
  });

  it("renders History placeholder", () => {
    render(<HistoryScreen />);
    expect(screen.getByRole("header")).toHaveTextContent(/History/);
  });

  it("renders Event Detail with the route param", () => {
    render(<EventDetailScreen />);
    expect(screen.getByRole("header")).toHaveTextContent(/evt-1/);
  });
});
