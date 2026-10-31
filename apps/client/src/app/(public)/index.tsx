// Public route `/` (Home). Routing-only shell (ARCHITECTURE §3): it mounts the
// presentation screen, which owns all logic + the TanStack hook. RBT-030.
import { HomeScreen } from "@presentation/screens/Home";

export default function HomeRoute() {
  return <HomeScreen />;
}
