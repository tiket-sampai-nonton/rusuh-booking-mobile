/** Browse screen prop + fragment types. */
import type { EventSummary } from "@domain/repositories/event.repository";

export interface BrowseTopBarProps {
  readonly onHome: () => void;
}

export interface BrowseChipsProps {
  readonly genre: string;
  readonly time: string;
  readonly sort: string;
  readonly isFiltered: boolean;
  readonly onRefine: () => void;
  readonly onReset: () => void;
}

export interface BrowseChipProps {
  readonly label: string;
  readonly value: string;
}

export interface BrowseGridProps {
  readonly events: readonly EventSummary[];
  readonly onPress: (id: string) => void;
  readonly columns?: 1 | 2 | 3;
}
