/**
 * Touch-target helpers (RBT-090) — framework-free.
 *
 * WCAG 2.5.5 (Enhanced) / Apple HIG recommend a minimum interactive target of
 * 44×44pt (Material uses 48dp). Controls that can grow use `TAP_MIN` as a
 * `minHeight`/`minWidth`; controls that must stay visually compact (chips,
 * pills, text links) keep their pixel size and widen only the HIT REGION via
 * `tapSlop`, which returns a React Native `hitSlop` that pads a short/narrow
 * control out to `TAP_MIN` on each axis. Pure math — no RN import — so it is
 * unit-testable and usable from any layer.
 */

/** Minimum interactive target size, in points (WCAG 2.5.5 / Apple HIG). */
export const TAP_MIN = 44;

export interface HitSlop {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

/**
 * Compute a symmetric `hitSlop` that expands a control's touch region up to
 * `TAP_MIN` on each axis, without changing its rendered size.
 *
 * @param renderedWidth  the control's visual width in pt
 * @param renderedHeight the control's visual height in pt
 * @param min            target floor (defaults to TAP_MIN)
 * @returns a hitSlop; 0 on an axis already ≥ min (never negative).
 *
 * Example: a 120×33 chip → `{ top: 6, bottom: 6, left: 0, right: 0 }`
 * (height 33 → +11 split as 5.5/5.5 rounded; width already ≥ 44 → 0).
 */
export function tapSlop(
  renderedWidth: number,
  renderedHeight: number,
  min: number = TAP_MIN,
): HitSlop {
  const padX = Math.max(0, (min - renderedWidth) / 2);
  const padY = Math.max(0, (min - renderedHeight) / 2);
  return {
    left: Math.round(padX),
    right: Math.round(padX),
    top: Math.round(padY),
    bottom: Math.round(padY),
  };
}

/**
 * A square `hitSlop` padding every side by the same amount — for icon buttons
 * whose rendered size is a known square below the floor.
 */
export function tapSlopSquare(renderedSize: number, min: number = TAP_MIN): HitSlop {
  return tapSlop(renderedSize, renderedSize, min);
}
