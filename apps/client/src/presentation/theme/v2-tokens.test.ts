import tailwind from '../../../tailwind.config.js';

import {
  v2,
  v2Border,
  v2Font,
  v2Motion,
  v2Tokens,
  v2Zone,
  v2Colors,
  v2Borders,
  v2Fonts,
  v2Easing,
  v2EasingCSS,
  v2ZoneBanners,
} from './v2-tokens';

// The tailwind config's v2 color namespace — the single source of truth the
// raw tokens must mirror.
const twV2 = (tailwind as { theme?: { extend?: { colors?: { v2?: Record<string, string> } } } }).theme?.extend?.colors
  ?.v2 as Record<string, string> | undefined;

describe('RBT-096 V2 Brutalist Mono tokens (Re-implementation)', () => {
  describe('v2Colors (new API)', () => {
    it('exposes the core palette per MASTER-SPEC §1', () => {
      expect(v2Colors).toMatchObject({
        ground: '#ffffff',
        ink: '#000000',
        inkMuted: '#666666',
        field: '#f5f5f5',
        danger: '#ff0000',
        success: '#00aa00',
        warning: '#ff6600',
      });
    });

    it('includes legacy aliases for backwards compatibility', () => {
      expect(v2Colors.muted).toBe('#666666');
      expect(v2Colors.warn).toBe('#ff6600');
      expect(v2Colors.accent).toBe('#000000');
    });
  });

  describe('v2 legacy alias', () => {
    it('is an alias for v2Colors for backwards compatibility', () => {
      expect(v2).toBe(v2Colors);
    });
  });

  describe('v2Borders (new API)', () => {
    it('defines border widths per MASTER-SPEC §1', () => {
      expect(v2Borders.standard).toBe(2);
      expect(v2Borders.thick).toBe(3); // Waiting room only
      expect(v2Borders.thin).toBe(1);
    });
  });

  describe('v2Border legacy alias', () => {
    it('maps to v2Borders for backwards compatibility', () => {
      expect(v2Border.base).toBe(v2Borders.standard);
      expect(v2Border.heavy).toBe(v2Borders.thick);
    });
  });

  describe('v2Fonts (new API)', () => {
    it('defines fonts per MASTER-SPEC §1', () => {
      expect(v2Fonts.sans).toBe('Inter');
      expect(v2Fonts.mono).toBe('JetBrains Mono');
    });
  });

  describe('v2Font legacy alias', () => {
    it('is an alias for v2Fonts for backwards compatibility', () => {
      expect(v2Font).toBe(v2Fonts);
    });
  });

  describe('v2Easing (new API)', () => {
    it('exposes easing curves as Reanimated bezier tuples', () => {
      expect(v2Easing.primary).toEqual([0.16, 1, 0.3, 1]);
      expect(v2Easing.out).toEqual([0.33, 1, 0.68, 1]);
      expect(v2Easing.elastic).toEqual([0.68, -0.6, 0.32, 1.6]);
    });
  });

  describe('v2EasingCSS (new API)', () => {
    it('exposes easing curves as CSS cubic-bezier strings', () => {
      expect(v2EasingCSS.primary).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
      expect(v2EasingCSS.out).toBe('cubic-bezier(0.33, 1, 0.68, 1)');
    });
  });

  describe('v2Motion legacy alias', () => {
    it('maps to v2EasingCSS for backwards compatibility', () => {
      expect(v2Motion.ease).toBe(v2EasingCSS.primary);
      expect(v2Motion.easeBezier).toEqual(v2Easing.primary);
      expect(v2Motion.elasticBezier).toEqual(v2Easing.elastic);
    });
  });

  describe('v2ZoneBanners (new API)', () => {
    it('defines waiting room zone banner colors per MASTER-SPEC §3.3', () => {
      expect(v2ZoneBanners.guaranteed).toEqual({ bg: '#e8f5e9', border: '#2e7d32', text: '#1b5e20' });
      expect(v2ZoneBanners.possible).toEqual({ bg: '#fff3e0', border: '#f57c00', text: '#e65100' });
      expect(v2ZoneBanners.notEnough).toEqual({ bg: '#ffebee', border: '#c62828', text: '#b71c1c' });
    });
  });

  describe('v2Zone legacy alias', () => {
    it('maps to v2ZoneBanners for backwards compatibility', () => {
      expect(v2Zone.ok).toEqual(v2ZoneBanners.guaranteed);
      expect(v2Zone.warn).toEqual(v2ZoneBanners.possible);
      expect(v2Zone.bad).toEqual(v2ZoneBanners.notEnough);
    });
  });

  describe('v2Tokens (new API)', () => {
    it('bundles all token groups', () => {
      expect(v2Tokens.colors).toBe(v2Colors);
      expect(v2Tokens.borders).toBe(v2Borders);
      expect(v2Tokens.fonts).toBe(v2Fonts);
      expect(v2Tokens.easing).toBe(v2Easing);
      expect(v2Tokens.easingCSS).toBe(v2EasingCSS);
      expect(v2Tokens.zoneBanners).toBe(v2ZoneBanners);
    });
  });

  // Only run tailwind sync tests if twV2 is available
  if (twV2) {
    describe('Tailwind sync', () => {
      it('MIRRORS the tailwind.config.js v2 namespace for core colors', () => {
        // Every core raw token equals its tailwind counterpart — no drift.
        (['ink', 'ground', 'field'] as const).forEach((k) => {
          if (twV2[k]) {
            expect(v2Colors[k]).toBe(twV2[k]);
          }
        });
      });
    });
  }
});
