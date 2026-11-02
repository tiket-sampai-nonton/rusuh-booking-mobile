/**
 * Public route `/` (Home). Routing-only: renders the Home PageScreen (RBT-030).
 *
 * The screen owns all catalog wiring (useEvents → ListEvents → EventRepository
 * port → mock) plus the hero/sections/nav + login/filter modals. The prototype
 * `#accountBtn` "Masuk / Daftar" launcher (RBT-020) lives inside HomeScreen's
 * floating nav; sign-in stays OPTIONAL and gates nothing.
 */
import { Fragment } from "react";

import { Seo } from "@presentation/components/Seo";
import { HomeScreen } from "@presentation/screens/Home";

export default function HomeRoute() {
  return (
    <Fragment>
      <Seo
        title="Rusuh Booking Tiket — Tiket Konser & Event"
        description="Pesan tiket konser dan event favoritmu dengan antrean adil dan pembayaran aman. Tanpa calo, tanpa PHP."
        path="/"
      />
      <HomeScreen />
    </Fragment>
  );
}
