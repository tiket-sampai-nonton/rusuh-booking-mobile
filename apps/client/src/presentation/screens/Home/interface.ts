/** Home screen fragment types. */
import type { EventSummary } from "@domain/repositories/event.repository";

export interface HomeNavProps {
  readonly showLinks: boolean;
  readonly width: number;
  readonly topInset: number;
  readonly onJelajah: () => void;
  readonly onHistory: () => void;
  readonly onKategori: () => void;
  readonly onAccount: () => void;
}

export interface HomeErrorProps {
  readonly message?: string;
}

export interface CardGridProps {
  readonly events: readonly EventSummary[];
  readonly onPress: (eventId: string) => void;
  readonly history?: boolean;
  readonly emptyText: string;
  /** Column count — 1 on native/phone, 2–3 on desktop web (prototype grid). */
  readonly columns?: 1 | 2 | 3;
}

export interface HomeSectionsProps {
  readonly data: {
    readonly upcoming: readonly EventSummary[];
    readonly history: readonly EventSummary[];
  };
  readonly isDesktop: boolean;
  readonly columns: 1 | 2 | 3;
  readonly onPressEvent: (eventId: string) => void;
  readonly onFilter: () => void;
  readonly onFeaturedLayout: (y: number) => void;
  readonly onHistoryLayout: (y: number) => void;
}
