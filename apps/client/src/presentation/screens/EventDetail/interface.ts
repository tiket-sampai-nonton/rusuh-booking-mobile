/** EventDetail screen prop + fragment types. */
import type { ReactNode } from "react";

import type { EventDetail } from "@domain/repositories/event.repository";

export interface EventDetailScreenProps {
  readonly eventId: string;
}

export interface BlockProps {
  readonly label: string;
  readonly heading?: string;
  readonly gap?: boolean;
  readonly children: ReactNode;
}

export interface FactProps {
  readonly label: string;
  readonly value: string;
}

export interface DetailHeroProps {
  readonly banner: string;
  readonly statusLabel: string;
  readonly name: string;
  readonly meta: string;
  readonly chips: readonly string[];
}

export interface BuyBoxProps {
  readonly event: EventDetail;
  readonly dateTxt: string;
  readonly timeTxt: string;
  readonly canJoin: boolean;
  readonly pending: boolean;
  readonly ctaLabel: string;
  readonly errorMessage?: string;
  readonly onJoin: () => void;
}
