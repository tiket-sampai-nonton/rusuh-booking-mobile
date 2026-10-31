// Top-level route `/expired/[resourceId]`. Routing-only shell: reads the id +
// optional `reason` query and mounts the presentation screen. RBT-064.
import { useLocalSearchParams } from "expo-router";

import { ExpiredScreen } from "@presentation/screens/Expired";

export default function ExpiredRoute() {
  const { resourceId, reason } = useLocalSearchParams<{
    resourceId: string;
    reason?: string;
  }>();
  return <ExpiredScreen resourceId={resourceId ?? ""} reason={reason} />;
}
