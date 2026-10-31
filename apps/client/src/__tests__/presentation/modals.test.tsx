/**
 * LoginModal + FilterModal — behavioral coverage (prototype index.html dialogs).
 *
 * LoginModal walks email → OTP (123456) → register (new email) → done, and the
 * existing-email branch → signed → logout. FilterModal picks options and Apply
 * calls back with the chosen value; Cancel/backdrop close with no callback.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";

import { FilterModal } from "@presentation/components/FilterModal";
import { LoginModal } from "@presentation/components/LoginModal";
import { useAccountStore } from "@presentation/stores/account-store";

describe("LoginModal", () => {
  beforeEach(() => useAccountStore.getState().signOut());

  it("walks email → OTP → register → done for a NEW email", () => {
    render(<LoginModal visible onClose={jest.fn()} />);
    expect(screen.getByTestId("login-step-email")).toBeTruthy();

    fireEvent.changeText(screen.getByTestId("login-email"), "new@user.id");
    fireEvent.press(screen.getByTestId("login-send"));
    expect(screen.getByTestId("login-step-code")).toBeTruthy();

    fireEvent.changeText(screen.getByTestId("login-code"), "123456");
    fireEvent.press(screen.getByTestId("login-verify"));
    // New email → register step.
    expect(screen.getByTestId("login-step-register")).toBeTruthy();

    fireEvent.changeText(screen.getByTestId("login-name"), "Budi Santoso");
    fireEvent.changeText(screen.getByTestId("login-nik"), "3200000000000001");
    fireEvent.press(screen.getByTestId("login-register"));
    expect(screen.getByTestId("login-step-done")).toBeTruthy();
    // Identity stored for checkout auto-fill.
    expect(useAccountStore.getState().account?.name).toBe("Budi Santoso");
  });

  it("rejects a bad email and a wrong OTP", () => {
    render(<LoginModal visible onClose={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId("login-email"), "not-an-email");
    fireEvent.press(screen.getByTestId("login-send"));
    expect(screen.getByTestId("login-error")).toBeTruthy();
    expect(screen.queryByTestId("login-step-code")).toBeNull();

    fireEvent.changeText(screen.getByTestId("login-email"), "ok@user.id");
    fireEvent.press(screen.getByTestId("login-send"));
    fireEvent.changeText(screen.getByTestId("login-code"), "000000");
    fireEvent.press(screen.getByTestId("login-verify"));
    expect(screen.getByTestId("login-error")).toBeTruthy();
    expect(screen.queryByTestId("login-step-register")).toBeNull();
  });

  it("signs in the known demo email directly, then logs out", () => {
    render(<LoginModal visible onClose={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId("login-email"), "ada@rusuh.id");
    fireEvent.press(screen.getByTestId("login-send"));
    fireEvent.changeText(screen.getByTestId("login-code"), "123456");
    fireEvent.press(screen.getByTestId("login-verify"));
    // Existing account → straight to signed.
    expect(screen.getByTestId("login-step-signed")).toBeTruthy();
    expect(useAccountStore.getState().account?.email).toBe("ada@rusuh.id");
    fireEvent.press(screen.getByTestId("login-logout"));
    expect(useAccountStore.getState().account).toBeUndefined();
  });

  it("rejects register with a short name or invalid NIK", () => {
    render(<LoginModal visible onClose={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId("login-email"), "new2@user.id");
    fireEvent.press(screen.getByTestId("login-send"));
    fireEvent.changeText(screen.getByTestId("login-code"), "123456");
    fireEvent.press(screen.getByTestId("login-verify"));
    // Short name.
    fireEvent.changeText(screen.getByTestId("login-name"), "A");
    fireEvent.changeText(screen.getByTestId("login-nik"), "3200000000000001");
    fireEvent.press(screen.getByTestId("login-register"));
    expect(screen.getByTestId("login-error")).toBeTruthy();
    // Valid name, bad NIK.
    fireEvent.changeText(screen.getByTestId("login-name"), "Budi");
    fireEvent.changeText(screen.getByTestId("login-nik"), "123");
    fireEvent.press(screen.getByTestId("login-register"));
    expect(screen.getByTestId("login-error")).toBeTruthy();
    expect(screen.queryByTestId("login-step-done")).toBeNull();
  });

  it("opens straight to the signed step when already signed in", () => {
    useAccountStore.getState().signIn({ email: "x@y.id", name: "X Y", nik: "3200000000000002" });
    render(<LoginModal visible onClose={jest.fn()} />);
    expect(screen.getByTestId("login-step-signed")).toBeTruthy();
  });

  it("'Mulai Pesan Tiket' on the done step closes the modal", () => {
    const onClose = jest.fn();
    render(<LoginModal visible onClose={onClose} />);
    fireEvent.changeText(screen.getByTestId("login-email"), "fresh@user.id");
    fireEvent.press(screen.getByTestId("login-send"));
    fireEvent.changeText(screen.getByTestId("login-code"), "123456");
    fireEvent.press(screen.getByTestId("login-verify"));
    fireEvent.changeText(screen.getByTestId("login-name"), "Citra Dewi");
    fireEvent.changeText(screen.getByTestId("login-nik"), "3200000000000003");
    fireEvent.press(screen.getByTestId("login-register"));
    fireEvent.press(screen.getByTestId("login-done-close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("'Ganti email' from the code step returns to the email step", () => {
    render(<LoginModal visible onClose={jest.fn()} />);
    fireEvent.changeText(screen.getByTestId("login-email"), "back@user.id");
    fireEvent.press(screen.getByTestId("login-send"));
    expect(screen.getByTestId("login-step-code")).toBeTruthy();
    // The code step's cancel ("Ganti email") goes back to email.
    fireEvent.press(screen.getByLabelText("Ganti email"));
    expect(screen.getByTestId("login-step-email")).toBeTruthy();
  });

  it("closes on a backdrop tap and on the email-step cancel", () => {
    const onClose = jest.fn();
    render(<LoginModal visible onClose={onClose} />);
    fireEvent.press(screen.getByLabelText("Batal"));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId("login-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("'Tutup' on the signed step closes the modal", () => {
    useAccountStore.getState().signIn({ email: "z@y.id", name: "Z Y", nik: "3200000000000004" });
    const onClose = jest.fn();
    render(<LoginModal visible onClose={onClose} />);
    fireEvent.press(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("FilterModal", () => {
  it("Apply reports the chosen genre/time/sort; Cancel closes without applying", () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    render(<FilterModal visible onApply={onApply} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("filter-genre-Jazz"));
    fireEvent.press(screen.getByTestId("filter-time-week"));
    fireEvent.press(screen.getByTestId("filter-sort-furthest"));
    fireEvent.press(screen.getByTestId("filter-apply"));
    expect(onApply).toHaveBeenCalledWith({ genre: "Jazz", time: "week", sort: "furthest" });

    fireEvent.press(screen.getByTestId("filter-cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on a backdrop tap", () => {
    const onClose = jest.fn();
    render(<FilterModal visible onApply={jest.fn()} onClose={onClose} />);
    fireEvent.press(screen.getByTestId("filter-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });
});
