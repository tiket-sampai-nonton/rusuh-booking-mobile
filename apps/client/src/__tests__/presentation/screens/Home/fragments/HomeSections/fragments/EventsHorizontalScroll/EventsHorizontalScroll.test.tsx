import { act, render, screen } from "@testing-library/react-native";
import { FlatList } from "react-native";

import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";
import { EventCard } from "@presentation/components/design-system/EventCard";
import { EventsHorizontalScroll } from "../../../../../../../../presentation/screens/Home/fragments/HomeSections/fragments/EventsHorizontalScroll/index";

describe("EventsHorizontalScroll", () => {
  it("shows the empty catalog message", () => {
    render(<EventsHorizontalScroll events={[]} onPress={jest.fn()} />);
    expect(screen.getByText("Belum ada event yang cocok.")).toBeTruthy();
  });

  it("reveals cards reported as visible by the horizontal list", () => {
    const event = EVENT_FIXTURES[0];
    const tree = render(<EventsHorizontalScroll events={[event]} onPress={jest.fn()} />);
    const list = tree.UNSAFE_getByType(FlatList);
    act(() => list.props.onViewableItemsChanged({ viewableItems: [{ item: event }], changed: [] }));
    expect(tree.UNSAFE_getByType(EventCard).props.isImageVisible).toBe(true);
  });

  it("keeps Android Fabric from reattaching clipped animated event cards", () => {
    const tree = render(<EventsHorizontalScroll events={EVENT_FIXTURES} onPress={jest.fn()} />);
    expect(tree.UNSAFE_getByType(FlatList).props.removeClippedSubviews).toBe(false);
  });
});
