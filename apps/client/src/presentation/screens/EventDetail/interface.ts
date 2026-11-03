/** EventDetail screen prop + fragment types. */
import type { ReactNode } from "react";

import type { EventDetail } from "@domain/repositories/event.repository";
import type { EventCategory } from "@domain/rules/event-description";

export interface EventDetailScreenProps {
  readonly eventId: string;
}

export interface BlockProps {
  readonly label: string;
  readonly heading?: string;
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

export interface CategoriesProps {
  readonly categories: readonly EventCategory[];
}

export interface BuyBoxProps {
  readonly event: EventDetail;
  readonly dateTxt: string;
  readonly timeTxt: string;
  /** True when the CTA is active (status AVAILABLE). */
  readonly canJoin: boolean;
  readonly ctaLabel: string;
  readonly onJoin: () => void;
}
