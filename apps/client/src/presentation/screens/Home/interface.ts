/** Home screen fragment types. */
import type { EventSummary } from "@domain/repositories/event.repository";

export interface HomeErrorProps {
  readonly error?: unknown;
  readonly onRetry: () => void;
  readonly isRetrying: boolean;
}

export interface HomeSectionsProps {
  readonly data: {
    readonly upcoming: readonly EventSummary[];
    readonly history: readonly EventSummary[];
  };
  readonly isDesktop: boolean;
  readonly columns: 1 | 2 | 3;
  readonly onPressEvent: (eventId: string) => void;
  readonly onPressHistoryEvent: (eventId: string) => void;
  readonly onFilter: () => void;
  readonly onFeaturedLayout: (y: number) => void;
  readonly onHistoryLayout: (y: number) => void;
  /** "Lihat Semua" → /browse */
  readonly onSeeAll: () => void;
  /** Screen-owned navigation for footer links. */
  readonly onNavigate: (href: string) => void;
}
