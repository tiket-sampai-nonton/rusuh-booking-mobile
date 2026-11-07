import { fireEvent, render, screen } from "@testing-library/react-native";

import { BrowseNativeCategoryBar } from "../../../../../../presentation/screens/Browse/fragments/BrowseNativeCategoryBar/index";

describe("BrowseNativeCategoryBar", () => {
  it("renders all category choices and forwards the selected key", () => {
    const onSelect = jest.fn();
    render(
      <BrowseNativeCategoryBar
        top={44}
        activeCategory="all"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText("Semua")).toBeTruthy();
    expect(screen.getByText("Konser")).toBeTruthy();
    expect(screen.getByText("Festival")).toBeTruthy();
    expect(screen.getByText("Olahraga")).toBeTruthy();
    expect(screen.getByText("Teater")).toBeTruthy();
    fireEvent.press(screen.getByTestId("category-festival"));
    expect(onSelect).toHaveBeenCalledWith("festival");
  });

  it("supports a non-default active category", () => {
    render(
      <BrowseNativeCategoryBar
        top={0}
        activeCategory="sports"
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByTestId("category-sports")).toBeTruthy();
  });
});
