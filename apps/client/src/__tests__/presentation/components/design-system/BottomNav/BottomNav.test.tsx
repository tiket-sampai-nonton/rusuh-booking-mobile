import { fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";
import { Path } from "react-native-svg";

import { TicketsIcon } from "../../../../../presentation/components/BottomNav/NavItem/icons/TicketsIcon";

let mockMotionReduced = false;
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockMotionReduced };
});

// eslint-disable-next-line import/first
import {
  BottomNav,
  type BottomNavRoute,
} from "../../../../../presentation/components/BottomNav/index";

describe("BottomNav", () => {
  afterEach(() => {
    mockMotionReduced = false;
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
  });

  it("hides tickets for guests and navigates from a selected tab", () => {
    const onNavigate = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <BottomNav
        activeRoute="home"
        onNavigate={onNavigate}
        testIDPrefix="nav"
      />,
    );

    expect(queryByTestId("nav-tickets")).toBeNull();
    fireEvent(getByTestId("nav-browse"), "pressIn");
    fireEvent.press(getByTestId("nav-browse"));
    fireEvent(getByTestId("nav-browse"), "pressOut");
    expect(onNavigate).toHaveBeenCalledWith("browse");
  });

  it("renders a valid dashed ticket perforation path", () => {
    const { UNSAFE_getAllByType } = render(
      <>
        <TicketsIcon active />
        <TicketsIcon active={false} />
      </>,
    );
    const paths = UNSAFE_getAllByType(Path);

    expect(paths).toHaveLength(4);
    expect(paths[1]?.props.d).toBe("M9 2v20");
    expect(paths[1]?.props.strokeDasharray).toEqual([2, 2]);
    expect(paths[0]?.props.stroke).not.toBe(paths[2]?.props.stroke);
  });

  it.each<[BottomNavRoute, string]>([
    ["home", "Beranda"],
    ["browse", "Jelajah"],
    ["tickets", "Ticket"],
    ["profile", "Profil"],
  ])(
    "renders the %s icon and active tab for an authenticated user",
    (activeRoute, label) => {
      const { getByRole, getByText, getByTestId } = render(
        <BottomNav
          activeRoute={activeRoute}
          onNavigate={jest.fn()}
          isLoggedIn
          testIDPrefix="nav"
        />,
      );

      expect(getByTestId(`nav-${activeRoute}`)).toBeTruthy();
      expect(getByText(label)).toBeTruthy();
      expect(getByRole("tab", { name: label, selected: true })).toBeTruthy();
    },
  );

  it("applies reduced-motion behavior to the active indicator", () => {
    mockMotionReduced = true;
    const { getByTestId } = render(
      <BottomNav
        activeRoute="profile"
        onNavigate={jest.fn()}
        testIDPrefix="nav"
      />,
    );
    fireEvent(getByTestId("nav-profile"), "pressIn");
    fireEvent(getByTestId("nav-profile"), "pressOut");
    expect(getByTestId("nav-profile")).toBeTruthy();
  });

  it("does not render the native bar on web", () => {
    Object.defineProperty(Platform, "OS", { value: "web", configurable: true });
    const { toJSON } = render(
      <BottomNav
        activeRoute="home"
        onNavigate={jest.fn()}
        testIDPrefix="nav"
      />,
    );
    expect(toJSON()).toBeNull();
  });
});
