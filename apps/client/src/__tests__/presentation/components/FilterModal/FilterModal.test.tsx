import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { BackHandler, Platform } from "react-native";

import { FilterModal } from "../../../../presentation/components/FilterModal/index";

describe("FilterModal", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() =>
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" }),
  );
  afterEach(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
    jest.restoreAllMocks();
  });

  it("applies the selected genre, date window, and sort order", () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    render(<FilterModal visible onApply={onApply} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("filter-genre-Jazz"));
    fireEvent.press(screen.getByTestId("filter-time-week"));
    fireEvent.press(screen.getByTestId("filter-sort-furthest"));
    fireEvent.press(screen.getByTestId("filter-apply"));
    expect(onApply).toHaveBeenCalledWith({
      genre: "Jazz",
      time: "week",
      sort: "furthest",
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes from the backdrop and stops taps inside the sheet from bubbling", () => {
    const onClose = jest.fn();
    render(<FilterModal visible onApply={jest.fn()} onClose={onClose} />);
    fireEvent.press(screen.getByTestId("filter-modal"), {
      stopPropagation: jest.fn(),
    });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.press(
      screen.getByTestId("filter-backdrop", { includeHiddenElements: true }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("handles Android hardware back and removes its listener on close", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    const remove = jest.fn();
    const addListener = jest
      .spyOn(BackHandler, "addEventListener")
      .mockReturnValue({ remove } as never);
    const onClose = jest.fn();
    const { rerender } = render(
      <FilterModal visible onApply={jest.fn()} onClose={onClose} />,
    );
    const handler = addListener.mock.calls[0][1];
    expect(handler()).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(
      <FilterModal visible={false} onApply={jest.fn()} onClose={onClose} />,
    );
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("uses the transparent web modal and forwards the close request", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const onClose = jest.fn();
    render(<FilterModal visible onApply={jest.fn()} onClose={onClose} />);
    act(() => fireEvent.press(screen.getByTestId("filter-close")));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
