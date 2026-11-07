import { Fragment } from "react";

import { Seo } from "@presentation/components/Seo";
import { ProfileScreen } from "@presentation/screens/Profile";

export default function ProfileRoute() {
  return (
    <Fragment>
      <Seo
        title="Profile"
        description="Manage your Rusuh Tiket profile."
        path="/profile"
        noindex
      />
      <ProfileScreen />
    </Fragment>
  );
}
