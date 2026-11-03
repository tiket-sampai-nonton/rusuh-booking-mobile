/**
 * EventDetail V2 screen prop + fragment types.
 *
 * V2 adds: LineupItem, VenueInfo, GalleryState for new V2 sections.
 */
import type { ReactNode } from "react";

import type { EventDetail } from "@domain/repositories/event.repository";
import type { EventCategory } from "@domain/rules/event-description";

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface EventDetailScreenProps {
  readonly eventId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED FRAGMENT PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BlockProps {
  readonly label: string;
  readonly heading?: string;
  readonly children: ReactNode;
}

export interface FactProps {
  readonly label: string;
  readonly value: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface DetailHeroProps {
  readonly banner: string;
  readonly statusLabel: string;
  readonly name: string;
  readonly meta: string;
  readonly chips: readonly string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CategoriesProps {
  readonly categories: readonly EventCategory[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUY BOX / FLOATING CTA PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BuyBoxProps {
  readonly event: EventDetail;
  readonly dateTxt: string;
  readonly timeTxt: string;
  /** True when the CTA is active (status AVAILABLE). */
  readonly canJoin: boolean;
  readonly ctaLabel: string;
  readonly onJoin: () => void;
}

export interface FloatingCTAProps {
  readonly event: EventDetail;
  readonly canJoin: boolean;
  readonly ctaLabel: string;
  readonly onJoin: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// V2: LINEUP PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface LineupItem {
  readonly name: string;
  readonly role: string;
  readonly avatar?: string;
}

export interface LineupProps {
  readonly items: readonly LineupItem[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// V2: VENUE PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface VenueInfo {
  readonly name: string;
  readonly address: string;
  readonly mapImage?: string;
  readonly mapsUrl?: string;
}

export interface VenueProps {
  readonly name: string;
  readonly address: string;
  readonly mapImage?: string;
  readonly mapsUrl?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// V2: GALLERY + LIGHTBOX PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface GalleryProps {
  readonly images: readonly string[];
  readonly onImagePress?: (index: number) => void;
}

export interface LightboxState {
  visible: boolean;
  currentIndex: number;
}

export interface LightboxProps {
  readonly images: readonly string[];
  readonly currentIndex: number;
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onNavigate: (index: number) => void;
}
