/**
 * LoginButton — the "Masuk / Daftar" launcher (RBT-020).
 *
 * Reusable presentation component that mirrors the prototype nav button
 * (`#accountBtn`, label "Masuk / Daftar"). It owns the open/close state of the
 * {@link LoginModal} so a caller can simply drop `<LoginButton />` into the Home
 * nav. Sign-in is OPTIONAL (D8.5): this is an entry point, it gates nothing.
 */
import React, { useCallback, useState } from "react";
import { Pressable, Text } from "react-native";

import { LoginModal } from "@presentation/components/auth/LoginModal";
import { componentStyles } from "./style";

export interface LoginButtonProps {
  /** Optional style override for host-specific nav placement. */
  readonly testID?: string;
}

export function LoginButton({
  testID = "login-launcher",
}: LoginButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        onPress={show}
        style={componentStyles.elementBorderRadius0}
      >
        <Text style={componentStyles.elementFontWeight1}>Masuk / Daftar</Text>
      </Pressable>
      {/* Mount the modal (and its useAuth hook) only when open, so the Home
          landing renders without requiring a ServiceProvider until the user
          actually launches sign-in. */}
      {open && <LoginModal visible onClose={hide} />}
    </>
  );
}
