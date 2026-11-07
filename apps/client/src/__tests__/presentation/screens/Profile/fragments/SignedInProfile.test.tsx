import { fireEvent, render, screen } from "@testing-library/react-native";

import type { UserProfile } from "@domain/repositories/user.repository";
import { SignedInProfile } from "@presentation/screens/Profile/fragments/SignedInProfile";

describe("SignedInProfile optional profile details", () => {
  it("uses the account fallback and omits masked NIK when the profile has no name or NIK", () => {
    const profile: UserProfile = {
      emailMasked: "a***@example.test",
      hasNik: false,
    };
    const onEdit = jest.fn();
    const onSignOut = jest.fn();
    render(
      <SignedInProfile
        profile={profile}
        editing={false}
        fullName=""
        nik=""
        error=""
        saving={false}
        onEdit={onEdit}
        onFullNameChange={jest.fn()}
        onNikChange={jest.fn()}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        onSignOut={onSignOut}
      />,
    );

    expect(screen.getByText("Akun")).toBeTruthy();
    expect(screen.queryByText(/NIK /)).toBeNull();
    fireEvent.press(screen.getByTestId("profile-edit"));
    fireEvent.press(screen.getByTestId("profile-sign-out"));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
