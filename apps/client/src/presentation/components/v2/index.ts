/**
 * V2 Brutalist Mono shared primitives (RBT-087) — public surface.
 *
 * Reusable chrome + animation primitives every V2 screen composes. All honor
 * reduced-motion; web-only pieces (cursor, scroll-progress) render nothing on
 * native. Presentation-only — no domain/infrastructure imports.
 */
export { V2Button } from "./V2Button";
export type { V2ButtonProps, V2ButtonVariant } from "./V2Button";
export { V2Reveal, V2RevealStagger } from "./V2Reveal";
export type { V2RevealProps, V2RevealStaggerProps } from "./V2Reveal";
export { V2Loader } from "./V2Loader";
export type { V2LoaderProps } from "./V2Loader";
export { V2Modal } from "./V2Modal";
export type { V2ModalProps } from "./V2Modal";
export { useV2Toast, V2ToastProvider, useV2ToastContext } from "./V2Toast";
export type { V2ToastType, V2ToastController } from "./V2Toast";
export { V2Cursor } from "./V2Cursor";
export { V2ScrollProgress } from "./V2ScrollProgress";
