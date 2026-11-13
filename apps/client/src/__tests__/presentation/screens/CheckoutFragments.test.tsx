import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { BOOKING_CATEGORY_FIXTURE } from "@shared/test-fixtures/booking-categories.fixture";

import { CheckoutBar } from "@presentation/screens/Checkout/fragments/CheckoutBar";
import { ConsentGate } from "@presentation/screens/Checkout/fragments/ConsentGate";
import { CheckoutHero } from "@presentation/screens/Checkout/fragments/CheckoutHero";
import { LeaveConfirm } from "@presentation/screens/Checkout/fragments/LeaveConfirm";
import { TicketItem } from "@presentation/screens/Checkout/fragments/TicketItem";
import {
  buyerDataSwitchTrackColor,
  componentStyles as ticketItemStyles,
} from "@presentation/screens/Checkout/fragments/TicketItem/style";
import { designColors } from "@presentation/theme";
import {
  Field,
  Section,
} from "@presentation/screens/Checkout/fragments/common";

describe("checkout shared form fragments", () => {
  it("renders section headings with and without a numeric badge", () => {
    render(
      <>
        <Section number={2} title="Tiket">
          <Text>Tiket pertama</Text>
        </Section>
        <Section title="Persetujuan">
          <Text>Kebijakan privasi</Text>
        </Section>
      </>,
    );
    expect(screen.getByText("Tiket pertama")).toBeTruthy();
    expect(screen.getByText("Kebijakan privasi")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("updates a field, handles focus and blur, and shows its invalid state", () => {
    const onChangeText = jest.fn();
    render(
      <Field
        label="NIK"
        value=""
        onChangeText={onChangeText}
        placeholder="16 digit"
        invalid
      />,
    );
    const input = screen.getByLabelText("NIK");
    expect(screen.getByText("NIK harus 16 digit.")).toBeTruthy();
    fireEvent(input, "focus");
    fireEvent.changeText(input, "123");
    fireEvent(input, "blur");
    expect(onChangeText).toHaveBeenCalledWith("123");
  });
});

describe("CheckoutHero event name loading", () => {
  it("shows a recoverable error instead of a permanent loading label", () => {
    const onRetry = jest.fn();
    render(
      <CheckoutHero
        eventId="event-1"
        eventNameError
        onRetryEventName={onRetry}
      />,
    );

    expect(screen.getByText("Nama event tidak tersedia")).toBeTruthy();
    fireEvent.press(screen.getByTestId("checkout-event-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("CheckoutBar (RBT-051)", () => {
  it("renders total + enabled submit when ready and not expired", () => {
    const onSubmit = jest.fn();
    render(
      <CheckoutBar
        totalMinor={95000000}
        ready
        pending={false}
        expired={false}
        onSubmit={onSubmit}
        bottomInset={0}
      />,
    );
    expect(screen.getByTestId("checkout-total")).toBeTruthy();
    const submit = screen.getByTestId("checkout-submit");
    expect(submit.props.accessibilityState.disabled).toBe(false);
    fireEvent.press(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("keeps submit actionable and shows the error message when provided", () => {
    const onSubmit = jest.fn();
    render(
      <CheckoutBar
        totalMinor={0}
        ready={false}
        pending={false}
        expired={false}
        errorMessage="NIK pembeli belum valid"
        onSubmit={onSubmit}
        bottomInset={8}
      />,
    );
    expect(screen.getByText("NIK pembeli belum valid")).toBeTruthy();
    expect(screen.getByText("Lanjut Bayar")).toBeTruthy();
    expect(
      screen.getByTestId("checkout-submit").props.accessibilityState.disabled,
    ).toBe(false);
    fireEvent.press(screen.getByTestId("checkout-submit"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows 'Memproses…' while pending and does not fire submit", () => {
    const onSubmit = jest.fn();
    render(
      <CheckoutBar
        totalMinor={0}
        ready
        pending
        expired={false}
        onSubmit={onSubmit}
        bottomInset={0}
      />,
    );
    expect(screen.getByText("Memproses…")).toBeTruthy();
    fireEvent.press(screen.getByTestId("checkout-submit"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows 'Waktu habis' when expired", () => {
    render(
      <CheckoutBar
        totalMinor={0}
        ready
        pending={false}
        expired
        onSubmit={jest.fn()}
        bottomInset={0}
      />,
    );
    expect(screen.getByText("Waktu habis")).toBeTruthy();
  });
});

describe("LeaveConfirm (RBT-051 harvested fragment)", () => {
  it("fires onStay from backdrop and the stay button", () => {
    const onStay = jest.fn();
    const onLeave = jest.fn();
    render(<LeaveConfirm visible onStay={onStay} onLeave={onLeave} />);
    fireEvent.press(screen.getByTestId("checkout-stay"));
    expect(onStay).toHaveBeenCalledTimes(1);
    expect(onLeave).not.toHaveBeenCalled();
  });

  it("fires onLeave from the confirm button", () => {
    const onStay = jest.fn();
    const onLeave = jest.fn();
    render(<LeaveConfirm visible onStay={onStay} onLeave={onLeave} />);
    fireEvent.press(screen.getByTestId("checkout-leave-confirm"));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("stops propagation when the modal card itself is pressed", () => {
    const onStay = jest.fn();
    const stopPropagation = jest.fn();
    render(<LeaveConfirm visible onStay={onStay} onLeave={jest.fn()} />);
    fireEvent.press(screen.getByTestId("checkout-leave-modal"), {
      stopPropagation,
    });
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onStay).not.toHaveBeenCalled();
  });
});

describe("ConsentGate (RBT-052 AC3)", () => {
  it("toggles the consent checkbox on press", () => {
    const onToggle = jest.fn();
    const { rerender } = render(
      <ConsentGate
        checked={false}
        onToggle={onToggle}
        onOpenPrivacy={jest.fn()}
      />,
    );
    const box = screen.getByTestId("checkout-consent");
    expect(box.props.accessibilityState.checked).toBe(false);
    fireEvent.press(box);
    expect(onToggle).toHaveBeenCalledWith(true);
    rerender(
      <ConsentGate checked onToggle={onToggle} onOpenPrivacy={jest.fn()} />,
    );
    expect(
      screen.getByTestId("checkout-consent").props.accessibilityState.checked,
    ).toBe(true);
    fireEvent.press(screen.getByTestId("checkout-consent"));
    expect(onToggle).toHaveBeenLastCalledWith(false); // ticked → untick
  });
});

const ticketRow = {
  rowId: "row-fixture-1",
  categoryId: BOOKING_CATEGORY_FIXTURE[0].categoryId,
  attendeeName: "",
  attendeeNik: "",
  useBuyerNik: false,
};

describe("TicketItem attendee-check status (RBT-052)", () => {
  const noop = jest.fn();
  const props = {
    index: 0,
    showBuyerDataControl: true,
    row: ticketRow,
    canRemove: false,
    onRemove: noop,
    onPatch: noop,
    onUseBuyer: noop,
    categories: BOOKING_CATEGORY_FIXTURE,
  };

  it("renders the blocked message for an ALREADY_REGISTERED row", () => {
    render(<TicketItem {...props} status="blocked" />);
    expect(screen.getByTestId("attendee-status-0").props.children).toMatch(
      /sudah terdaftar/i,
    );
  });

  it("renders the warning message for CHECK_LIMIT_REACHED", () => {
    render(<TicketItem {...props} status="warning" />);
    expect(screen.getByTestId("attendee-status-0").props.children).toMatch(
      /Batas pengecekan/i,
    );
  });

  it("renders the checking + available states", () => {
    const { rerender } = render(<TicketItem {...props} status="checking" />);
    expect(screen.getByTestId("attendee-status-0").props.children).toMatch(
      /Mengecek/i,
    );
    rerender(<TicketItem {...props} status="available" />);
    expect(screen.getByTestId("attendee-status-0").props.children).toMatch(
      /tersedia/i,
    );
  });

  it("shows no status row when idle", () => {
    render(<TicketItem {...props} status="idle" />);
    expect(screen.queryByTestId("attendee-status-0")).toBeNull();
  });

  it("defaults to idle (no status row) when the status prop is omitted", () => {
    render(<TicketItem {...props} />);
    expect(screen.queryByTestId("attendee-status-0")).toBeNull();
  });

  it("shows a high-contrast buyer-data switch for the first ticket", () => {
    const onUseBuyer = jest.fn();
    render(<TicketItem {...props} onUseBuyer={onUseBuyer} />);
    const control = screen.getByTestId("use-buyer-0");
    expect(ticketItemStyles.buyerDataControl).toMatchObject({
      borderColor: designColors.ink,
      backgroundColor: designColors.ground,
      borderWidth: 1,
    });
    expect(buyerDataSwitchTrackColor.false).toBe(designColors.gray);
    expect(buyerDataSwitchTrackColor.true).toBe(designColors.ink);
    fireEvent(control, "valueChange", true);
    expect(onUseBuyer).toHaveBeenCalledWith(true);
  });

  it("hides the buyer-data switch on later tickets", () => {
    render(<TicketItem {...props} index={1} showBuyerDataControl={false} />);
    expect(screen.queryByTestId("use-buyer-1")).toBeNull();
    expect(screen.queryByText(/Gunakan data pembeli/)).toBeNull();
  });
});
