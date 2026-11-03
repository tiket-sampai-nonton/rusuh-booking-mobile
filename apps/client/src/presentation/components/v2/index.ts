/**
 * RBT-096 — V2 Brutalist Mono Components (Re-implementation)
 *
 * Shared chrome + animation primitives for the V2 design system.
 * All components honor reduced-motion preferences.
 * Web-only pieces (cursor, scroll-progress) render nothing on native.
 *
 * Source of truth: `.genesis/prototype/v2/MASTER-SPEC.md`
 */

// Button with ink-spread fill animation (§2.1)
export { V2Button } from './V2Button';
export type { V2ButtonProps, V2ButtonVariant } from './V2Button';

// Input with focus lift + shadow (§2.2)
export { V2Input } from './V2Input';
export type { V2InputProps, V2InputState } from './V2Input';

// Loading screen with bouncing wordmark (§2.3)
export { V2Loader } from './V2Loader';
export type { V2LoaderProps } from './V2Loader';

// Modal with backdrop blur and scale entrance (§2.4)
export { V2Modal } from './V2Modal';
export type { V2ModalProps } from './V2Modal';

// Toast notifications (§2.5)
export { V2ToastProvider, useV2Toast, useV2Toast as useV2ToastContext } from './V2Toast';
export type { V2ToastVariant, V2ToastData } from './V2Toast';

// Section reveal animation (§5)
export { V2Reveal, V2RevealStagger } from './V2Reveal';
export type { V2RevealProps, V2RevealStaggerProps } from './V2Reveal';

// Custom cursor — web + fine-pointer only
export { V2Cursor } from './V2Cursor';

// Scroll progress bar — web only
export { V2ScrollProgress } from './V2ScrollProgress';

// ═══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN COMPONENTS (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════════

// Header with slide-in animation (§3.1)
export { V2Header } from './V2Header';
export type { V2HeaderProps } from './V2Header';

// Hero carousel with Ken Burns + grayscale images (§3.1)
export { V2HeroCarousel } from './V2HeroCarousel';
export type { V2HeroCarouselProps } from './V2HeroCarousel';

// Event card with 3D tilt + grayscale→color hover (§3.1)
export { V2EventCard } from './V2EventCard';
export type { V2EventCardProps } from './V2EventCard';

// Category card with reveal animation (§3.1)
export { V2CategoryCard } from './V2CategoryCard';
export type { V2CategoryCardProps } from './V2CategoryCard';
