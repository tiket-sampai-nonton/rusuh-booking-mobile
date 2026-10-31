// Public route `/browse` — URL-driven filtered event results (RBT-002).
// Routing-only shell: mounts the presentation screen (ARCHITECTURE §3).
import { BrowseScreen } from "@presentation/screens/Browse";

export default function BrowseRoute() {
  return <BrowseScreen />;
}
