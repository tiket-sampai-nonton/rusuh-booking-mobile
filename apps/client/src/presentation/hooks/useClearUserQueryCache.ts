import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

/** Keep TanStack cache operations behind the presentation hook seam. */
export function useClearUserQueryCache() {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.clear(), [queryClient]);
}
