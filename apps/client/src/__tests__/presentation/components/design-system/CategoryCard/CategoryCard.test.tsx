import { fireEvent, render, screen } from "@testing-library/react-native";

let mockReducedMotion = true;
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockReducedMotion };
});

// eslint-disable-next-line import/first
import { CategoryCard } from "../../../../../presentation/components/design-system/CategoryCard/index";

describe("CategoryCard", () => {
  afterEach(() => {
    mockReducedMotion = true;
  });

  it("renders its label and count, and invokes the category action", () => {
    const onPress = jest.fn();
    render(
      <CategoryCard
        name="Konser"
        count="24 event"
        imageUri="https://example.com/concert.jpg"
        onPress={onPress}
        testID="category-card"
      />,
    );

    const card = screen.getByRole("button", {
      name: "Kategori Konser, 24 event",
    });
    fireEvent(card, "hoverIn");
    fireEvent(card, "hoverOut");
    fireEvent(card, "pressIn");
    fireEvent.press(card);
    fireEvent(card, "pressOut");

    expect(screen.getByText("Konser")).toBeTruthy();
    expect(screen.getByText("24 event")).toBeTruthy();
    expect(screen.getByTestId("category-card")).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("uses animated hover transitions when reduced motion is disabled", () => {
    mockReducedMotion = false;
    const onPress = jest.fn();
    render(
      <CategoryCard
        name="Festival"
        count="8 event"
        imageUri="https://example.com/festival.jpg"
        onPress={onPress}
      />,
    );
    const card = screen.getByRole("button", {
      name: "Kategori Festival, 8 event",
    });
    fireEvent(card, "hoverIn");
    fireEvent(card, "hoverOut");
    expect(card).toBeTruthy();
  });
});
