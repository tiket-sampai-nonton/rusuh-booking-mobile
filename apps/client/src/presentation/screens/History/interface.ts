/** History screen prop + fragment types (RBT-034). */
import type { EventSummary } from "@domain/repositories/event.repository";

export interface HistoryGridProps {
  readonly events: readonly EventSummary[];
  readonly onPress: (id: string) => void;
  readonly columns?: number;
}
