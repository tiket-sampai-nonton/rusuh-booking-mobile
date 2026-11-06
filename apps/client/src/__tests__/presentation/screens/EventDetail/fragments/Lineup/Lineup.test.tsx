import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image, Platform } from "react-native";

import { Lineup } from "../../../../../../presentation/screens/EventDetail/fragments/Lineup/index";

describe("Lineup", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  it("shows the fallback when the lineup is empty", () => {
    render(<Lineup items={[]} />);
    expect(
      screen.getByText("Daftar pengisi acara akan diumumkan menyusul."),
    ).toBeTruthy();
  });

  it("renders native cards with explicit and generated avatars and pressed states", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    const { UNSAFE_getAllByType } = render(
      <Lineup
        items={[
          {
            name: "Nadia",
            role: "Vokal",
            avatar: "https://example.com/nadia.jpg",
          },
          { name: "Raka Putra", role: "Gitar" },
        ]}
      />,
    );

    expect(screen.getByText("Nadia")).toBeTruthy();
    expect(screen.getByText("Raka Putra")).toBeTruthy();
    expect(screen.getByText("Gitar")).toBeTruthy();
    expect(UNSAFE_getAllByType(Image)[1].props.source.uri).toContain(
      "format=png",
    );
    fireEvent(screen.getByText("Nadia"), "pressIn");
    fireEvent(screen.getByText("Nadia"), "pressOut");
  });

  it("renders the web grid, generated avatar URL, and hover state", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    render(<Lineup items={[{ name: "Raisa & Friends", role: "Vokal" }]} />);

    const name = screen.getByText("Raisa & Friends");
    fireEvent(name, "hoverIn");
    fireEvent(name, "hoverOut");
    expect(name).toBeTruthy();
    expect(screen.getByText("Vokal")).toBeTruthy();
  });
});
