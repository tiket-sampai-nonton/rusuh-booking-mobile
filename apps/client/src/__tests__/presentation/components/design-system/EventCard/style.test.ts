import {
  eventCardContainerStyle,
  eventCardContentStyle,
  eventCardFooterStyle,
  eventCardImageContainerStyle,
  eventCardImageStyle,
  styleForEventCardAnimatedText8,
  styleForEventCardAnimatedView5,
  styleForEventCardPressable2,
  styleForEventCardText6,
  styleForEventCardText7,
  styleForEventCardText11,
  styleForEventCardView12,
  styleForEventCardView13,
} from "@presentation/components/EventCard/style";
import type { EventBadge } from "@domain/rules/event-display";

describe("EventCard style variants", () => {
  const available: EventBadge = {
    tone: "ok",
    label: "Tersedia",
    disabled: false,
  };
  const soldOut: EventBadge = {
    tone: "soldout",
    label: "Habis",
    disabled: true,
  };

  it("covers card layout combinations", () => {
    expect(eventCardContainerStyle(false, false, false)).toMatchObject({
      zIndex: 0,
      opacity: 1,
      borderWidth: 0,
    });
    expect(eventCardContainerStyle(true, true, true)).toMatchObject({
      zIndex: 10,
      opacity: 0.62,
      borderWidth: 2,
    });
    expect(
      eventCardImageContainerStyle(true, true, false).aspectRatio,
    ).toBeCloseTo(16 / 9);
    expect(eventCardImageContainerStyle(true, false, false).aspectRatio).toBe(
      1,
    );
    expect(
      eventCardImageContainerStyle(false, false, false).aspectRatio,
    ).toBeCloseTo(4 / 3);
    expect(eventCardImageContainerStyle(false, true, true)).toMatchObject({
      width: 240,
      height: undefined,
      alignSelf: "stretch",
    });
    expect(eventCardContentStyle(16, true, false, false)).toMatchObject({
      justifyContent: "space-between",
      minHeight: 160,
    });
    expect(eventCardContentStyle(16, false, true, true)).toMatchObject({
      justifyContent: "center",
      flex: 1,
    });
    expect(
      eventCardContentStyle(16, false, false, false).justifyContent,
    ).toBeUndefined();
    expect(eventCardFooterStyle(true).borderStyle).toBe("dashed");
    expect(eventCardFooterStyle(false).borderStyle).toBe("solid");
    expect(eventCardImageStyle(false, true)).toEqual({
      width: "100%",
      height: "100%",
    });
    expect(
      (eventCardImageStyle(true, true) as unknown as { filter: string }).filter,
    ).toBe("grayscale(0%)");
    expect(
      (eventCardImageStyle(true, false) as unknown as { filter: string })
        .filter,
    ).toBe("grayscale(100%)");
  });

  it("covers badges, labels, disabled actions, and the pressable style", () => {
    expect(styleForEventCardPressable2()).toMatchObject({
      minHeight: 160,
      flexDirection: "row",
    });
    expect(
      styleForEventCardAnimatedView5(false, available).backgroundColor,
    ).toBeDefined();
    expect(styleForEventCardAnimatedView5(false, soldOut).backgroundColor).toBe(
      styleForEventCardAnimatedView5(false, available).backgroundColor,
    );
    expect(styleForEventCardText6(true).fontSize).toBe(10);
    expect(styleForEventCardText6(false).fontSize).toBe(12);
    expect(styleForEventCardText7(12, true).marginBottom).toBe(4);
    expect(styleForEventCardText7(14, false).marginBottom).toBe(8);
    expect(styleForEventCardAnimatedText8(16, true).height).toBeDefined();
    expect(styleForEventCardAnimatedText8(20, false).height).toBeUndefined();
    expect(styleForEventCardText11(true).fontSize).toBe(14);
    expect(styleForEventCardText11(false).fontSize).toBe(16);
    expect(styleForEventCardView12(true).backgroundColor).not.toBe(
      styleForEventCardView12(false).backgroundColor,
    );
    expect(styleForEventCardView13(true).backgroundColor).not.toBe(
      styleForEventCardView13(false).backgroundColor,
    );
  });
});
