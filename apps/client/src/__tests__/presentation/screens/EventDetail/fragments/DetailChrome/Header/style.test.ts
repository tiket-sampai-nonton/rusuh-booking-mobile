import { designColors } from "@presentation/theme/event-design-tokens";
import {
  detailHeaderIconColor,
  detailHeaderPressedStyle,
} from "@presentation/screens/EventDetail/fragments/DetailChrome/Header/style";

describe("event detail header press styles", () => {
  it("provides both resting and pressed states", () => {
    expect(detailHeaderPressedStyle(false)).toBeUndefined();
    expect(detailHeaderPressedStyle(true)).toBeTruthy();
    expect(detailHeaderIconColor(false)).toBe(designColors.ink);
    expect(detailHeaderIconColor(true)).toBe(designColors.ground);
  });
});
