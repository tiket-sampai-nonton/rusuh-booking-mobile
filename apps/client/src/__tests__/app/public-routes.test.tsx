import { screen } from "@testing-library/react-native";

import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

// Dynamic routes read params via expo-router; stub router + params so the route
// shells execute under jest without a navigation container.
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ eventId: "evt-1" }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

// eslint-disable-next-line import/first
import HomeRoute from "../../app/(public)/index";
// eslint-disable-next-line import/first
import BrowseScreen from "../../app/(public)/browse";
// eslint-disable-next-line import/first
import HistoryScreen from "../../app/(public)/history";
// eslint-disable-next-line import/first
import EventDetailRoute from "../../app/(public)/events/[eventId]";

describe("(public) route shells", () => {
  it("export component functions", () => {
    expect(typeof HomeRoute).toBe("function");
    expect(typeof BrowseScreen).toBe("function");
    expect(typeof HistoryScreen).toBe("function");
    expect(typeof EventDetailRoute).toBe("function");
  });

  it("Home route mounts the HomeScreen (header renders through providers)", async () => {
    renderWithProviders(<HomeRoute />);
    // The hero heading renders "Rusuh Tiket" (the brand mark says it too, so
    // match the header role to disambiguate). findBy retries past the async
    // query's state update.
    const headers = await screen.findAllByRole("header");
    expect(headers.some((h) => /Rusuh Tiket/.test(h.props.children))).toBe(true);
  });
});
