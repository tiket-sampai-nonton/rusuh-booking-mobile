import { fireEvent, render, screen } from "@testing-library/react-native";

import { BrowseNativeCategoryBar } from "../../../../../../presentation/screens/Browse/fragments/BrowseNativeCategoryBar/index";

describe("BrowseNativeCategoryBar", () => {
  it("shows only the default category before the user filters", () => {
    render(
      <BrowseNativeCategoryBar top={44} genre="Semua" onSelect={jest.fn()} />,
    );

    expect(screen.getByText("Semua")).toBeTruthy();
    expect(screen.queryByText("Konser")).toBeNull();
    expect(screen.queryByText("Festival")).toBeNull();
    expect(screen.queryByText("Olahraga")).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("supports a non-default active category", () => {
    const onSelect = jest.fn();
    render(
      <BrowseNativeCategoryBar top={0} genre="OLAHRAGA" onSelect={onSelect} />,
    );
    expect(screen.getByTestId("category-OLAHRAGA")).toBeTruthy();
    fireEvent.press(screen.getByTestId("category-OLAHRAGA"));
    expect(onSelect).toHaveBeenCalled();
  });
});
