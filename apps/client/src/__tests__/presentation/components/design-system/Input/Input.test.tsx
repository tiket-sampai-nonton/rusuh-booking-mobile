import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

let mockReducedMotion = false;
jest.mock("react-native-reanimated", () => ({
  ...jest.requireActual("react-native-reanimated/mock"),
  useReducedMotion: () => mockReducedMotion,
}));

// eslint-disable-next-line import/first
import { Input } from "../../../../../presentation/components/Input/index";

describe("Input", () => {
  afterEach(() => {
    mockReducedMotion = false;
  });

  it("renders its label and hint and forwards focus, blur, and text changes", () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const onChangeText = jest.fn();
    const { getByTestId, getByText } = render(
      <Input
        label="Email"
        hint="Gunakan email aktif."
        testID="email-input"
        onFocus={onFocus}
        onBlur={onBlur}
        onChangeText={onChangeText}
      />,
    );

    const input = getByTestId("email-input");
    expect(getByText("Email")).toBeTruthy();
    expect(getByText("Gunakan email aktif.")).toBeTruthy();
    fireEvent.changeText(input, "rizky@example.com");
    fireEvent(input, "focus");
    fireEvent(input, "blur");

    expect(onChangeText).toHaveBeenCalledWith("rizky@example.com");
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("shows only the validation error in the error state", () => {
    const { getByText, queryByText } = render(
      <Input
        state="error"
        label="NIK"
        error="NIK harus terdiri dari 16 digit."
        hint="Gunakan nomor pada KTP."
      />,
    );

    expect(getByText("NIK harus terdiri dari 16 digit.")).toBeTruthy();
    expect(queryByText("Gunakan nomor pada KTP.")).toBeNull();
  });

  it("renders a valid input without hint or error copy", () => {
    const { queryByText } = render(<Input state="valid" label="Nama" />);

    expect(queryByText("Nama")).toBeTruthy();
    expect(queryByText("undefined")).toBeNull();
  });

  it("applies focus and blur immediately when reduced motion is enabled", () => {
    mockReducedMotion = true;
    const { getByTestId } = render(<Input testID="reduced-input" />);
    fireEvent(getByTestId("reduced-input"), "focus");
    fireEvent(getByTestId("reduced-input"), "blur");
    expect(getByTestId("reduced-input")).toBeTruthy();
  });
});
