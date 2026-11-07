import { fireEvent, render, screen } from "@testing-library/react-native";

import { BrowseLoadMore } from "@presentation/screens/Browse/fragments/BrowseLoadMore";
import {
  browseLoadMoreButtonStyle,
  browseLoadMoreDisabled,
  browseLoadMorePressed,
} from "@presentation/screens/Browse/style";

describe("BrowseLoadMore", () => {
  it("invokes the action and applies pressed feedback when more results are available", () => {
    const onPress = jest.fn();
    const { getByTestId, getByText } = render(
      <BrowseLoadMore disabled={false} onPress={onPress} />,
    );
    const button = getByTestId("load-more-btn");

    expect(getByText("Muat Lebih Banyak Event")).toBeTruthy();
    expect(browseLoadMoreButtonStyle(true, false)).toContain(
      browseLoadMorePressed,
    );
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows the terminal label and disables interaction after all results load", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <BrowseLoadMore disabled onPress={onPress} />,
    );
    const button = getByTestId("load-more-btn");

    expect(screen.getByText("Semua Event Ditampilkan")).toBeTruthy();
    expect(browseLoadMoreButtonStyle(true, true)).toContain(
      browseLoadMoreDisabled,
    );
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
