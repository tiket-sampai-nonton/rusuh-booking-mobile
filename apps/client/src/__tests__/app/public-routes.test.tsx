import { render, screen } from "@testing-library/react-native";

// Dynamic routes read params via expo-router's useLocalSearchParams; stub it so
// the route bodies execute under jest without a navigation container.
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ eventId: "evt-1" }),
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

  it("renders Home with the app name header", () => {
    render(<HomeScreen />);
    expect(screen.getByRole("header")).toHaveTextContent("Rusuh Booking");
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
