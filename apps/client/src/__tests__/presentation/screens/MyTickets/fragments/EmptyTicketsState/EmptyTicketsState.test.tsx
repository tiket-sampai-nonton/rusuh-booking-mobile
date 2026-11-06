import { fireEvent, render, screen } from "@testing-library/react-native";
import { EmptyTicketsState } from "../../../../../../presentation/screens/MyTickets/fragments/EmptyTicketsState/index";

describe("EmptyTicketsState", () => {
  it.each([
    ["upcoming", "Belum Ada Tiket Mendatang"],
    ["past", "Belum Ada Tiket Sebelumnya"],
  ] as const)(
    "shows the empty copy for the %s tab",
    (activeTab, expectedTitle) => {
      const onBrowse = jest.fn();
      render(<EmptyTicketsState activeTab={activeTab} onBrowse={onBrowse} />);

      expect(screen.getByText(expectedTitle)).toBeTruthy();
      fireEvent.press(screen.getByText("Jelajahi Event"));
      expect(onBrowse).toHaveBeenCalledTimes(1);
    },
  );
});
