/**
 * Public route `/` (Home). Routing-only: renders the Home PageScreen (RBT-030).
 *
 * The screen owns all catalog wiring (useEvents → ListEvents → EventRepository
 * port → mock) plus the hero/sections/nav + login/filter modals. The prototype
 * `#accountBtn` "Masuk / Daftar" launcher (RBT-020) lives inside HomeScreen's
 * floating nav; sign-in stays OPTIONAL and gates nothing.
 */
import { HomeScreen } from "@presentation/screens/Home";

export default function HomeRoute() {
  return <HomeScreen />;
}
