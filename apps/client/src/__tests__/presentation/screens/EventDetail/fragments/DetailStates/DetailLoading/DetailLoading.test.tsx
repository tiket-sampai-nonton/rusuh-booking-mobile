import { act, render, screen } from "@testing-library/react-native";

import { DetailLoading } from "../../../../../../../presentation/screens/EventDetail/fragments/DetailStates/DetailLoading/index";

describe("DetailLoading", () => {
  it("renders the event detail loading state", () => {
    jest.useFakeTimers();
    const view = render(<DetailLoading />);
    act(() => {
      jest.runAllTimers();
    });
    expect(screen.getByTestId("detail-loading")).toBeTruthy();
    view.unmount();
    jest.useRealTimers();
  });
});
