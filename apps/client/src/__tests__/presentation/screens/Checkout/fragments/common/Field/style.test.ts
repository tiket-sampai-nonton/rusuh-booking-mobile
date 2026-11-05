import { fieldFocusStyle, fieldInputStyle } from "@presentation/screens/Checkout/fragments/common/Field/style";

describe("checkout field style states", () => {
  it("covers invalid, read-only, focused, and unfocused fields", () => {
    expect(fieldInputStyle(false, true).backgroundColor).toBeTruthy();
    expect(fieldInputStyle(true, false).borderColor).toBeTruthy();
    expect(fieldInputStyle(false, false).backgroundColor).toBeTruthy();
    expect(fieldFocusStyle(false)).toEqual({});
    expect(fieldFocusStyle(true)).toBeTruthy();
  });
});
