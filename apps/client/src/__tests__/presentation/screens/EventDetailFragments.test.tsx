/**
 * RBT-090 — EventDetail  fragments: Block (with/without heading) + Categories
 * (empty read-only note / sold-out / low-stock / available arms).
 *
 * : Block no longer renders the 'heading' prop - only 'label' as section title.
 */
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { Block } from "@presentation/screens/EventDetail/fragments/Block";
import { Categories } from "@presentation/screens/EventDetail/fragments/Categories";

describe("Block ( brutalist section)", () => {
  it("renders the label + children (: heading is not rendered)", () => {
    render(
      <Block label="Line-up" heading="Yang akan tampil.">
        <Text>child</Text>
      </Block>,
    );
    // : only label is rendered as title, heading is not shown
    expect(screen.getByText("Line-up")).toBeTruthy();
    expect(screen.getByText("child")).toBeTruthy();
    // : heading prop is ignored
    expect(screen.queryByText("Yang akan tampil.")).toBeNull();
  });

  it("renders without a heading (no-heading branch)", () => {
    render(
      <Block label="Tanpa judul">
        <Text>body-only</Text>
      </Block>,
    );
    expect(screen.getByText("Tanpa judul")).toBeTruthy();
    expect(screen.getByText("body-only")).toBeTruthy();
  });
});

describe("Categories (prototype preview)", () => {
	it("renders no category table when the server has no categories", () => {
    render(<Categories categories={[]} />);
		expect(screen.queryByText("Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.")).toBeNull();
  });

	it("renders available / low-stock / sold-out arms without prototype-external copy", () => {
    render(
      <Categories
        categories={[
          { code: "VIP", name: "VIP", priceMinor: 75000000, available: 200 }, // Tersedia
          { code: "CAT-50", name: "Ambang Tersedia", priceMinor: 30000000, available: 50 },
          { code: "CAT-49", name: "Ambang Menipis", priceMinor: 30000000, available: 49 },
          { code: "REG", name: "Reguler", priceMinor: 45000000, available: 12 }, // Sisa 12
          { code: "", name: "Festival", priceMinor: 30000000, available: 0 }, // Habis (no code)
        ]}
      />,
    );
    expect(screen.getAllByText("Tersedia")).toHaveLength(2);
    expect(screen.getByText("Sisa 12")).toBeTruthy();
    expect(screen.getByText("Sisa 49")).toBeTruthy();
    expect(screen.getByText("Habis")).toBeTruthy();
    expect(screen.getByText("Kode VIP")).toBeTruthy();
		expect(screen.queryByText("Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.")).toBeNull();
  });
});
