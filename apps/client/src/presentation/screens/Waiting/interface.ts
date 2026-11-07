/** RBT-043 — Waiting room screen prop + fragment types. */
import type { ReactNode } from "react";

import type {
  QueueEntry,
  QueueZone,
} from "@domain/repositories/queue.repository";

/**
 * The waiting room is driven by a `queueId` (the persisted queue entry, from the
 * join flow — RBT-041) and the route's `eventId`. Both arrive as props from the
 * route file so the screen stays routing-agnostic and testable.
 */
export interface WaitingRoomScreenProps {
  readonly queueId: string;
  readonly eventId: string;
}

export interface ShellProps {
  readonly children: ReactNode;
  readonly testID: string;
}

export interface PositionRingProps {
  /** 0..1 fill fraction of the ring. */
  readonly progress: number;
  readonly children: ReactNode;
}

export interface ZoneBannerProps {
  readonly zone: QueueZone;
}

export interface StatProps {
  readonly value: string;
  readonly label: string;
  readonly testID: string;
}

export interface WaitingActiveProps {
  readonly entry: QueueEntry;
}
