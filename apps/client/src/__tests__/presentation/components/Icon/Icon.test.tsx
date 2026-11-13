import { render } from "@testing-library/react-native";
import Svg, { Path } from "react-native-svg";

import {
  Icon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  ExternalLinkIcon,
  MailIcon,
  LockIcon,
  LoginIcon,
  PinIcon,
  PlusIcon,
  WarningIcon,
} from "../../../../presentation/components/Icon";
import { IconFrame } from "../../../../presentation/components/Icon/IconFrame";

describe("shared SVG icons", () => {
  it("renders each icon with its default appearance", () => {
    const result = render(
      <>
        <PinIcon />
        <CalendarIcon />
        <ClockIcon />
        <MailIcon />
        <LockIcon />
        <LoginIcon />
        <ExternalLinkIcon />
        <PlusIcon />
        <Icon />
        <CheckIcon />
        <WarningIcon />
        <CloseIcon />
      </>,
    );

    expect(result.toJSON()).toBeTruthy();
  });

  it("applies the IconFrame defaults when only children are provided", () => {
    const { UNSAFE_getByType } = render(
      <IconFrame>
        <Path d="M2 2h20v20H2z" />
      </IconFrame>,
    );

    expect(UNSAFE_getByType(Svg).props).toMatchObject({
      width: 16,
      height: 16,
      strokeWidth: 2,
    });
  });

  it.each(["left", "right", "download"] as const)(
    "renders the %s arrow path",
    (direction) => {
      expect(
        render(
          <Icon direction={direction} color="#123456" size={24} />,
        ).toJSON(),
      ).toBeTruthy();
    },
  );
});
