import { Fragment } from "react";

import { Seo } from "@presentation/components/Seo";
import { PrivacyPolicyScreen } from "@presentation/screens/PrivacyPolicy";

export default function PrivacyRoute() {
  return (
    <Fragment>
      <Seo
        title="Kebijakan Privasi"
        description="Informasi tentang pemrosesan data untuk layanan tiket Rusuh Booking."
        path="/privacy"
      />
      <PrivacyPolicyScreen />
    </Fragment>
  );
}
