import { fireEvent, render } from "@testing-library/react-native";

import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";

const mockResponsive = { isNative: true };
let mockReducedMotion = false;
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsive,
}));
jest.mock("react-native-reanimated", () => ({
  ...jest.requireActual("react-native-reanimated/mock"),
  useReducedMotion: () => mockReducedMotion,
}));

// eslint-disable-next-line import/first
import { EventCard } from "../../../../../presentation/components/design-system/EventCard/index";

describe("EventCard", () => {
  afterEach(() => {
    mockResponsive.isNative = true;
    mockReducedMotion = false;
  });

  it("navigates from an available native card and renders the color layer", () => {
    mockReducedMotion = false;
    const onPress = jest.fn();
    const { getByTestId, getByText } = render(
      <EventCard event={EVENT_FIXTURES[0]} onPress={onPress} isImageVisible />,
    );

    fireEvent.press(getByTestId("v2-event-card-evt-1"));
    fireEvent(getByTestId("v2-event-card-evt-1"), "pressIn");
    fireEvent(getByTestId("v2-event-card-evt-1"), "pressOut");
    expect(onPress).toHaveBeenCalledWith("evt-1");
    expect(getByText("Mulai dari")).toBeTruthy();
    expect(getByText("Stok Menipis")).toBeTruthy();
  });

  it("keeps history cards disabled and does not activate hover state", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <EventCard event={EVENT_FIXTURES[0]} onPress={onPress} history />,
    );
    const card = getByTestId("v2-event-card-evt-1");
    expect(card.props.accessibilityState.disabled).toBe(true);
    fireEvent(card, "hoverIn");
    fireEvent.press(card);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders desktop card actions and responds to hover without motion", () => {
    mockResponsive.isNative = false;
    mockReducedMotion = true;
    const onPress = jest.fn();
    const { getByTestId, getByText } = render(
      <EventCard event={EVENT_FIXTURES[0]} onPress={onPress} listMode />,
    );
    const card = getByTestId("v2-event-card-evt-1");
    fireEvent(card, "hoverIn");
    expect(getByText("Beli")).toBeTruthy();
    fireEvent.press(card);
    fireEvent(card, "hoverOut");
    expect(onPress).toHaveBeenCalledWith("evt-1");
  });

  it("shows sold-out state and keeps the details card navigable", () => {
    const onPress = jest.fn();
    const { getByTestId, getByText } = render(
      <EventCard event={EVENT_FIXTURES[3]} onPress={onPress} />,
    );
    expect(getByText("Habis Terjual")).toBeTruthy();
    fireEvent.press(getByTestId("v2-event-card-evt-4"));
    expect(onPress).toHaveBeenCalledWith("evt-4");
  });
});
