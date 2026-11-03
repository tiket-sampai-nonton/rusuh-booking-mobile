/**
 * RBT-090 — EventDetail V2 fragments: Block (with/without heading) + Categories
 * (empty read-only note / sold-out / low-stock / available arms).
 */
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { Block } from "@presentation/screens/EventDetail/fragments/Block";
import { Categories } from "@presentation/screens/EventDetail/fragments/Categories";

describe("Block (V2 brutalist section)", () => {
  it("renders the label + heading + children", () => {
    render(
      <Block label="Line-up" heading="Yang akan tampil.">
        <Text>child</Text>
      </Block>,
    );
    expect(screen.getByText("Line-up")).toBeTruthy();
    expect(screen.getByText("Yang akan tampil.")).toBeTruthy();
    expect(screen.getByText("child")).toBeTruthy();
  });

  it("renders without a heading (no-heading branch)", () => {
    render(
      <Block label="Tanpa judul">
        <Text>body-only</Text>
      </Block>,
    );
    expect(screen.getByText("Tanpa judul")).toBeTruthy();
    expect(screen.getByText("body-only")).toBeTruthy();
    expect(screen.queryByText("Yang akan tampil.")).toBeNull();
  });
});

describe("Categories (read-only preview)", () => {
  it("shows the server read-only note when empty", () => {
    render(<Categories categories={[]} />);
    expect(
      screen.getByText(
        "Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.",
      ),
    ).toBeTruthy();
  });

  it("renders available / low-stock / sold-out arms + the final note", () => {
    render(
      <Categories
        categories={[
          { code: "VIP", name: "VIP", priceMinor: 75000000, available: 200 }, // Tersedia
          { code: "REG", name: "Reguler", priceMinor: 45000000, available: 12 }, // Sisa 12
          { code: "", name: "Festival", priceMinor: 30000000, available: 0 }, // Habis (no code)
        ]}
      />,
    );
    expect(screen.getByText("Tersedia")).toBeTruthy();
    expect(screen.getByText("Sisa 12")).toBeTruthy();
    expect(screen.getByText("Habis")).toBeTruthy();
    expect(screen.getByText("Kode VIP")).toBeTruthy();
    // The populated-state note is present too.
    expect(
      screen.getByText(
        "Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.",
      ),
    ).toBeTruthy();
  });
});
