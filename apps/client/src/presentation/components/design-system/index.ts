/**
 * RBT-096 —  Brutalist Mono Components (Re-implementation)
 * RBT-097 — Mobile-specific components (BottomNav)
 *
 * Shared chrome + animation primitives for the  design system.
 * All components honor reduced-motion preferences.
 * Web-only pieces (cursor, scroll-progress) render nothing on native.
 * Native-only pieces (bottom-nav) render nothing on web.
 *
 * Source of truth: `.genesis/prototype/v2/MASTER-SPEC.md`
 * Mobile divergences: `.genesis/prototype/v2-mobile/`
 */

// Button with ink-spread fill animation (§2.1)
export { Button } from "./Button";
export type { ButtonProps, ButtonVariant } from "./Button";

// Input with focus lift + shadow (§2.2)
export { Input } from "./Input";
export type { InputProps, InputState } from "./Input";

// Loading screen with bouncing wordmark (§2.3)
export { Loader } from "./Loader";
export type { LoaderProps } from "./Loader";

// Modal with backdrop blur and scale entrance (§2.4)
export { Modal } from "./Modal";
export type { ModalProps } from "./Modal";

// Toast notifications (§2.5)
export { ToastProvider, useToast, useToast as useToastContext } from "./Toast";
export type { ToastVariant, ToastData } from "./Toast";

// Section reveal animation (§5)
export { Reveal, RevealStagger } from "./Reveal";
export type { RevealProps, RevealStaggerProps } from "./Reveal";

// Custom cursor — web + fine-pointer only
export { Cursor } from "./Cursor";

// Scroll progress bar — web only
export { ScrollProgress } from "./ScrollProgress";

// ═══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN COMPONENTS (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════════

// Header with slide-in animation (§3.1)
// Mobile: 56px height, Desktop: 60px height
export { Header } from "./Header";
export type { HeaderProps } from "./Header";

// Hero carousel with Ken Burns + grayscale images (§3.1)
// Mobile: 70vh height, Desktop: 100vh height
export { HeroCarousel } from "./HeroCarousel";
export type { HeroCarouselProps } from "./HeroCarousel";

// Event card with 3D tilt + grayscale→color hover (§3.1)
export { EventCard } from "./EventCard";
export type { EventCardProps } from "./EventCard";

// Category card with reveal animation (§3.1)
export { CategoryCard } from "./CategoryCard";
export type { CategoryCardProps } from "./CategoryCard";

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE-SPECIFIC COMPONENTS (RBT-097)
// ═══════════════════════════════════════════════════════════════════════════════

// Bottom navigation bar — native (iOS/Android) only
// Height: 72px + safe-area-inset-bottom
// On web, Header handles navigation instead
export { BottomNav } from "./BottomNav";
export type { BottomNavProps, BottomNavRoute } from "./BottomNav";
export { navigateBottomTab } from "./BottomNav/navigation";
