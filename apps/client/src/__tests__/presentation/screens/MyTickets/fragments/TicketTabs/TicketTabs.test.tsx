import { fireEvent, render, screen } from "@testing-library/react-native";
import { TicketTabs } from "../../../../../../presentation/screens/MyTickets/fragments/TicketTabs/index";

describe("TicketTabs", () => {
  it("shows both counts and reports the selected tab", () => {
    const onChange = jest.fn();
    render(
      <TicketTabs
        activeTab="upcoming"
        upcomingCount={3}
        pastCount={2}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Mendatang (3)")).toBeTruthy();
    expect(screen.getByText("Sebelumnya (2)")).toBeTruthy();
    expect(
      screen.getByTestId("tickets-tab-upcoming").props.accessibilityState
        .selected,
    ).toBe(true);
    expect(
      screen.getByTestId("tickets-tab-past").props.accessibilityState.selected,
    ).toBe(false);

    fireEvent.press(screen.getByTestId("tickets-tab-past"));
    expect(onChange).toHaveBeenCalledWith("past");
  });
});
