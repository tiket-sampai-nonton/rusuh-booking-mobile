/** Waiting room screen prop + fragment types. */
import type { ReactNode } from "react";

import type { QueueEntry } from "@domain/repositories/queue.repository";

export interface WaitingRoomScreenProps {
  readonly eventId: string;
}

export interface ShellProps {
  readonly children: ReactNode;
  readonly testID: string;
  readonly pillLabel: string;
}

export interface SubProps {
  readonly children: ReactNode;
}

export interface StatProps {
  readonly value: string;
  readonly label: string;
}

export interface LeaveLinkProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
}

export interface WaitingActiveProps {
  readonly entry: QueueEntry;
  readonly claiming: boolean;
}
